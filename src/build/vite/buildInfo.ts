/**
 * Tell a site which build of itself it is running.
 *
 * Every site of the family carries an About page, and the one thing that page
 * cannot state from a hand-written record is the release it is serving. So the
 * build states it: the plugin resolves the version, the day and the commit
 * once, hands them to the page through a virtual module, and writes the same
 * record to `build-info.json` so the whole family can be asked what it is
 * running with one request each.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { Plugin } from 'vite';

import type { BuildInfo } from '../core/buildInfo.ts';
import { UNRELEASED_VERSION } from '../core/buildInfo.ts';

import { commitFromEnvironment, readGitHead } from './gitHead.ts';

/** The module a site imports its build record from. */
export const BUILD_INFO_MODULE = 'react-cheminfo/build-info';

/** What the build writes about itself. */
export interface BuildInfoOptions {
  /**
   * Where the record is written in the build, so a deployment can be asked
   * what it is running. `false` writes none.
   * @default 'build-info.json'
   */
  fileName?: string | false;
}

/**
 * Resolve the build's own version, instant and commit, and publish them.
 *
 * The site reads them from the module the plugin fills in:
 *
 * ```ts
 * import { BUILD_INFO } from 'react-cheminfo/build-info';
 * ```
 *
 * That module exists on disk and exports `undefined`, so a Playwright spec or
 * a unit test importing the same About record in plain Node still resolves it —
 * a virtual specifier does not, and the whole suite dies on the import.
 * @param options - See {@link BuildInfoOptions}.
 * @returns The Vite plugin.
 */
export function cheminfoBuildInfo(options: BuildInfoOptions = {}): Plugin {
  const { fileName = 'build-info.json' } = options;
  let root = process.cwd();
  let outDir = 'dist';
  let info: BuildInfo = resolveBuildInfo(root);

  return {
    name: 'cheminfo-build-info',
    // Vite's own resolver runs first and would hand back the module on disk,
    // which exports `undefined`; and the dependency optimizer pre-bundles a
    // bare specifier without asking a plugin at all.
    enforce: 'pre',
    config() {
      return { optimizeDeps: { exclude: [BUILD_INFO_MODULE] } };
    },
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
      info = resolveBuildInfo(root);
    },
    resolveId(id) {
      return id === BUILD_INFO_MODULE ? RESOLVED_MODULE : undefined;
    },
    load(id) {
      if (id !== RESOLVED_MODULE) return undefined;
      return `export const BUILD_INFO = ${JSON.stringify(info)};\n`;
    },
    closeBundle() {
      if (fileName === false) return;
      const target = resolve(root, outDir, fileName);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `${JSON.stringify(info, null, 2)}\n`);
    },
  };
}

/**
 * What the build knows about itself, read off the checkout it runs in.
 * @param root - The project Vite is building, which may sit under the
 *   repository root as `frontend` does.
 * @returns The record, with whatever it could not resolve left out.
 */
export function resolveBuildInfo(root: string): BuildInfo {
  const repository = findRepositoryRoot(root);

  return {
    version: readVersion(repository) ?? readVersion(root) ?? UNRELEASED_VERSION,
    builtAt: buildInstant(),
    commit: readGitHead(repository) ?? commitFromEnvironment(),
    reactCheminfo: readOwnVersion(),
  };
}

/**
 * The topmost directory of the run of ancestors that all hold a `package.json`.
 *
 * It is the repository root, and it is where the released version lives:
 * release-please bumps the root `package.json`, while the `frontend` workspace
 * of a site that has one keeps the `0.0.0` it was scaffolded with.
 * @param start - Where to start climbing.
 * @returns The highest such directory, or `start` when it holds none itself.
 */
export function findRepositoryRoot(start: string): string {
  let directory = resolve(start);
  let highest = directory;

  for (;;) {
    if (readPackage(directory) !== undefined) highest = directory;
    const parent = dirname(directory);
    // The run has ended: a directory with no package.json is above the project,
    // and so is everything above it.
    if (parent === directory || readPackage(parent) === undefined) {
      return highest;
    }
    directory = parent;
  }
}

function readVersion(directory: string): string | undefined {
  const version = readPackage(directory)?.version;
  return typeof version === 'string' && version.length > 0
    ? version
    : undefined;
}

/**
 * The version of this package, so a site can be asked which chrome it runs.
 * @returns The version, or `undefined` when the manifest is out of reach.
 */
function readOwnVersion(): string | undefined {
  let directory = import.meta.dirname;

  for (;;) {
    const manifest = readPackage(directory);
    if (manifest?.name === OWN_NAME && typeof manifest.version === 'string') {
      return manifest.version;
    }
    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

function readPackage(
  directory: string,
): { name?: unknown; version?: unknown } | undefined {
  try {
    return JSON.parse(
      readFileSync(join(directory, 'package.json'), 'utf8'),
    ) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/**
 * When the build ran, honouring `SOURCE_DATE_EPOCH` so a reproducible build
 * stays reproducible.
 * @returns The instant, to the second, as `2026-09-16T09:41:07Z`.
 */
function buildInstant(): string {
  const epoch = Number(process.env.SOURCE_DATE_EPOCH);
  const when = Number.isFinite(epoch) && epoch > 0 ? epoch * 1000 : Date.now();
  return `${new Date(when).toISOString().slice(0, SECOND_LENGTH)}Z`;
}

const RESOLVED_MODULE = `\0${BUILD_INFO_MODULE}`;
const OWN_NAME = 'react-cheminfo';
const SECOND_LENGTH = 19;
