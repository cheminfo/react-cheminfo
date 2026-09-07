import { expect, test } from 'vitest';

import { colorAt, evenScale, sampleScale, swatchAt } from '../interpolate.ts';

test('a list of colours becomes a scale with them spread evenly', () => {
  expect(evenScale(['#000000', '#808080', '#ffffff'])).toStrictEqual({
    interpolation: 'rgb',
    stops: [
      { position: 0, color: '#000000' },
      { position: 0.5, color: '#808080' },
      { position: 1, color: '#ffffff' },
    ],
  });
  expect(evenScale(['#000000']).stops).toStrictEqual([
    { position: 0, color: '#000000' },
  ]);
});

test('anchors do not have to be evenly spread', () => {
  const scale = evenScale([]);
  const uneven = {
    ...scale,
    stops: [
      { position: 0, color: '#000000' },
      { position: 0.8, color: '#ffffff' },
    ],
  };

  expect(colorAt(uneven, 0.4)).toBe('#808080');
  expect(colorAt(uneven, 0.8)).toBe('#ffffff');
  expect(colorAt(uneven, 0.9)).toBe('#ffffff');
});

test('a position outside the scale takes the colour of the end it ran off', () => {
  const scale = evenScale(['#000000', '#ffffff']);

  expect(colorAt(scale, -3)).toBe('#000000');
  expect(colorAt(scale, 4)).toBe('#ffffff');
  expect(colorAt(scale, Number.NaN)).toBe('#000000');
});

test('the short way from red to blue is through magenta', () => {
  const scale = {
    interpolation: 'hsv' as const,
    stops: [
      { position: 0, color: '#ff0000' },
      { position: 1, color: '#0000ff' },
    ],
  };

  expect(colorAt(scale, 0.5)).toBe('#ff00ff');
  expect(colorAt(scale, 0.25)).toBe('#ff0080');
});

test('the long way from blue to red is the whole rainbow', () => {
  const scale = {
    interpolation: 'hsv-long' as const,
    stops: [
      { position: 0, color: '#0000ff' },
      { position: 1, color: '#ff0000' },
    ],
  };

  expect(sampleScale(scale, 5)).toStrictEqual([
    '#0000ff',
    '#00ffff',
    '#00ff00',
    '#ffff00',
    '#ff0000',
  ]);
});

test('mixing the channels fades through the grey the wheel turns around', () => {
  const straight = evenScale(['#ff0000', '#0000ff']);

  expect(colorAt(straight, 0.5)).toBe('#800080');
});

test('two anchors of one hue draw a full turn the long way round', () => {
  const scale = {
    interpolation: 'hsv-long' as const,
    stops: [
      { position: 0, color: '#ff0000' },
      { position: 1, color: '#ff0000' },
    ],
  };

  expect(colorAt(scale, 1 / 3)).toBe('#00ff00');
  expect(colorAt(scale, 2 / 3)).toBe('#0000ff');
});

test('a sample runs from one end to the other, and is never shorter than two', () => {
  const scale = evenScale(['#000000', '#ffffff']);

  expect(sampleScale(scale, 3)).toStrictEqual([
    '#000000',
    '#808080',
    '#ffffff',
  ]);
  expect(sampleScale(scale, 1)).toStrictEqual(['#000000', '#ffffff']);
  expect(sampleScale(scale, Number.NaN)).toStrictEqual(['#000000', '#ffffff']);
});

test('a swatch carries the colour and the ink that reads on it', () => {
  const scale = evenScale(['#000000', '#ffffff']);

  expect(swatchAt(scale, 0)).toStrictEqual({
    background: '#000000',
    foreground: '#ffffff',
  });
  expect(swatchAt(scale, 1)).toStrictEqual({
    background: '#ffffff',
    foreground: '#182026',
  });
});

test('a scale with no anchor throws rather than drawing nothing', () => {
  expect(() => colorAt(evenScale([]), 0.5)).toThrow(
    'a colour scale needs at least one stop',
  );
});
