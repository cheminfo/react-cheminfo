import type { LoadedIrSpectrum } from '../analysisSpectra.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * A Raman spectrum as a host reading a Renishaw WDF hands it over: a 2 cm⁻¹
 * grid from 200 to 3200 cm⁻¹, with three Gaussian bands on a flat baseline of
 * 100 counts — 5000 counts tall at 1000, 3000 at 1600 and 1000 at 2900. They
 * are far enough apart that each top is the baseline plus its own height, to
 * the count.
 * @returns The spectrum, as the viewer holds it.
 */
export function calciteSpectrum(): IrSpectrum {
  const points = 1501;
  const wavenumber = new Float64Array(points);
  const intensity = new Float64Array(points);
  for (let index = 0; index < points; index++) {
    const shift = 200 + index * 2;
    wavenumber[index] = shift;
    intensity[index] =
      100 +
      gaussian(shift, 1000, 5000, 6) +
      gaussian(shift, 1600, 3000, 8) +
      gaussian(shift, 2900, 1000, 10);
  }
  const loaded: LoadedIrSpectrum = {
    wavenumber,
    intensity,
    meta: null,
    origin: { format: 'wdf', fileName: 'calcite.wdf' },
    name: 'calcite',
  };
  return toIrSpectrum(loaded, { id: 'calcite', color: '#0072b2' });
}

/**
 * One Gaussian band.
 * @param shift - Where it is read.
 * @param centre - Where the band is centred.
 * @param height - How tall it is.
 * @param width - Its standard deviation.
 * @returns Its height at `shift`.
 */
function gaussian(
  shift: number,
  centre: number,
  height: number,
  width: number,
): number {
  const offset = shift - centre;
  return height * Math.exp(-(offset * offset) / (2 * width * width));
}
