/**
 * The spectra of one of the example VAMAS files, read the way the viewer reads
 * a dropped file, for the tests that need a measured survey rather than a
 * synthetic one.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadSpectra } from '../loadSpectra.ts';
import type { XpsSpectrum } from '../xpsSpectrum.ts';

/** The spectra of a file, and its survey scan. */
export interface VamasFixture {
  /** Every block of the file, in the order the file holds them. */
  spectra: XpsSpectrum[];
  /** Its first survey scan. */
  survey: XpsSpectrum;
}

/**
 * Read one of the example files.
 * @param name - Its name in `data/`, without the extension.
 * @returns Its spectra, and the first survey among them.
 */
export async function vamasFixture(name: string): Promise<VamasFixture> {
  const bytes = readFileSync(join(import.meta.dirname, 'data', `${name}.vms`));
  const { spectra } = await loadSpectra(bytes, {
    fileName: `${name}.vms`,
    idPrefix: name,
  });
  const survey = spectra.find(
    (spectrum) => spectrum.transition.element === null,
  );
  if (survey === undefined) throw new Error(`${name} holds no survey`);
  return { spectra, survey };
}
