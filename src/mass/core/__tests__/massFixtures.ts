import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadMassSpectra } from '../loadMassSpectra.ts';
import type { MassSpectrum } from '../massSpectrum.ts';
import { toMassSpectra } from '../toMassSpectrum.ts';

/** The fixtures every mass test reads, by file name. */
export type MassFixture =
  | 'aflatoxin-peaks.jdx'
  | 'caffeine-peaks.txt'
  | 'gcms-ntuples.jdx'
  | 'taxine-b-ms2.jdx';

/**
 * A fixture, as the viewer holds it once a drop has been read.
 *
 * Read through the real readers and the real peak picking rather than built by
 * hand, so what a test is run against is what a dropped file produces.
 * @param name - The fixture.
 * @param taken - The colours already taken.
 * @returns Its spectra, peaks picked.
 */
export async function massFixture(
  name: MassFixture,
  taken: readonly string[] = [],
): Promise<MassSpectrum[]> {
  const bytes = readFileSync(join(import.meta.dirname, 'data', name));
  const { spectra } = await loadMassSpectra(bytes, { fileName: name });
  return toMassSpectra(spectra, { taken });
}

/**
 * The one spectrum a fixture holds, or the first of several.
 * @param name - The fixture.
 * @returns The spectrum.
 * @throws {Error} When the fixture holds none, which would make every test
 * using it pass for the wrong reason.
 */
export async function firstMassFixture(
  name: MassFixture,
): Promise<MassSpectrum> {
  const [first] = await massFixture(name);
  if (first === undefined) throw new Error(`${name} holds no spectrum`);
  return first;
}

/** What a peak list built by hand is varied by. */
export interface PeakListOptions {
  /**
   * The charge established for each peak, `0` where none was.
   * @default every peak singly charged
   */
  charge?: number[];
  /**
   * Whether the centroid sticks are drawn.
   * @default true
   */
  showCentroid?: boolean;
}

/**
 * A spectrum of nothing but the peaks a test names, for questions about what is
 * done with picked peaks rather than about how they were picked.
 * @param id - Its identity, which is also its name.
 * @param mz - The peak positions, ascending.
 * @param intensity - The height of each.
 * @param options - See {@link PeakListOptions}.
 * @returns The spectrum, drawn as its sticks.
 */
export function peakListSpectrum(
  id: string,
  mz: number[],
  intensity: number[],
  options: PeakListOptions = {},
): MassSpectrum {
  const { charge, showCentroid = true } = options;
  const charges = new Int16Array(mz.length);
  for (let index = 0; index < mz.length; index++) {
    charges[index] = charge === undefined ? 1 : (charge[index] as number);
  }
  return {
    id,
    name: id,
    color: '#000000',
    profile: null,
    centroid: {
      x: Float64Array.from(mz),
      y: Float64Array.from(intensity),
      charge: charges,
    },
    meta: null,
    origin: { format: 'calculated' },
    showProfile: false,
    showCentroid,
  };
}
