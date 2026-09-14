import { expect, test } from 'vitest';

import { isSpan, readZones, zoneBound } from '../zones.ts';

test('every entry of a zone list stays an entry, so the rows drawn and the zones numbered are one list', () => {
  expect(
    readZones([
      { from: '3', to: 5 },
      { from: 1, to: 2 },
    ]),
  ).toStrictEqual([
    { from: '3', to: 5 },
    { from: 1, to: 2 },
  ]);
});

test('an entry that is not an object reads as a zone with neither bound, and keeps its place', () => {
  expect(readZones([null, 7, { from: 1, to: 2 }])).toStrictEqual([
    {},
    {},
    { from: 1, to: 2 },
  ]);
});

test('a value that is not a list reads as no zones at all', () => {
  expect(readZones(undefined)).toStrictEqual([]);
  expect(readZones('nonsense')).toStrictEqual([]);
  expect(readZones({ from: 1, to: 2 })).toStrictEqual([]);
});

test('an entry is read back as the very object the settings hold, so editing another row writes it back unchanged', () => {
  const held = { from: 'x', to: 2, ignore: true };

  expect(readZones([held])[0]).toBe(held);
});

test('a bound is shown only when it is a number, zero included', () => {
  expect(zoneBound({ from: 0, to: '5' }, 'from')).toBe(0);
  expect(zoneBound({ from: 0, to: '5' }, 'to')).toBeUndefined();
  expect(zoneBound({}, 'from')).toBeUndefined();
});

test('a zone is usable only with both bounds as numbers, from below to', () => {
  expect(isSpan({ from: 1, to: 2 })).toBe(true);
  expect(isSpan({ from: 2, to: 2 })).toBe(false);
  expect(isSpan({ from: 3, to: 1 })).toBe(false);
  expect(isSpan({ from: 1 })).toBe(false);
  expect(isSpan({ from: '1', to: 2 })).toBe(false);
});
