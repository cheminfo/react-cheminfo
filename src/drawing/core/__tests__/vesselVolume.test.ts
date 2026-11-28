/**
 * A vessel holds liquid as a solid of revolution about its axis: a tube of
 * radius 10 mm and 50 mm tall holds π·10²·50 mm³, 15.71 mL.
 */

import { expect, test } from 'vitest';

import {
  halfWidthAt,
  heldVolume,
  levelForVolume,
  volumeBelow,
} from '../vesselVolume.ts';

const TUBE = [
  { x: -10, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 50 },
  { x: -10, y: 50 },
];

const CONE = [
  { x: -10, y: 0 },
  { x: 10, y: 0 },
  { x: 0, y: 30 },
];

test('the half-width is half the span the outline crosses at a height', () => {
  expect(halfWidthAt(TUBE, 25)).toBe(10);
  expect(halfWidthAt(CONE, 15)).toBe(5);
  expect(halfWidthAt(CONE, 40)).toBe(0);
});

test('a full tube holds π·r²·h', () => {
  expect(heldVolume(TUBE)).toBeCloseTo((Math.PI * 100 * 50) / 1000, 9);
  expect(heldVolume(CONE)).toBeCloseTo((Math.PI * 100 * 30) / 3000, 3);
});

test('half a tube stands at half its height, and what is below a level is read back', () => {
  const full = heldVolume(TUBE);

  expect(levelForVolume(TUBE, full / 2)).toBeCloseTo(25, 9);
  expect(volumeBelow(TUBE, 25)).toBeCloseTo(full / 2, 9);
  expect(volumeBelow(TUBE, 50)).toBe(0);
});

test('nothing stands at the bottom, more than the vessel holds stands nowhere', () => {
  expect(levelForVolume(TUBE, 0)).toBe(50);
  expect(levelForVolume(TUBE, -3)).toBe(50);
  expect(levelForVolume(TUBE, 100)).toBeUndefined();
});
