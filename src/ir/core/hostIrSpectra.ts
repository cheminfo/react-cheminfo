import type { IrJdxValue } from '../../host/core/irKinds.ts';
import type { RamanJdxValue } from '../../host/core/ramanKinds.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import type { HostSpectra, HostSpectrumItem } from './hostSpectraRead.ts';
import { readHostSpectra } from './hostSpectraRead.ts';
import { bandsFromIrPeaks, bandsFromRamanPeaks } from './irPeaks.ts';
import { loadIrSpectra } from './loadIrSpectra.ts';
import { loadRamanSpectra } from './loadRamanSpectra.ts';
import { spectrumLabel } from './spectrumLabel.ts';

/**
 * Read the infrared spectra a host handed over, each with its bands.
 * @param items - The spectra, as the host sent them.
 * @returns The spectra, and the items their bands go back under.
 * @throws {Error} When a file holds no infrared spectrum; the message is the
 * sentence the host is answered with.
 */
export function readHostIrSpectra(
  items: ReadonlyArray<HostSpectrumItem<IrJdxValue>>,
): Promise<HostSpectra> {
  return readHostSpectra(items, {
    noun: 'infrared',
    read: async (jdx, fileName) => {
      const { spectra } = await loadIrSpectra(jdx, { fileName });
      return spectra;
    },
    bandsFrom: bandsFromIrPeaks,
  });
}

/**
 * Read the Raman spectra a host handed over, as {@link readHostIrSpectra}
 * reads infrared ones. The file is read as Raman whatever it declares, since
 * the host said what it is, and each spectrum is named by `spectrumLabel`.
 * @param items - The spectra, as the host sent them.
 * @returns The spectra, and the items their bands go back under.
 * @throws {Error} When a file holds no Raman spectrum; the message is the
 * sentence the host is answered with.
 */
export function readHostRamanSpectra(
  items: ReadonlyArray<HostSpectrumItem<RamanJdxValue>>,
): Promise<HostSpectra> {
  return readHostSpectra(items, {
    noun: 'Raman',
    read: async (jdx, fileName) => {
      const { spectra } = await loadRamanSpectra(jdx, { fileName });
      const named = new Array<LoadedIrSpectrum>(spectra.length);
      for (let index = 0; index < spectra.length; index++) {
        const spectrum = spectra[index] as LoadedIrSpectrum;
        named[index] = {
          ...spectrum,
          name: spectrumLabel(fileName, spectrum.name, index, spectra.length),
        };
      }
      return named;
    },
    bandsFrom: bandsFromRamanPeaks,
  });
}
