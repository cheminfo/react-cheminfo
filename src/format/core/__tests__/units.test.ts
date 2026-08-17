import { expect, test } from 'vitest';

import { formatBytes, formatDuration } from '../units.ts';

test('a size is written in the largest unit that keeps it under a thousand', () => {
  expect(formatBytes(0)).toBe('0 B');
  expect(formatBytes(512)).toBe('512 B');
  expect(formatBytes(1024)).toBe('1.0 kB');
  expect(formatBytes(1536)).toBe('1.5 kB');
  expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  expect(formatBytes(157_286_400)).toBe('150 MB');
  expect(formatBytes(1024 ** 5)).toBe('1.0 PB');
});

test('bytes stay whole, and the decimal is dropped once the number reaches a hundred', () => {
  expect(formatBytes(999)).toBe('999 B');
  expect(formatBytes(1024 * 99.5)).toBe('99.5 kB');
  expect(formatBytes(1024 * 100)).toBe('100 kB');
});

test('a size that is missing, negative or not a number reads as the missing marker', () => {
  expect(formatBytes(undefined)).toBe('–');
  expect(formatBytes(-1)).toBe('–');
  expect(formatBytes(Number.NaN)).toBe('–');
});

test('a duration is written with its two largest units', () => {
  expect(formatDuration(0)).toBe('0s');
  expect(formatDuration(1500)).toBe('2s');
  expect(formatDuration(59_000)).toBe('59s');
  expect(formatDuration(60_000)).toBe('1m 00s');
  expect(formatDuration(200_000)).toBe('3m 20s');
  expect(formatDuration(3_600_000)).toBe('1h 00m');
  expect(formatDuration(7_500_000)).toBe('2h 05m');
});

test('a duration that is missing, negative or not a number reads as the missing marker', () => {
  expect(formatDuration(undefined)).toBe('–');
  expect(formatDuration(-5)).toBe('–');
  expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('–');
});
