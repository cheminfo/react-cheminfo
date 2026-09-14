import { expect, test } from 'vitest';

import { formatRelativeTime } from '../relativeTime.ts';

const NOW = Date.parse('2026-09-14T12:00:00.000Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test('under a minute either way is just now', () => {
  expect(formatRelativeTime(NOW, { now: NOW })).toBe('just now');
  expect(formatRelativeTime(NOW - 59_999, { now: NOW })).toBe('just now');
  expect(formatRelativeTime(NOW + 5000, { now: NOW })).toBe('just now');
});

test('the largest unit that fits is used, and the count is rounded towards zero', () => {
  expect(formatRelativeTime(NOW - MINUTE, { now: NOW })).toBe('1 minute ago');
  expect(formatRelativeTime(NOW - 15 * MINUTE, { now: NOW })).toBe(
    '15 minutes ago',
  );
  expect(formatRelativeTime(NOW - 90 * MINUTE, { now: NOW })).toBe(
    '1 hour ago',
  );
  expect(formatRelativeTime(NOW - 5 * HOUR, { now: NOW })).toBe('5 hours ago');
  expect(formatRelativeTime(NOW - 3 * DAY, { now: NOW })).toBe('3 days ago');
  expect(formatRelativeTime(NOW - 13 * DAY, { now: NOW })).toBe('last week');
  expect(formatRelativeTime(NOW - 20 * DAY, { now: NOW })).toBe('2 weeks ago');
  expect(formatRelativeTime(NOW - 65 * DAY, { now: NOW })).toBe('2 months ago');
  expect(formatRelativeTime(NOW - 800 * DAY, { now: NOW })).toBe('2 years ago');
});

test('one day back is yesterday, and a future instant is written ahead', () => {
  expect(formatRelativeTime(NOW - DAY, { now: NOW })).toBe('yesterday');
  expect(formatRelativeTime(NOW + DAY, { now: NOW })).toBe('tomorrow');
  expect(formatRelativeTime(NOW + 3 * DAY, { now: NOW })).toBe('in 3 days');
  expect(formatRelativeTime(NOW + 2 * HOUR, { now: NOW })).toBe('in 2 hours');
});

test('an ISO timestamp and a date are read like epoch milliseconds', () => {
  expect(
    formatRelativeTime('2026-09-14T07:00:00.000Z', { now: new Date(NOW) }),
  ).toBe('5 hours ago');
  expect(formatRelativeTime(new Date(NOW - 2 * MINUTE), { now: NOW })).toBe(
    '2 minutes ago',
  );
});

test('an instant that is missing or unreadable writes the missing text', () => {
  expect(formatRelativeTime(undefined, { now: NOW })).toBe('–');
  expect(formatRelativeTime('', { now: NOW })).toBe('–');
  expect(formatRelativeTime('not a date', { now: NOW })).toBe('–');
  expect(formatRelativeTime(Number.NaN, { now: NOW })).toBe('–');
  expect(formatRelativeTime(undefined, { missing: 'unknown' })).toBe('unknown');
  expect(formatRelativeTime('garbage', { now: NOW, missing: '' })).toBe('');
});
