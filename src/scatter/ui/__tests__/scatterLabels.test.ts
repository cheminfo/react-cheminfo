import { expect, test } from 'vitest';

import { scatterGroupLabels, scatterPointLabels } from '../scatterLabels.ts';

const POINTS = {
  x: Float64Array.from([0, 10, 20, 30]),
  y: Float64Array.from([0, 20, 40, 60]),
};

/** Two groups: the first two points, then the last two. */
const GROUP_OF = Int32Array.from([0, 0, 1, 1]);
const COLORS = ['var(--text)', 'var(--text-muted)'];

test('a point is named where it sits, in its own group’s colour', () => {
  expect(
    scatterPointLabels(POINTS, ['a', 'b', 'c', 'd'], {
      groupOf: GROUP_OF,
      colors: COLORS,
    }),
  ).toStrictEqual([
    { x: 0, y: 0, text: 'a', color: 'var(--text)' },
    { x: 10, y: 20, text: 'b', color: 'var(--text)' },
    { x: 20, y: 40, text: 'c', color: 'var(--text-muted)' },
    { x: 30, y: 60, text: 'd', color: 'var(--text-muted)' },
  ]);
});

test('a point with no name of its own is left unnamed rather than drawn empty', () => {
  const named = scatterPointLabels(POINTS, [undefined, 'b', '', 'd']);

  expect(named).toHaveLength(2);
  expect(named[0]).toStrictEqual({
    x: 10,
    y: 20,
    text: 'b',
    color: 'var(--text-muted)',
  });
  expect(named[1]?.text).toBe('d');
});

test('a point outside every group takes the ink that names nothing', () => {
  const named = scatterPointLabels(POINTS, ['a'], {
    groupOf: Int32Array.from([-1]),
    colors: COLORS,
  });

  expect(named).toStrictEqual([
    { x: 0, y: 0, text: 'a', color: 'var(--text-muted)' },
  ]);
});

test('a point that landed nowhere is skipped, and does not shift the rest', () => {
  const broken = {
    x: Float64Array.from([Number.NaN, 10]),
    y: Float64Array.from([0, 20]),
  };

  expect(scatterPointLabels(broken, ['a', 'b'])).toStrictEqual([
    { x: 10, y: 20, text: 'b', color: 'var(--text-muted)' },
  ]);
});

test('a group is named once, at the middle of the points in it', () => {
  expect(
    scatterGroupLabels(POINTS, ['First', 'Second'], {
      groupOf: GROUP_OF,
      colors: COLORS,
    }),
  ).toStrictEqual([
    { x: 5, y: 10, text: 'First', color: 'var(--text)', weight: 2 },
    { x: 25, y: 50, text: 'Second', color: 'var(--text-muted)', weight: 2 },
  ]);
});

test('a group nothing belongs to is not named at all', () => {
  const named = scatterGroupLabels(POINTS, ['First', 'Second', 'Empty'], {
    groupOf: GROUP_OF,
    colors: COLORS,
  });

  expect(named).toHaveLength(2);
  expect(named.map((label) => label.text)).toStrictEqual(['First', 'Second']);
});

test('nothing is named when no point says which group it is in', () => {
  expect(scatterGroupLabels(POINTS, ['First', 'Second'])).toStrictEqual([]);
});
