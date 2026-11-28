import type { UvJdxValue } from '../../host/core/uvKinds.ts';

import type { HostSpectra, HostSpectrumItem } from './hostSpectraRead.ts';
import { readHostSpectra } from './hostSpectraRead.ts';
import { bandsFromUvPeaks } from './irPeaks.ts';
import { loadUvVisSpectra } from './loadUvVisSpectra.ts';

/** What {@link readHostUvSpectra} is given beside the items. */
export interface ReadHostUvSpectraOptions {
  /**
   * The sentence a fluorescence file is refused with, for a viewer that reads
   * light absorbed only.
   * @param fileName - The file the host named.
   * @default undefined — a fluorescence file is read like any other
   */
  refuseFluorescence?: (fileName: string) => string;
}

/**
 * Read the UV-vis spectra a host handed over, each with its λmax, as
 * `readHostIrSpectra` reads infrared ones.
 * @param items - The spectra, as the host sent them.
 * @param options - Whether a fluorescence file is refused.
 * @returns The spectra, and the items their λmax go back under.
 * @throws {Error} When a file holds no UV-vis spectrum, or is refused; the
 * message is the sentence the host is answered with.
 */
export function readHostUvSpectra(
  items: ReadonlyArray<HostSpectrumItem<UvJdxValue>>,
  options: ReadHostUvSpectraOptions = {},
): Promise<HostSpectra> {
  const { refuseFluorescence } = options;
  return readHostSpectra(items, {
    noun: 'UV-vis',
    read: async (jdx, fileName) => {
      const read = await loadUvVisSpectra(jdx, { fileName });
      if (
        refuseFluorescence !== undefined &&
        read.technique === 'fluorescence'
      ) {
        throw new Error(refuseFluorescence(fileName));
      }
      return read.spectra;
    },
    bandsFrom: bandsFromUvPeaks,
  });
}
