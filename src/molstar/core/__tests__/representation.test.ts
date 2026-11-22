import { expect, test } from 'vitest';

import { atomRadius, bondRadius } from '../representation.ts';

test('a carbon is drawn at a quarter of its van der Waals radius in ball and stick', () => {
  expect(atomRadius('ball-and-stick', 1, 1.7)).toBeCloseTo(0.425, 10);
  expect(atomRadius('ball-and-stick', 2, 1.7)).toBeCloseTo(0.85, 10);
});

test('spacefill draws the van der Waals radius itself at size 1', () => {
  expect(atomRadius('spacefill', 1, 1.7)).toBeCloseTo(1.7, 10);
  expect(atomRadius('spacefill', 0.5, 2)).toBeCloseTo(1, 10);
});

test('sticks draw every atom at the stick radius, whatever the element', () => {
  expect(atomRadius('stick', 1, 1.7)).toBeCloseTo(0.3, 10);
  expect(atomRadius('stick', 1, 1.1)).toBeCloseTo(0.3, 10);
});

test('a bond is 0.17 Å beside a carbon ball, a stick, or nothing in spacefill', () => {
  expect(bondRadius('ball-and-stick', 1)).toBeCloseTo(0.17, 10);
  expect(bondRadius('stick', 1)).toBeCloseTo(0.3, 10);
  expect(bondRadius('spacefill', 1)).toBe(0);
});

test('a ball and stick bond is sized by its own factor, whatever the balls', () => {
  const bond = 0.17;

  expect(bondRadius('ball-and-stick', 0.4, 1)).toBeCloseTo(bond, 10);
  expect(bondRadius('ball-and-stick', 2, 0.5)).toBeCloseTo(bond / 2, 10);
  expect(bondRadius('stick', 0.4, 2)).toBeCloseTo(0.12, 10);
});
