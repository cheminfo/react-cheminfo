import { expect, test } from 'vitest';

import {
  EACH_SEED,
  freshSeed,
  parseSeed,
  pickSeeded,
  seedParam,
} from '../seed.ts';

const POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

// Drawn by the copies the sites ship today — atoms, inorganic and moles with
// `getFloat`, dbe with `getUint32` and a series that wraps — so a link a
// teacher handed out keeps opening the same questions once a site adopts this.
test('a seed draws the series the trio of sites draws', () => {
  expect(pickSeeded(POOL, 5, 0)).toStrictEqual(['a', 'j', 'e', 'g', 'h']);
  expect(pickSeeded(POOL, 5, 1)).toStrictEqual(['c', 'e', 'i', 'b', 'a']);
  expect(pickSeeded(POOL, 5, 42)).toStrictEqual(['b', 'e', 'c', 'd', 'j']);
  expect(pickSeeded(POOL, 5, 4271)).toStrictEqual(['i', 'a', 'b', 'h', 'd']);
  expect(pickSeeded(POOL, 5, 4_294_967_295)).toStrictEqual([
    'h',
    'b',
    'e',
    'g',
    'f',
  ]);
});

test('a seed draws the series dbe draws, round the pool and back', () => {
  const options = { draw: 'getUint32', wrap: true } as const;

  expect(pickSeeded(POOL, 13, 0, options).join('')).toBe('adecfhjbigade');
  expect(pickSeeded(POOL, 13, 1, options).join('')).toBe('icgdebahjficg');
  expect(pickSeeded(POOL, 13, 42, options).join('')).toBe('cagfihjdebcag');
  expect(pickSeeded(POOL, 13, 4271, options).join('')).toBe('edcfbhgjaiedc');
  expect(pickSeeded(POOL, 13, 999_999, options).join('')).toBe('jbchiagedfjbc');
});

test('asking for more keeps the questions already drawn', () => {
  expect(pickSeeded(POOL, 6, 7).slice(0, 3)).toStrictEqual(
    pickSeeded(POOL, 3, 7),
  );
});

test('a series never repeats a question and never outgrows its pool', () => {
  const series = pickSeeded(POOL, 20, 1);

  expect(series).toHaveLength(10);
  expect(new Set(series).size).toBe(10);
  expect(pickSeeded([], 5, 1, { wrap: true })).toStrictEqual([]);
  expect(pickSeeded(POOL, -3, 1)).toStrictEqual([]);
});

test('the pool itself is never reordered', () => {
  const pool = [...POOL];
  pickSeeded(pool, 10, 42, { draw: 'getUint32' });

  expect(pool).toStrictEqual(POOL);
});

test('a seed read from an address is an unsigned 32-bit integer or nothing', () => {
  expect(parseSeed('123')).toBe(123);
  expect(parseSeed('4294967295')).toBe(4_294_967_295);
  expect(parseSeed('4294967296')).toBeNull();
  expect(parseSeed('-1')).toBeNull();
  expect(parseSeed('1.5')).toBeNull();
  expect(parseSeed(undefined)).toBeNull();
  expect(parseSeed(null)).toBeNull();
});

test('a seed outside the range a site pins reads as none', () => {
  const range = { min: 0, max: 999_999 };

  expect(parseSeed('999999', range)).toBe(999_999);
  expect(parseSeed('1000000', range)).toBeNull();
});

test('a fresh seed is a valid one, inside the range asked for', () => {
  const seed = freshSeed();

  expect(parseSeed(String(seed))).toBe(seed);

  for (let draw = 0; draw < 200; draw++) {
    const pinned = freshSeed({ min: 10, max: 20 });

    expect(Number.isInteger(pinned)).toBe(true);
    expect(pinned).toBeGreaterThanOrEqual(10);
    expect(pinned).toBeLessThanOrEqual(20);
  }
});

test('a seed a link pins is read as the number it names, clamped', () => {
  const codec = seedParam({ min: 0, max: 999_999 });

  expect(codec.parse('4271')).toBe(4271);
  expect(codec.parse(' 4271 ')).toBe(4271);
  expect(codec.parse('0')).toBe(0);
  expect(codec.parse('1000000')).toBe(999_999);
  expect(codec.parse('-1')).toBe(0);
  expect(codec.parse('Infinity')).toBe(0);
  expect(codec.serialize(4271.4)).toBe('4271');
});

test('a link that asks for a set per student says so in one word', () => {
  const codec = seedParam({ min: 0, max: 999_999 });

  expect(codec.parse(EACH_SEED)).toBe(EACH_SEED);
  expect(codec.parse(' Each ')).toBe(EACH_SEED);
  expect(codec.serialize(EACH_SEED)).toBe(EACH_SEED);
});

test('a seed nobody can read means no series at all', () => {
  const codec = seedParam({ min: 0, max: 999_999 });

  expect(codec.parse(null)).toBeNull();
  expect(codec.parse('')).toBeNull();
  expect(codec.parse('today')).toBeNull();
  expect(codec.serialize(null)).toBeNull();
});
