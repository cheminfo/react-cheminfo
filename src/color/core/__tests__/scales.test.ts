import { expect, test } from 'vitest';

import { relativeLuminance } from '../contrast.ts';
import { parseHexColor } from '../hex.ts';
import { colorAt } from '../interpolate.ts';
import { VIRIDIS_SCALE } from '../scale.ts';
import {
  COLOR_SCALES,
  COLOR_SCALE_KIND_LABELS,
  DEFAULT_COLOR_SCALE_ID,
  colorScaleById,
} from '../scales.ts';

/**
 * The entry a test names, so no test has to branch on a missing one.
 * @param id - Id of the scale the test is about.
 * @returns Its entry.
 * @throws {Error} When no scale is registered under that id.
 */
function requireScale(id: string) {
  const entry = colorScaleById(id);
  if (entry === undefined) throw new Error(`no scale called ${id}`);
  return entry;
}

test('ten scales are offered, each under a name of its own', () => {
  const ids = new Set(COLOR_SCALES.map((scale) => scale.id));

  expect(COLOR_SCALES).toHaveLength(10);
  expect(ids.size).toBe(10);
  expect([...ids]).toStrictEqual([
    'viridis',
    'plasma',
    'magma',
    'inferno',
    'cividis',
    'turbo',
    'greys',
    'cool-warm',
    'blue-red',
    'rainbow',
  ]);
});

test('every scale is anchored in hex colours, in ascending order, from 0 to 1', () => {
  for (const entry of COLOR_SCALES) {
    const { stops } = entry.scale;

    expect(stops.length).toBeGreaterThanOrEqual(2);
    expect(stops[0]?.position).toBe(0);
    expect(stops.at(-1)?.position).toBe(1);

    let previous = -1;
    for (const stop of stops) {
      expect(() => parseHexColor(stop.color)).not.toThrow();
      expect(stop.position).toBeGreaterThan(previous);

      previous = stop.position;
    }

    expect(entry.label).not.toBe('');
    expect(COLOR_SCALE_KIND_LABELS[entry.kind]).not.toBe('');
  }
});

test('the default is viridis, and it is the one the shared list holds', () => {
  const viridis = requireScale(DEFAULT_COLOR_SCALE_ID);

  expect(DEFAULT_COLOR_SCALE_ID).toBe('viridis');
  expect(viridis.scale.stops.map((stop) => stop.color)).toStrictEqual([
    ...VIRIDIS_SCALE,
  ]);
});

test('the five perceptual scales climb in lightness, so they print in grey', () => {
  for (const id of ['viridis', 'plasma', 'magma', 'inferno', 'cividis']) {
    const entry = requireScale(id);
    let previous = -1;
    for (let step = 0; step <= 20; step++) {
      const lightness = relativeLuminance(colorAt(entry.scale, step / 20));

      expect(lightness).toBeGreaterThan(previous);

      previous = lightness;
    }
  }
});

test('greys runs the other way, from the palest to black', () => {
  const greys = requireScale('greys');

  expect(colorAt(greys.scale, 0)).toBe('#ebebeb');
  expect(colorAt(greys.scale, 1)).toBe('#000000');
  expect(relativeLuminance(colorAt(greys.scale, 0.25))).toBeGreaterThan(
    relativeLuminance(colorAt(greys.scale, 0.75)),
  );
});

test('the rainbow is two anchors turning the long way round the wheel', () => {
  const rainbow = requireScale('rainbow');

  expect(rainbow.kind).toBe('cyclic');
  expect(rainbow.scale.stops).toHaveLength(2);
  expect(rainbow.scale.interpolation).toBe('hsv-long');
  expect(colorAt(rainbow.scale, 0.5)).toBe('#00ff00');
});

test('a scale nobody offers is not invented', () => {
  expect(colorScaleById('nonsense')).toBeUndefined();
});
