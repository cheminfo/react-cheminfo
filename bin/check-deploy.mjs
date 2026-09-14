#!/usr/bin/env node
/*
 * Report every way a repository would break, or silently mis-deploy, under the
 * server's global deploy script: a compose file it would not find, an image with
 * no selectable tag, an `IMAGE_NAME` naming a package this repository never
 * publishes, an `env_file` that fails on a checkout with no `.env` yet, a
 * service with no health probe to read, an `.env.example` that hides a mode.
 *
 * Wire it as an npm script, next to check-tokens:
 *   "check-deploy": "cheminfo-check-deploy"
 *
 * Usage: check-deploy.mjs [--image-name=ghcr.io/owner/repo] [--compose=a,b]
 *                         [--foreign=prefix,prefix] [--no-healthcheck] [--quiet]
 *   --image-name    the package this repo publishes; read from `git remote` when omitted
 *   --compose       the compose files it ships, when not the three every site ships
 *   --foreign       image prefixes built elsewhere, exempt from the tag rule
 *   --no-healthcheck  the services are not expected to declare a healthcheck
 *   --quiet         say nothing when the scan is clean
 *
 * Exits 1 when anything is reported, 2 when it was called wrongly, 0 otherwise.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

import {
  DEPLOY_COMPOSE_FILES,
  findDeployProblems,
} from '../lib/deploy/core/index.js';

import { countOf, listOption, usageError } from './cli.mjs';

const TOOL = 'check-deploy';

let imageName;
let composeFiles;
let foreignImages;
let requireHealthcheck = true;
let quiet = false;

for (const argument of process.argv.slice(2)) {
  if (argument.startsWith('--image-name=')) {
    imageName = argument.slice('--image-name='.length);
  } else if (argument.startsWith('--compose=')) {
    composeFiles = listOption(argument.slice('--compose='.length));
  } else if (argument.startsWith('--foreign=')) {
    foreignImages = listOption(argument.slice('--foreign='.length));
  } else if (argument === '--no-healthcheck') {
    requireHealthcheck = false;
  } else if (argument === '--quiet') {
    quiet = true;
  } else {
    process.exit(usageError(TOOL, `unknown option: ${argument}`));
  }
}

imageName ??= publishedImageName();
if (imageName === undefined) {
  process.exit(
    usageError(
      TOOL,
      'no --image-name given and no github.com origin to read one from',
    ),
  );
}

// Every mode is read, present or not: a missing one is itself a problem.
const expected = composeFiles ?? DEPLOY_COMPOSE_FILES;
const files = [];
for (const path of [...expected, '.env.example', '.gitignore']) {
  const text = read(path);
  if (text !== undefined) files.push({ path, text });
}

const problems = findDeployProblems(files, {
  imageName,
  composeFiles: expected,
  foreignImages: foreignImages ?? ['cloudflare/cloudflared'],
  requireHealthcheck,
});

if (problems.length > 0) {
  let report = '';
  for (const problem of problems) {
    const where =
      problem.line === 0 ? problem.file : `${problem.file}:${problem.line}`;
    report += `${where}  ${problem.kind}  ${problem.message}\n    -> ${problem.hint}\n`;
  }
  report += `${countOf(problems.length, 'problem')} against the deployment contract\n`;
  process.stdout.write(report);
  process.exit(1);
}
if (!quiet) {
  process.stdout.write(`the deployment contract holds for ${imageName}\n`);
}

/**
 * The package this repository's own workflow publishes, read from the origin it
 * was cloned from — the one thing a compose file cannot be checked against from
 * inside itself.
 * @returns {string | undefined} `ghcr.io/<owner>/<repo>`, or undefined when there is no origin.
 */
function publishedImageName() {
  let url;
  try {
    url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
  const match = /github\.com[:/](?<owner>[^/]+)\/(?<repo>.+?)(?:\.git)?$/.exec(
    url,
  );
  if (match?.groups === undefined) return undefined;
  return `ghcr.io/${match.groups.owner}/${match.groups.repo}`;
}

/**
 * Read a file the repository may not have, because its absence is itself one of
 * the things being reported.
 * @param {string} path - What to read.
 * @returns {string | undefined} Its text, or undefined when it is not there.
 */
function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return undefined;
  }
}
