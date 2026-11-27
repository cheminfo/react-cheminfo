import { expect, test } from 'vitest';

import {
  SUPERCELL_ATOM_CAP,
  largestRepeatThatFits,
  repeatedAtomCount,
} from '../cellStack.ts';

test('a 2x2x2 stack is eight cells, not four', () => {
  // The old site started its first loop at 1 and its other two at 0, so half
  // the stack was never drawn.
  expect(repeatedAtomCount(8, 2)).toBe(64);
  expect(repeatedAtomCount(8, 1)).toBe(8);
  expect(repeatedAtomCount(8, 3)).toBe(216);
  expect(repeatedAtomCount(8, 4)).toBe(512);
  expect(repeatedAtomCount(192, 4)).toBe(12288);
});

test('the stack shrinks to what the page will draw, never below one cell', () => {
  expect(SUPERCELL_ATOM_CAP).toBe(20000);
  // Halite: 8 atoms a cell, so 4x4x4 is 512 and fits with room to spare.
  expect(largestRepeatThatFits(8, 4)).toBe(4);
  // 400 atoms a cell: 4^3 is 25600 and 3^3 is 10800.
  expect(largestRepeatThatFits(400, 4)).toBe(3);
  // 2400 atoms a cell: 2^3 is 19200 and 3^3 is 64800.
  expect(largestRepeatThatFits(2400, 4)).toBe(2);
  expect(largestRepeatThatFits(2600, 4)).toBe(1);
  // One cell is drawn whole however big it is: the alternative is a blank page.
  expect(largestRepeatThatFits(50000, 4)).toBe(1);
  expect(largestRepeatThatFits(8, 4, 100)).toBe(2);
});
