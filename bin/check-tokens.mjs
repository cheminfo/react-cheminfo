#!/usr/bin/env node
/*
 * Report every colour a site writes that belongs to the family rather than to
 * the site: Blueprint's greys and blues, the family's own token values re-typed
 * as literals, and a palette declared by hand instead of rendered from
 * `<SiteTheme siteId>`.
 *
 * Wire it as an npm script:
 *   "check-tokens": "node node_modules/react-cheminfo/bin/check-tokens.mjs src"
 *
 * Usage: check-tokens.mjs [directory...] [--allow=#aabbcc,#ddeeff] [--fallbacks] [--quiet]
 *   directory   what to walk, `src` when none is given
 *   --allow     colours the project legitimately owns
 *   --fallbacks also read the fallback inside var(): a family token's must be its value
 *   --quiet     say nothing when the scan is clean
 *
 * Exits 1 when anything is reported, 2 when it was called wrongly, 0 otherwise.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import process from 'node:process';

import { findTokenViolations } from '../lib/core.js';

import { countOf, listOption, usageError } from './cli.mjs';

const EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.jsx', '.js']);
const SKIPPED = new Set(['node_modules', 'dist', 'lib', 'coverage']);
const ALLOW_PREFIX = '--allow=';
const TOOL = 'check-tokens';

const roots = [];
const allow = [];
let quiet = false;
let fallbacks = false;

for (const argument of process.argv.slice(2)) {
  if (argument.startsWith(ALLOW_PREFIX)) {
    allow.push(...listOption(argument.slice(ALLOW_PREFIX.length)));
  } else if (argument === '--quiet') {
    quiet = true;
  } else if (argument === '--fallbacks') {
    fallbacks = true;
  } else if (argument.startsWith('-')) {
    process.exit(usageError(TOOL, `unknown option: ${argument}`));
  } else {
    roots.push(argument);
  }
}
if (roots.length === 0) roots.push('src');

const files = [];
for (const root of roots) collect(root, files);

const violations = findTokenViolations(files, { allow, fallbacks });
let report = '';
for (const violation of violations) {
  report += `${violation.file}:${violation.line}:${violation.column}  ${violation.kind}  ${violation.text}  -> ${violation.hint}\n`;
}

if (violations.length > 0) {
  report += `${countOf(violations.length, 'violation')} in ${countOf(files.length, 'file')}\n`;
  process.stdout.write(report);
  process.exit(1);
}
if (!quiet) {
  process.stdout.write(
    `no token violation in ${countOf(files.length, 'file')}\n`,
  );
}

/**
 * Add every file worth reading under a path to the list, walking directories
 * and leaving the generated ones alone.
 * @param {string} path - A file or a directory.
 * @param {Array<{ path: string, text: string }>} files - Collected so far.
 */
function collect(path, files) {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (stats === undefined) {
    process.exit(usageError(TOOL, `no such path: ${path}`));
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || SKIPPED.has(entry.name)) continue;
      collect(join(path, entry.name), files);
    }
    return;
  }
  if (!EXTENSIONS.has(extname(path))) return;
  files.push({ path, text: readFileSync(path, 'utf8') });
}
