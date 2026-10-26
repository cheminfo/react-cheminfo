import { gaussianFwhmToWidth } from 'ml-peak-shape-generator';
import { expect, test } from 'vitest';

import { measuredResolution, statedResolution } from '../massResolution.ts';
import type { MassMeta, MassSpectrum } from '../massSpectrum.ts';
import { decideResolution, mzDecimalsOf } from '../resolutionOf.ts';
import { writtenDecimals, writtenResolution } from '../writtenResolution.ts';

/**
 * A metadata table holding one row.
 * @param label - The row's label.
 * @param value - What it says.
 * @returns The table.
 */
function metaWith(label: string, value: string): MassMeta {
  return {
    title: null,
    molecularFormula: null,
    fields: [{ label, value }],
    conditions: null,
  };
}

/**
 * A centroided spectrum holding these masses and no verdict of its own.
 * @param masses - Its peaks.
 * @returns The spectrum.
 */
function peakTable(masses: number[]): MassSpectrum {
  return {
    id: masses.join(','),
    name: 'peaks',
    color: '#000',
    profile: null,
    centroid: {
      x: Float64Array.from(masses),
      y: new Float64Array(masses.length).fill(10),
      charge: new Int16Array(masses.length),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
  };
}

test('the decimals a mass was written with survive the scaling of a JCAMP', () => {
  expect(writtenDecimals(Float64Array.from([163, 325, 487]))).toBe(0);
  expect(writtenDecimals(Float64Array.from([1631 * 0.1, 57]))).toBe(1);
  expect(writtenDecimals(Float64Array.from([57.07, 163.1234]))).toBe(4);
  expect(writtenDecimals(Float64Array.from([Number.NaN, 12.5]))).toBe(1);
  expect(writtenDecimals(Float64Array.from([1.123_456_789]))).toBe(6);
});

test('whole numbers are nominal, a decimal or two coarse, three resolved', () => {
  expect(writtenResolution(Float64Array.from([163, 325]))).toStrictEqual({
    kind: 'nominal',
    resolvingPower: null,
    basis: 'decimals',
    decimals: 0,
  });
  expect(writtenResolution(Float64Array.from([57.07])).kind).toBe('low');
  expect(writtenResolution(Float64Array.from([57.07])).decimals).toBe(2);
  expect(writtenResolution(Float64Array.from([195.0877])).kind).toBe('high');
  expect(writtenResolution(Float64Array.from([1.123_456]))).toStrictEqual({
    kind: 'high',
    resolvingPower: null,
    basis: 'decimals',
    decimals: 4,
  });
});

test('the resolving power is measured at half height on the tallest peaks', () => {
  // Twenty peaks resolved to R = 20 000, and five faint ones whose widths the
  // noise decided, which the median over the tallest leaves out.
  const peaks = [];
  for (let index = 0; index < 20; index++) {
    const x = 200 + index * 10;
    peaks.push({ x, y: 100 - index, width: gaussianFwhmToWidth(x / 20_000) });
  }
  for (let index = 0; index < 5; index++) {
    peaks.push({ x: 500 + index, y: 1, width: 3 });
  }

  const resolution = measuredResolution(peaks);

  expect(resolution?.kind).toBe('high');
  expect(resolution?.basis).toBe('peakWidth');
  expect(resolution?.decimals).toBe(4);
  expect(resolution?.resolvingPower).toBeCloseTo(20_000, 6);
});

test('a unit-resolution profile is low resolution, and no width is no verdict', () => {
  const quadrupole = measuredResolution([
    { x: 500, y: 100, width: gaussianFwhmToWidth(0.7) },
  ]);

  expect(quadrupole?.kind).toBe('low');
  expect(quadrupole?.resolvingPower).toBeCloseTo(714.2857, 3);
  expect(measuredResolution([{ x: 500, y: 100, width: 0 }])).toBeNull();
});

test('the instrument a file names says what it resolved', () => {
  expect(statedResolution(metaWith('Analyser', 'FTMS'))?.kind).toBe('high');
  expect(statedResolution(metaWith('Analyser', 'LTQ-Orbitrap'))?.kind).toBe(
    'high',
  );
  expect(statedResolution(metaWith('Analyser', 'ITMS'))?.kind).toBe('low');
  expect(
    statedResolution(metaWith('Instrument parameters', 'LOW RESOLUTION'))?.kind,
  ).toBe('low');
  expect(statedResolution(metaWith('Analyser', 'TOFMS'))).toBeNull();
  expect(statedResolution(metaWith('Note', 'FTMS'))).toBeNull();
  expect(statedResolution(null)).toBeNull();
});

test('a stated instrument never adds decimals the masses were not written with', () => {
  const ionTrap = metaWith('Analyser', 'ITMS');

  expect(
    decideResolution({
      measured: null,
      meta: ionTrap,
      masses: Float64Array.from([163.0834]),
    }),
  ).toStrictEqual({
    kind: 'low',
    resolvingPower: null,
    basis: 'instrument',
    decimals: 1,
  });
  expect(
    decideResolution({
      measured: null,
      meta: metaWith('Analyser', 'FTMS'),
      masses: Float64Array.from([163.08]),
    }).decimals,
  ).toBe(2);
  expect(
    decideResolution({
      measured: null,
      meta: ionTrap,
      masses: Float64Array.from([163, 164]),
    }).kind,
  ).toBe('nominal');
});

test('a measurement wins over whatever the file says', () => {
  const measured = measuredResolution([
    { x: 500, y: 100, width: gaussianFwhmToWidth(0.01) },
  ]);
  const decided = decideResolution({
    measured,
    meta: metaWith('Analyser', 'ITMS'),
    masses: Float64Array.from([500]),
  });

  expect(decided.kind).toBe('high');
  expect(decided.basis).toBe('peakWidth');
});

test('spectra drawn together are written with the most decimals any resolves', () => {
  const nominal = peakTable([163, 325]);
  const resolved = peakTable([163.0601, 325.1129]);

  expect(mzDecimalsOf([nominal])).toBe(0);
  expect(mzDecimalsOf([nominal, resolved])).toBe(4);
  expect(mzDecimalsOf([peakTable([])])).toBe(4);
  expect(mzDecimalsOf([])).toBe(4);
});
