import { expect, test } from 'vitest';

import {
  booleanParam,
  enumParam,
  integerParam,
  stringParam,
} from '../params.ts';

test('a flag is on as soon as the link names it', () => {
  const flag = booleanParam();

  expect(flag.parse(null)).toBe(false);
  expect(flag.parse('')).toBe(true);
  expect(flag.parse('1')).toBe(true);
  expect(flag.parse('yes')).toBe(true);
  expect(flag.parse('0')).toBe(false);
  expect(flag.parse('False')).toBe(false);
});

test('a flag left at its default is deleted rather than written', () => {
  const off = booleanParam();

  expect(off.serialize(false)).toBeNull();
  expect(off.serialize(true)).toBe('1');

  const on = booleanParam({ default: true });

  expect(on.parse(null)).toBe(true);
  expect(on.serialize(true)).toBeNull();
  expect(on.serialize(false)).toBe('0');
});

test('a number outside the range is brought back inside it', () => {
  const count = integerParam({ min: 1, max: 100, default: 10 });

  expect(count.parse('4000')).toBe(100);
  expect(count.parse('-3')).toBe(1);
  expect(count.parse('1e999')).toBe(100);
  expect(count.serialize(4000)).toBe('100');
  expect(count.serialize(-3)).toBe('1');
});

test('a malformed number falls back to its default', () => {
  const count = integerParam({ min: 1, max: 100, default: 10 });

  expect(count.parse(null)).toBe(10);
  expect(count.parse('')).toBe(10);
  expect(count.parse('  ')).toBe(10);
  expect(count.parse('lots')).toBe(10);
  expect(count.parse('12abc')).toBe(10);
});

test('a number is rounded, since the parameter counts whole things', () => {
  const count = integerParam({ min: 1, max: 100, default: 10 });

  expect(count.parse('12.6')).toBe(13);
  expect(count.parse(' 7 ')).toBe(7);
  expect(count.serialize(12.4)).toBe('12');
});

test('a number with no default of its own is absent until a link names one', () => {
  const seed = integerParam({ min: 0, max: 999, default: null });

  expect(seed.parse(null)).toBeNull();
  expect(seed.parse('42')).toBe(42);
  expect(seed.serialize(null)).toBeNull();
  expect(seed.serialize(42)).toBe('42');
});

test('a number equal to its default is deleted rather than written', () => {
  const zoom = integerParam({ min: 1, max: 3, default: 2 });

  expect(zoom.serialize(2)).toBeNull();
  expect(zoom.serialize(3)).toBe('3');
});

test('a free-text value is taken exactly as written', () => {
  const query = stringParam();

  expect(query.parse(null)).toBe('');
  expect(query.parse(' CC O ')).toBe(' CC O ');
  expect(query.serialize('')).toBeNull();
  expect(query.serialize('CCO')).toBe('CCO');
});

test('a free-text value longer than the limit is cut', () => {
  const query = stringParam({ maxLength: 4 });

  expect(query.parse('alkanes')).toBe('alka');
  expect(query.serialize('alkanes')).toBe('alka');
});

test('a free-text value can differ from a default that is not empty', () => {
  const mode = stringParam({ default: 'sticks' });

  expect(mode.parse(null)).toBe('sticks');
  expect(mode.parse('')).toBe('');
  expect(mode.serialize('sticks')).toBeNull();
  expect(mode.serialize('')).toBe('');
});

test('a name the tool does not know falls back to the one it does', () => {
  const level = enumParam(['beginner', 'advanced'] as const, 'beginner');

  expect(level.parse(null)).toBe('beginner');
  expect(level.parse(' advanced ')).toBe('advanced');
  expect(level.parse('fiendish')).toBe('beginner');
  expect(level.serialize('beginner')).toBeNull();
  expect(level.serialize('advanced')).toBe('advanced');
});
