import { expect, test } from 'vitest';

import { isSameMinimum, isSameShape } from '../conformerMinimum.ts';
import type { ConformerShape } from '../conformerShape.ts';

test('one minimum needs the same energy, the same moments and the same chirality', () => {
  const shape = { moments: [1, 2, 3], chirality: 0.6 } as const;

  expect(
    isSameMinimum(-3.5609, shape, -3.5609, {
      moments: [1, 2, 3.002],
      chirality: 0.6,
    }),
  ).toBe(true);
  expect(isSameMinimum(-3.5609, shape, -3.5605, shape)).toBe(true);
  expect(isSameMinimum(-3.5609, shape, -3.558, shape)).toBe(false);
  expect(
    isSameMinimum(-3.5609, shape, -3.5609, {
      moments: [1, 2.01, 3],
      chirality: 0.6,
    }),
  ).toBe(false);
});

test('mirror images of a chiral minimum are two minima', () => {
  const left = { moments: [8.549, 19.545, 59.833], chirality: -0.637 } as const;
  const right = { moments: [8.549, 19.545, 59.833], chirality: 0.637 } as const;

  expect(isSameMinimum(-4.2938, left, -4.2938, right)).toBe(false);
});

test('a shape that is its own mirror image stays one minimum despite rounding', () => {
  const moments = [25.733, 64.549, 90.031] as const;

  expect(
    isSameMinimum(2.3945, { moments, chirality: -0.00028 }, 2.3945, {
      moments,
      chirality: 0.00028,
    }),
  ).toBe(true);
});

test('two shapes are compared without their energies', () => {
  const chair: ConformerShape = { moments: [10, 20, 20], chirality: 0 };
  const sameChair: ConformerShape = { moments: [10, 20.01, 20], chirality: 0 };
  const twist: ConformerShape = { moments: [10, 24, 20], chirality: 0 };
  const mirror: ConformerShape = { moments: [10, 20, 20], chirality: -0.4 };
  const chiral: ConformerShape = { moments: [10, 20, 20], chirality: 0.4 };

  expect(isSameShape(chair, sameChair)).toBe(true);
  expect(isSameShape(chair, twist)).toBe(false);
  expect(isSameShape(chiral, mirror)).toBe(false);
  // The energies would have decided it otherwise: same shape, energies apart.
  expect(isSameMinimum(0, chair, 5, sameChair)).toBe(false);
  expect(isSameShape(chair, sameChair)).toBe(true);
});
