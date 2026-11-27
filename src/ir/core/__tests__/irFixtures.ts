/**
 * The IR spectra the tests read off disk, through the real reader.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * The five-band film, read through the real reader, under a known id.
 * @returns The spectrum, with no bands yet.
 */
export async function filmSpectrum(): Promise<IrSpectrum> {
  const { spectra } = await loadIrSpectra(
    readFileSync(join(import.meta.dirname, 'data/five-bands.jdx')),
    { fileName: 'five-bands.jdx' },
  );
  const [loaded] = spectra;
  if (loaded === undefined) throw new Error('The fixture holds no spectrum');
  return toIrSpectrum(loaded, { id: 'film' });
}
