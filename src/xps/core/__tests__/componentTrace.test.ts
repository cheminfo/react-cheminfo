import { expect, test } from 'vitest';

import type { ComponentPeak } from '../componentShape.ts';
import { parseComponentShape } from '../componentShape.ts';
import {
  componentAmplitude,
  componentIntensity,
  componentTrace,
  envelopeTrace,
} from '../componentTrace.ts';

/** A carbon 1s component of unit area and unit width, drawn as a Gaussian. */
const carbon: ComponentPeak = {
  centre: 285,
  fwhm: 1,
  area: 1,
  shape: 'GL(0)',
};

test('the stated area becomes a height through the shape it is spread over', () => {
  const gaussian = parseComponentShape('GL(0)');
  const lorentzian = parseComponentShape('GL(100)');

  expect(componentAmplitude(carbon, gaussian)).toBe(0.9394372786996513);
  // The same area under the same width is shorter as a Lorentzian, because a
  // third of it is out in tails the eye never counts.
  expect(componentAmplitude({ ...carbon, shape: 'GL(100)' }, lorentzian)).toBe(
    0.6366197723675814,
  );
});

test('a component with no width or no area has no height', () => {
  const gaussian = parseComponentShape('GL(0)');

  expect(componentAmplitude({ ...carbon, fwhm: 0 }, gaussian)).toBe(0);
  expect(componentAmplitude({ ...carbon, area: Number.NaN }, gaussian)).toBe(0);
});

test('a component reads its own height at its centre and half at its width', () => {
  expect(componentIntensity(carbon, 285)).toBe(0.9394372786996513);
  expect(componentIntensity(carbon, 285.5)).toBeCloseTo(
    0.9394372786996513 / 2,
    12,
  );
  expect(componentIntensity(carbon, 284.5)).toBeCloseTo(
    0.9394372786996513 / 2,
    12,
  );
});

test('a component is drawn across the window on an ascending grid', () => {
  const trace = componentTrace(carbon, 284, 286, 5);

  expect(trace.x).toStrictEqual(
    Float64Array.from([284, 284.5, 285, 285.5, 286]),
  );
  expect(trace.y[2]).toBe(0.9394372786996513);
  expect(trace.y[1]).toBeCloseTo(0.4697186393498257, 12);
  expect(trace.y[3]).toBeCloseTo(0.4697186393498257, 12);
});

test('a window given backwards is drawn the same way round', () => {
  expect(componentTrace(carbon, 286, 284, 5).x).toStrictEqual(
    componentTrace(carbon, 284, 286, 5).x,
  );
});

test('a window with no width draws nothing at all', () => {
  expect(componentTrace(carbon, 285, 285, 5).x).toStrictEqual(
    new Float64Array(0),
  );
  expect(componentTrace(carbon, Number.NaN, 286, 5).y).toStrictEqual(
    new Float64Array(0),
  );
});

test('the envelope is the sum of the components and nothing else', () => {
  const second: ComponentPeak = { ...carbon, centre: 286.5, area: 2 };
  const envelope = envelopeTrace([carbon, second], 284, 288, 9);
  const first = componentTrace(carbon, 284, 288, 9);
  const other = componentTrace(second, 284, 288, 9);

  expect(envelope.x).toStrictEqual(first.x);

  for (let index = 0; index < envelope.y.length; index++) {
    expect(envelope.y[index], `point ${index}`).toBeCloseTo(
      (first.y[index] as number) + (other.y[index] as number),
      12,
    );
  }
});

test('a fit of no components is a flat envelope rather than nothing', () => {
  const envelope = envelopeTrace([], 284, 286, 5);

  expect(envelope.x).toStrictEqual(
    Float64Array.from([284, 284.5, 285, 285.5, 286]),
  );
  expect(envelope.y).toStrictEqual(new Float64Array(5));
});

test('a component with no height is left out of the envelope entirely', () => {
  const envelope = envelopeTrace([{ ...carbon, area: 0 }], 284, 286, 5);

  expect(envelope.y).toStrictEqual(new Float64Array(5));
});

test('a window is never cut into fewer than two points', () => {
  expect(componentTrace(carbon, 284, 286, 1).x).toStrictEqual(
    Float64Array.from([284, 286]),
  );
});
