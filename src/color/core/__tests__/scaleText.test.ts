import { expect, test } from 'vitest';

import { colorAt } from '../interpolate.ts';
import {
  MAXIMUM_CUSTOM_STOPS,
  formatColorScale,
  parseColorScale,
  resolveColorScale,
} from '../scaleText.ts';

test('a link naming one of ours gets it, under its own name', () => {
  const resolved = resolveColorScale('plasma');

  expect(resolved.id).toBe('plasma');
  expect(resolved.label).toBe('Plasma');
  expect(colorAt(resolved.scale, 0)).toBe('#0d0887');
});

test('a name is read whatever case and spacing it arrives in', () => {
  expect(resolveColorScale('  Cool-Warm ').id).toBe('cool-warm');
});

test('a scale nobody offers falls back rather than blanking the figure', () => {
  expect(resolveColorScale('nonsense').id).toBe('viridis');
  expect(resolveColorScale(undefined).id).toBe('viridis');
  expect(resolveColorScale('').id).toBe('viridis');
  expect(resolveColorScale('nonsense', 'greys').id).toBe('greys');
});

test('a link spelling out its own scale is read as one, with no name', () => {
  const resolved = resolveColorScale('hsv-long,0-0000ff,1-ff0000');

  expect(resolved.id).toBeNull();
  expect(resolved.label).toBe('Custom');
  expect(colorAt(resolved.scale, 0.5)).toBe('#00ff00');
});

test('anchors are read in whatever order they were written', () => {
  const scale = parseColorScale('rgb,1-ffffff,0-000000,0.5-ff0000');

  expect(scale?.stops).toStrictEqual([
    { position: 0, color: '#000000' },
    { position: 0.5, color: '#ff0000' },
    { position: 1, color: '#ffffff' },
  ]);
});

test('a short hex, a stray hash and a position out of range are all taken', () => {
  const scale = parseColorScale('rgb,-1-#f00,3-0f0');

  expect(scale?.stops).toStrictEqual([
    { position: 0, color: '#f00' },
    { position: 1, color: '#0f0' },
  ]);
});

test('text that spells out no scale is refused, and the caller falls back', () => {
  expect(parseColorScale('viridis')).toBeNull();
  expect(parseColorScale('rgb,0-000000')).toBeNull();
  expect(parseColorScale('rgb,0-nothex,1-alsonot')).toBeNull();
  expect(parseColorScale('')).toBeNull();
});

test('the path may be left out, and anchors alone are mixed in RGB', () => {
  const scale = parseColorScale('0-000000,1-ffffff');

  expect(scale?.interpolation).toBe('rgb');
  expect(scale?.stops).toHaveLength(2);
  // A path nobody implements is not one: it is read as an anchor, and dropped.
  expect(parseColorScale('lab,0-000000,1-ffffff')?.interpolation).toBe('rgb');
});

test('a link may not spell out more anchors than the editor offers', () => {
  const many: string[] = [];
  for (let index = 0; index <= 40; index++) {
    many.push(`${String(index / 40)}-ff0000`);
  }
  const scale = parseColorScale(`rgb,${many.join(',')}`);

  expect(scale?.stops).toHaveLength(MAXIMUM_CUSTOM_STOPS);
});

test('a custom scale is written without the hash a query string would cut at', () => {
  const text = formatColorScale({
    interpolation: 'hsv',
    stops: [
      { position: 0, color: '#FF0000' },
      { position: 0.333_33, color: '#00ff00' },
      { position: 1, color: 'nonsense' },
    ],
  });

  expect(text).toBe('hsv,0-ff0000,0.333-00ff00');
});

test('what the editor writes is what the next visitor reads', () => {
  const scale = {
    interpolation: 'hsv-long' as const,
    stops: [
      { position: 0, color: '#0000ff' },
      { position: 0.4, color: '#00ff00' },
      { position: 1, color: '#ff0000' },
    ],
  };

  expect(parseColorScale(formatColorScale(scale))).toStrictEqual(scale);
});
