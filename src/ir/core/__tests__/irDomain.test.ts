import { expect, test } from 'vitest';

import { fittedTo, fullDomain } from '../irDomain.ts';
import type { IrSpectrum } from '../irSpectrum.ts';

/**
 * One spectrum over three points, of the little a fit needs.
 * @param overrides - What to change about it.
 * @returns The spectrum.
 */
function spectrum(overrides: Partial<IrSpectrum> = {}): IrSpectrum {
  return {
    id: 'film',
    name: 'film',
    color: '#1f77b4',
    wavenumber: Float64Array.from([1000, 2000, 3000]),
    absorbance: Float64Array.from([0, 1, 0.5]),
    transmittance: Float64Array.from([100, 10, 31.6]),
    meta: null,
    origin: { format: 'jcamp' },
    visible: true,
    ...overrides,
  };
}

test('the window runs low wavenumber first, whichever way it is drawn', () => {
  const { x } = fullDomain([spectrum()], 'absorbance');

  expect(x[0]).toBeLessThan(x[1]);
  // Two percent of the 2000 span, either side.
  expect(x).toStrictEqual([960, 3040]);
});

test('absorbance keeps its room above the trace, where the labels go', () => {
  const { y } = fullDomain([spectrum()], 'absorbance');

  // The span is 0 to 1: five percent under, twenty percent over.
  expect(y[0]).toBeCloseTo(-0.05, 10);
  expect(y[1]).toBeCloseTo(1.2, 10);
});

test('transmittance keeps its room below the trace, where its labels go', () => {
  const { y } = fullDomain([spectrum()], 'transmittance');

  // The span is 10 to 100: twenty percent under, five percent over.
  expect(y[0]).toBeCloseTo(-8, 10);
  expect(y[1]).toBeCloseTo(104.5, 10);
});

test('a spectrum that is not drawn is not fitted to', () => {
  const hidden = spectrum({ visible: false });

  expect(fullDomain([hidden], 'absorbance')).toStrictEqual({
    x: [400, 4000],
    y: [0, 1],
  });
});

test('a reference held up for comparison does not move the axes', () => {
  const wide = spectrum({
    id: 'reference',
    wavenumber: Float64Array.from([400, 4000]),
    absorbance: Float64Array.from([0, 5]),
    transmittance: Float64Array.from([100, 0.001]),
    excludeFromDomain: true,
  });

  expect(fullDomain([spectrum(), wide], 'absorbance').x).toStrictEqual([
    960, 3040,
  ]);
});

test('a reference alone is fitted to rather than shown on an empty axis', () => {
  const only = spectrum({ excludeFromDomain: true });

  expect(fullDomain([only], 'absorbance').x).toStrictEqual([960, 3040]);
});

test('nothing drawn still gives a usable window in either mode', () => {
  expect(fullDomain([], 'transmittance')).toStrictEqual({
    x: [400, 4000],
    y: [0, 100],
  });
  expect(fullDomain([], 'absorbance')).toStrictEqual({
    x: [400, 4000],
    y: [0, 1],
  });
});

test('a spectrum of one point is given a window rather than a line', () => {
  const single = spectrum({
    wavenumber: Float64Array.from([1700]),
    absorbance: Float64Array.from([0.4]),
    transmittance: Float64Array.from([40]),
  });

  expect(fullDomain([single], 'absorbance').x).toStrictEqual([1699, 1701]);
});

test('switching mode is a refit, because the value axis is replaced', () => {
  expect(fittedTo([spectrum()], 'absorbance')).not.toBe(
    fittedTo([spectrum()], 'transmittance'),
  );
});

test('renaming or recolouring a spectrum is not a refit', () => {
  const renamed = spectrum({ name: 'polystyrene', color: '#d62728' });

  expect(fittedTo([renamed], 'absorbance')).toBe(
    fittedTo([spectrum()], 'absorbance'),
  );
});

test('loading or hiding a spectrum is a refit', () => {
  const one = fittedTo([spectrum()], 'absorbance');

  expect(
    fittedTo([spectrum(), spectrum({ id: 'second' })], 'absorbance'),
  ).not.toBe(one);
  expect(fittedTo([spectrum({ visible: false })], 'absorbance')).not.toBe(one);
});
