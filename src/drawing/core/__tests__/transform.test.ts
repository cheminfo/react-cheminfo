/**
 * A scale and a turn about a pivot, as the handles of a selection frame make
 * them, landing on coordinates a file stores.
 */

import { expect, test } from 'vitest';

import {
  mapCurve,
  pointMap,
  transformCaption,
  transformPicture,
} from '../transform.ts';

test('a quarter turn doubled about a pivot lands on rounded coordinates', () => {
  const map = pointMap({ pivot: { x: 1, y: 1 }, scale: 2, rotation: 90 });

  expect(map({ x: 2, y: 1 })).toStrictEqual({ x: 1, y: 3 });
  expect(map({ x: 1, y: 2 })).toStrictEqual({ x: -1, y: 1 });
  expect(map({ x: 1, y: 1 })).toStrictEqual({ x: 1, y: 1 });
});

test('no turn and no scale still rounds to a hundredth of a point', () => {
  const map = pointMap({ pivot: { x: 0, y: 0 }, scale: 1, rotation: 0 });

  expect(map({ x: 1.234, y: -5.678 })).toStrictEqual({ x: 1.23, y: -5.68 });

  const third = pointMap({ pivot: { x: 0, y: 0 }, scale: 1, rotation: 30 });

  expect(third({ x: 10, y: 0 })).toStrictEqual({ x: 8.66, y: 5 });
});

function shift(point: { x: number; y: number }) {
  return { x: point.x + 10, y: point.y - 5 };
}

test('a curve moves its points and its hand-set controls together', () => {
  expect(
    mapCurve(
      {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        controls: [
          null,
          { before: { x: 80, y: 20 }, after: { x: 120, y: -20 } },
        ],
        closed: false,
      },
      shift,
    ),
  ).toStrictEqual({
    points: [
      { x: 10, y: -5 },
      { x: 110, y: -5 },
    ],
    controls: [null, { before: { x: 90, y: 15 }, after: { x: 130, y: -25 } }],
    closed: false,
  });
});

test('a caption follows its anchor, scales its size and adds the turn', () => {
  const doubled = { pivot: { x: 0, y: 0 }, scale: 2, rotation: 90 };

  expect(
    transformCaption(
      { type: 'text', id: 't', x: 10, y: 0, text: 'Cytoplasm' },
      doubled,
      12,
    ),
  ).toStrictEqual({
    type: 'text',
    id: 't',
    x: 0,
    y: 20,
    text: 'Cytoplasm',
    size: 24,
    rotation: 90,
  });
});

test('a picture scales and turns about its centre, and keeps what else it carries', () => {
  expect(
    transformPicture(
      {
        type: 'picture',
        id: 'p',
        x: 0,
        y: 0,
        width: 40,
        height: 20,
        src: 'data:image/svg+xml,',
        molfile: 'M  END',
      },
      { pivot: { x: 0, y: 0 }, scale: 2, rotation: 0 },
    ),
  ).toStrictEqual({
    type: 'picture',
    id: 'p',
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    src: 'data:image/svg+xml,',
    molfile: 'M  END',
  });
});
