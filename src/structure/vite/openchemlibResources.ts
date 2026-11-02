/**
 * Serve the part of OpenChemLib's static resources a site's workers register.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { Plugin } from 'vite';

import { OCL_RESOURCES_FILE } from '../../worker/core/oclResourcesUrl.ts';

/** The torsion database the conformer generator reads, and the MMFF94 tables. */
export const OCL_CONFORMER_RESOURCES = [
  '/resources/cod/',
  '/resources/forcefield/',
] as const;

/** The fragment lists of the toxicity and drug-likeness predictors. */
export const OCL_PREDICTOR_RESOURCES = [
  '/resources/toxpredictor/',
  '/resources/druglikeness',
] as const;

/** Which resources a site serves, and where. */
export interface OpenchemlibResourcesOptions {
  /**
   * Prefixes of the keys kept from `resources.json` — only what the site's
   * code registers, so a visitor never downloads tables nothing reads.
   */
  keep: readonly string[];
  /**
   * The file written into `public/`, relative to the site's root.
   * @default OCL_RESOURCES_FILE
   */
  file?: string;
}

/**
 * Write the OpenChemLib resources a site needs into `public/`, so a worker can
 * fetch them, and drop the untrimmed copy Vite would otherwise ship.
 *
 * `openchemlib/dist/resources.json` is absent from the package's `exports`, so
 * it is located by resolving the main entry from the site's root and walking
 * sideways. `public/` serves it unchanged in development and copies it on
 * build: one code path. It is written from `configResolved`, which runs before
 * the dev server lists `public/` — from `buildStart` the first `npm run dev` of
 * a fresh clone answers the fetch with `index.html`.
 * @param options - See {@link OpenchemlibResourcesOptions}.
 * @returns The Vite plugin.
 * @throws {Error} When no resource matches `keep`, which would otherwise leave
 * a green build whose every registration fails at runtime.
 */
export function openchemlibResources(
  options: OpenchemlibResourcesOptions,
): Plugin {
  const { keep, file = OCL_RESOURCES_FILE } = options;
  return {
    name: 'cheminfo-openchemlib-resources',
    configResolved(config) {
      const require = createRequire(join(config.root, 'package.json'));
      const path = require
        .resolve('openchemlib')
        .replace(/openchemlib\.js$/, 'resources.json');
      const kept = keptResources(
        JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>,
        keep,
      );
      if (Object.keys(kept).length === 0) {
        throw new Error(
          `No OpenChemLib resource matched ${keep.join(', ')} in ${path}: every registration would fail at runtime with "static resources must be registered first".`,
        );
      }
      const target = join(config.publicDir, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, JSON.stringify(kept));
    },
    // `openchemlib.js` holds `new URL('resources.json', import.meta.url)` as
    // the default of `registerFromUrl()`, so Vite emits the whole 1.3 MB file
    // although every call passes an explicit address and never fetches it.
    writeBundle(output, bundle) {
      const directory = output.dir;
      if (directory === undefined) return;
      for (const fileName of Object.keys(bundle)) {
        if (!/resources-[\w-]+\.json$/.test(fileName)) continue;
        const path = join(directory, fileName);
        if (readHead(path).includes('/resources/cod/')) {
          rmSync(path, { force: true });
        }
      }
    },
  };
}

/**
 * The entries of `resources.json` whose key starts with one of the prefixes.
 * @param all - Every entry of the file.
 * @param keep - Prefixes of the keys to keep.
 * @returns The entries kept.
 */
export function keptResources(
  all: Record<string, string>,
  keep: readonly string[],
): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const key of Object.keys(all)) {
    if (keep.some((prefix) => key.startsWith(prefix))) {
      kept[key] = all[key] as string;
    }
  }
  return kept;
}

function readHead(path: string): string {
  try {
    return readFileSync(path, 'utf8').slice(0, 4096);
  } catch {
    return '';
  }
}
