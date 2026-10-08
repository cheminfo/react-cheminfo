import { expect, test } from 'vitest';

import type { ColorScale } from '../interpolate.ts';
import { MAXIMUM_CUSTOM_STOPS } from '../scaleText.ts';
import {
  addColorStop,
  moveColorStop,
  recolorColorStop,
  removeColorStop,
} from '../stops.ts';

const SCALE: ColorScale = {
  interpolation: 'rgb',
  stops: [
    { position: 0, color: '#000000' },
    { position: 0.5, color: '#ff0000' },
    { position: 1, color: '#ffffff' },
  ],
};

test('an anchor is added in the colour the scale already has there', () => {
  expect(addColorStop(SCALE, 0.25)).toStrictEqual({
    index: 1,
    stops: [
      { position: 0, color: '#000000' },
      { position: 0.25, color: '#800000' },
      { position: 0.5, color: '#ff0000' },
      { position: 1, color: '#ffffff' },
    ],
  });
});

test('an anchor added past the strip lands on its end, rounded as a link writes it', () => {
  expect(addColorStop(SCALE, 1.4)?.index).toBe(3);
  expect(addColorStop(SCALE, 0.123_456)?.stops[1]?.position).toBe(0.123);
});

test('no anchor is added past what a link may carry', () => {
  const full: ColorScale = {
    interpolation: 'rgb',
    stops: Array.from({ length: MAXIMUM_CUSTOM_STOPS }, (_, index) => ({
      position: index / (MAXIMUM_CUSTOM_STOPS - 1),
      color: '#000000',
    })),
  };

  expect(addColorStop(full, 0.5)).toBeNull();
});

test('an anchor dragged past its neighbour is reordered, and the index follows it', () => {
  expect(moveColorStop(SCALE.stops, 0, 0.75)).toStrictEqual({
    index: 1,
    stops: [
      { position: 0.5, color: '#ff0000' },
      { position: 0.75, color: '#000000' },
      { position: 1, color: '#ffffff' },
    ],
  });
});

test('a position that is not a number moves nothing', () => {
  expect(moveColorStop(SCALE.stops, 1, Number.NaN)).toStrictEqual({
    index: 1,
    stops: SCALE.stops,
  });
});

test('an anchor is removed, but never one of the last two', () => {
  expect(removeColorStop(SCALE.stops, 1)).toStrictEqual([
    { position: 0, color: '#000000' },
    { position: 1, color: '#ffffff' },
  ]);
  expect(removeColorStop(SCALE.stops.slice(0, 2), 0)).toStrictEqual(
    SCALE.stops.slice(0, 2),
  );
});

test('an anchor is recoloured where it stands', () => {
  expect(recolorColorStop(SCALE.stops, 2, '#00ff00')[2]).toStrictEqual({
    position: 1,
    color: '#00ff00',
  });
});
