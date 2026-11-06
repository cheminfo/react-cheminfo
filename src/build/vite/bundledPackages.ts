/**
 * List what a build actually hands to its visitors.
 *
 * The list cannot be read off a manifest, which also names what tree-shaking
 * removed, and it cannot reach the page through a module, because it only
 * exists once the bundle does. So it is read off the finished bundle, workers
 * included, and written beside it.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import type { BundledPackage } from '../core/bundledPackages.ts';
import {
  BUNDLED_PACKAGES_FILE,
  LICENSE_TEXTS_FILE,
} from '../core/bundledPackages.ts';

/** What a bundle is read for, whichever bundler wrote it. */
type BundleToRead = Record<
  string,
  { type: string; modules?: Record<string, { renderedLength: number }> }
>;

/** Gathers the packages of a build's bundles, and writes the two files. */
export interface PackageCollector {
  /**
   * Read one finished bundle.
   * @param bundle - The bundle, as `generateBundle` receives it.
   */
  record: (bundle: BundleToRead) => void;
  /**
   * Write `packages.json` and `licenses.txt`, unless nothing was recorded.
   * @param directory - The directory the build wrote to.
   */
  write: (directory: string) => void;
  /** The plugin reading a worker's bundle, which the page's build never sees. */
  workerPlugin: Plugin;
}

/**
 * Start gathering the packages of one build.
 * @returns The collector.
 */
export function createPackageCollector(): PackageCollector {
  const directories = new Map<string, BundledPackage | undefined>();

  function record(bundle: BundleToRead): void {
    for (const file of Object.values(bundle)) {
      for (const [id, rendered] of Object.entries(file.modules ?? {})) {
        // Tree-shaking left the module in the graph and nothing of it on disk.
        if (rendered.renderedLength === 0 || id.startsWith('\0')) continue;
        const directory = PACKAGE_DIRECTORY.exec(id)?.groups?.directory;
        if (directory === undefined || directories.has(directory)) continue;
        directories.set(directory, readPackage(directory));
      }
    }
  }

  function write(directory: string): void {
    const listed = new Map<string, [string, BundledPackage]>();
    for (const [source, entry] of directories) {
      if (entry !== undefined) {
        listed.set(`${entry.name}@${entry.version}`, [source, entry]);
      }
    }
    if (listed.size === 0) return;

    const sorted = [...listed.values()].toSorted(([, a], [, b]) =>
      a.name === b.name
        ? a.version.localeCompare(b.version)
        : a.name.localeCompare(b.name),
    );
    writeFileSync(
      join(directory, BUNDLED_PACKAGES_FILE),
      `${JSON.stringify(sorted.map(([, entry]) => entry))}\n`,
    );
    writeFileSync(
      join(directory, LICENSE_TEXTS_FILE),
      sorted.map(([source, entry]) => licenseBlock(source, entry)).join('\n'),
    );
  }

  return {
    record,
    write,
    workerPlugin: {
      name: 'cheminfo-bundled-packages',
      generateBundle(_options, bundle) {
        record(bundle);
      },
    },
  };
}

/**
 * Whether a package is one the family maintains.
 * @param name - Its name on npm.
 * @param repository - The `repository` of its manifest, as written there.
 * @returns Whether it is ours.
 */
export function isOwnPackage(name: string, repository: unknown): boolean {
  if (OWN_WITHOUT_REPOSITORY.has(name) || name.startsWith(OWN_SCOPE)) {
    return true;
  }
  const url =
    typeof repository === 'object' && repository !== null
      ? (repository as { url?: unknown }).url
      : repository;
  return typeof url === 'string' && OWN_REPOSITORY.test(url);
}

/** The folder of the package a module belongs to, the innermost one. */
const PACKAGE_DIRECTORY =
  /^(?<directory>.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//;

/** An address on GitHub, or the `org/name` shorthand npm also accepts. */
const OWN_REPOSITORY =
  /(?:^|^github:|github\.com[/:])(?:cheminfo|cheminfo-js|mljs|image-js|zakodium|zakodium-oss)\/[^/]+/i;

const OWN_SCOPE = '@zakodium/';

/** Ours, in a published version whose manifest names no repository. */
const OWN_WITHOUT_REPOSITORY = new Set(['inchi-js', 'iupac-names']);

/** Left off the list and the licence texts by decision. */
const UNLISTED = new Set(['jcampconverter', '@peterspackman/occjs']);

const LICENSE_FILE = /^(?:licen[cs]e|copying|notice)/i;

const SEPARATOR = '='.repeat(72);

function readPackage(directory: string): BundledPackage | undefined {
  const manifest = readManifest(directory);
  const { name, version, repository } = manifest;
  if (typeof name !== 'string' || typeof version !== 'string') return undefined;
  if (UNLISTED.has(name)) return undefined;

  const license = licenseOf(manifest);
  return {
    name,
    version,
    ...(license === undefined ? {} : { license }),
    own: isOwnPackage(name, repository),
  };
}

function readManifest(directory: string): Record<string, unknown> {
  try {
    return JSON.parse(
      readFileSync(join(directory, 'package.json'), 'utf8'),
    ) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * The licence a manifest declares, in any of the shapes npm has accepted.
 * @param manifest - The parsed `package.json`.
 * @returns The licence, or `undefined` when none is declared.
 */
function licenseOf(manifest: Record<string, unknown>): string | undefined {
  const declared = manifest.license ?? manifest.licenses;
  const entries: unknown[] = Array.isArray(declared) ? declared : [declared];
  const names: string[] = [];
  for (const entry of entries) {
    const name =
      typeof entry === 'object' && entry !== null
        ? (entry as { type?: unknown }).type
        : entry;
    if (typeof name === 'string' && name.trim() !== '') names.push(name.trim());
  }
  return names.length === 0 ? undefined : names.join(' OR ');
}

function licenseBlock(source: string, entry: BundledPackage): string {
  const licensed = entry.license === undefined ? '' : ` (${entry.license})`;
  const heading = `${entry.name} ${entry.version}${licensed}`;
  return [SEPARATOR, heading, SEPARATOR, '', ...licenseTexts(source), ''].join(
    '\n',
  );
}

function licenseTexts(directory: string): string[] {
  const texts: string[] = [];
  for (const file of readdirSync(directory).toSorted()) {
    if (LICENSE_FILE.test(file)) {
      texts.push(readFileSync(join(directory, file), 'utf8').trim(), '');
    }
  }
  return texts;
}
