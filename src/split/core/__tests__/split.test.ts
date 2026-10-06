import { expect, test } from 'vitest';

import {
  MAX_SPLIT,
  MIN_SPLIT,
  SPLIT_PARAM,
  clampSplit,
  splitParam,
} from '../split.ts';

test('a share is a whole percentage, inside the range both panes stay readable in', () => {
  expect(clampSplit(42)).toBe(42);
  expect(clampSplit(41.6)).toBe(42);
  expect(clampSplit(0)).toBe(MIN_SPLIT);
  expect(clampSplit(-30)).toBe(MIN_SPLIT);
  expect(clampSplit(100)).toBe(MAX_SPLIT);
  expect(MIN_SPLIT).toBe(20);
  expect(MAX_SPLIT).toBe(80);
});

test('a page that wants its own range gets it', () => {
  expect(clampSplit(10, { min: 15, max: 85 })).toBe(15);
  expect(clampSplit(90, { min: 15, max: 85 })).toBe(85);
});

test('the parameter is named the same on every site', () => {
  expect(SPLIT_PARAM).toBe('split');
});

test('a link that names no share leaves the page at its own', () => {
  const codec = splitParam();

  expect(codec.parse(null)).toBeNull();
  expect(codec.parse('')).toBeNull();
  expect(codec.parse('half')).toBeNull();
  expect(codec.serialize(null)).toBeNull();
});

test('a share nobody could drag to still opens the page', () => {
  const codec = splitParam();

  // Brought back inside the range rather than rejected: a link written when
  // the range was wider must keep opening.
  expect(codec.parse('3')).toBe(MIN_SPLIT);
  expect(codec.parse('97')).toBe(MAX_SPLIT);
  expect(codec.parse('35.4')).toBe(35);
});

test('a share survives the address it is written into', () => {
  const codec = splitParam();
  for (const share of [MIN_SPLIT, 35, 42, 61, MAX_SPLIT]) {
    expect(codec.parse(codec.serialize(share))).toBe(share);
  }
});
