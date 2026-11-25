import { expect, test } from 'vitest';

import type { ColorScale } from '../interpolate.ts';
import { colorAt, evenScale } from '../interpolate.ts';
import { scaleSampler } from '../sampler.ts';
import { parseColorScale } from '../scaleText.ts';
import { COLOR_SCALES } from '../scales.ts';

const CUSTOM = [
  'rgb,0-000000,0.5-ff8800,1-ffffff',
  'rgb,0-000000,0.2-123456,0.2-fedcba,0.9-00ff00,1-ffffff',
  'hsv,0-ff0000,0.3-00ff00,1-0000ff',
  'hsv,0-808080,1-ff00ff',
  'hsv-long,0-ff0000,1-ff0000',
  'hsv-long,0-ff0000,0.5-00ffff,1-ff00ff',
  'rgb,0.25-000000,0.75-ffffff',
];

function scales(): Array<[string, ColorScale]> {
  const named = COLOR_SCALES.map((entry): [string, ColorScale] => [
    entry.id,
    entry.scale,
  ]);
  const custom = CUSTOM.map((text): [string, ColorScale] => {
    const scale = parseColorScale(text);
    if (scale === null) throw new Error(`not a scale: ${text}`);
    return [text, scale];
  });
  const single: [string, ColorScale] = ['one anchor', evenScale(['#3366cc'])];
  return [...named, ...custom, single];
}

function positions(scale: ColorScale): number[] {
  const list = [-1, 2, Number.NaN, Infinity, -Infinity, 0.5 - 1e-12];
  for (let step = 0; step < 65_536; step++) list.push(step / 65_535);
  for (const stop of scale.stops) {
    list.push(stop.position, stop.position - 1e-9, stop.position + 1e-9);
  }
  return list;
}

function channels(hex: string): number[] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

test('every channel it writes is the one colorAt gives, on every scale and everywhere along it', () => {
  const differing: string[] = [];
  let read = 0;
  for (const [name, scale] of scales()) {
    const sample = scaleSampler(scale);
    const out = new Uint8ClampedArray(3);
    for (const position of positions(scale)) {
      sample(position, out, 0);
      const wanted = channels(colorAt(scale, position));
      read++;
      if (
        out[0] !== wanted[0] ||
        out[1] !== wanted[1] ||
        out[2] !== wanted[2]
      ) {
        differing.push(`${name} at ${position}`);
      }
    }
  }

  // 25 scales, each read at 65 542 positions and at 3 around each of its 118
  // anchors.
  expect(read).toBe(1_638_904);
  expect(differing).toStrictEqual([]);
});

test('it writes three channels at the offset and leaves the rest of the array alone', () => {
  const sample = scaleSampler(evenScale(['#000000', '#ff8000']));
  const clamped = new Uint8ClampedArray([9, 9, 9, 9, 9, 9, 9, 9]);
  const plain = new Uint8Array([9, 9, 9, 9, 9, 9]);
  sample(0.5, clamped, 4);
  sample(1, plain, 1);

  expect([...clamped]).toStrictEqual([9, 9, 9, 9, 128, 64, 0, 9]);
  expect([...plain]).toStrictEqual([9, 255, 128, 0, 9, 9]);
});

test('a scale without an anchor has no reader', () => {
  expect(() => scaleSampler({ stops: [], interpolation: 'rgb' })).toThrow(
    'a colour scale needs at least one stop',
  );
});
