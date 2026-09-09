import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { EllipsePoint } from '../../core/confidenceEllipse.ts';
import { confidenceEllipse } from '../../core/confidenceEllipse.ts';
import {
  scatterGroupSpread,
  scatterPairEllipse,
} from '../scatterGroupSpread.ts';

/* Three groups of five, none of them collinear in any pair of the four axes. */
const GROUP_OF = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];
const ROWS = GROUP_OF.map((group, row) => [
  Math.sin(row) + group * 4,
  Math.cos(row * 2) + group,
  Math.sin(row * 3 + 1) - group * 2,
  Math.cos(row + 2) + group * 0.5,
]);
const SCORES = rowMatrix(ROWS);

const SIZE = { kind: 'coverage', probability: 0.95 } as const;

function measured(): ReturnType<typeof scatterGroupSpread> {
  return scatterGroupSpread({
    scores: SCORES,
    groupOf: GROUP_OF,
    groups: 3,
    axes: 4,
    size: SIZE,
  });
}

function cloud(group: number, xAxis: number, yAxis: number): EllipsePoint[] {
  const points: EllipsePoint[] = [];
  for (let row = 0; row < ROWS.length; row++) {
    if (GROUP_OF[row] !== group) continue;
    points.push({
      x: SCORES.get(row, xAxis),
      y: SCORES.get(row, yAxis),
    });
  }
  return points;
}

test('one block of covariances gives the outline the pair would have alone', () => {
  const spread = measured();

  for (let group = 0; group < 3; group++) {
    for (let xAxis = 0; xAxis < 4; xAxis++) {
      for (let yAxis = 0; yAxis < 4; yAxis++) {
        if (xAxis === yAxis) continue;
        const apart = confidenceEllipse(cloud(group, xAxis, yAxis), {
          size: SIZE,
        });
        const together = scatterPairEllipse(spread, group, xAxis, yAxis);

        expect(apart).not.toBeNull();
        expect(together?.count).toBe(5);
        expect(together?.cx).toBeCloseTo(apart?.cx ?? 0, 12);
        expect(together?.cy).toBeCloseTo(apart?.cy ?? 0, 12);
        expect(together?.rx).toBeCloseTo(apart?.rx ?? 0, 12);
        expect(together?.ry).toBeCloseTo(apart?.ry ?? 0, 12);
        expect(together?.angle).toBeCloseTo(apart?.angle ?? 0, 12);
      }
    }
  }
});

test('a group smaller than the minimum has no shape worth drawing', () => {
  const spread = scatterGroupSpread({
    scores: SCORES,
    groupOf: GROUP_OF,
    groups: 3,
    axes: 4,
    minimumPoints: 6,
  });

  expect(spread.counts[0]).toBe(5);
  expect(scatterPairEllipse(spread, 0, 0, 1)).toBeNull();
});

test('a row with a gap in one axis is left out of every cell, not some', () => {
  const gapped = ROWS.map((row, index) =>
    index === 0 ? [Number.NaN, row[1] ?? 0, row[2] ?? 0, row[3] ?? 0] : row,
  );
  const spread = scatterGroupSpread({
    scores: rowMatrix(gapped),
    groupOf: GROUP_OF,
    groups: 3,
    axes: 4,
  });

  expect(spread.counts[0]).toBe(4);
  expect(spread.counts[1]).toBe(5);
  expect(scatterPairEllipse(spread, 0, 1, 2)?.count).toBe(4);
});

test('an axis or a group outside the block is nothing rather than a guess', () => {
  const spread = measured();

  expect(scatterPairEllipse(spread, 3, 0, 1)).toBeNull();
  expect(scatterPairEllipse(spread, 0, 0, 4)).toBeNull();
  expect(scatterPairEllipse(spread, 0, -1, 1)).toBeNull();
});

test('a size nothing finite covers is left undrawn rather than drawn wrong', () => {
  const spread = scatterGroupSpread({
    scores: SCORES,
    groupOf: GROUP_OF,
    groups: 3,
    axes: 4,
    size: { kind: 'coverage', probability: 1 },
  });

  expect(spread.standardDeviations).toBe(Number.POSITIVE_INFINITY);
  expect(scatterPairEllipse(spread, 0, 0, 1)).toBeNull();
});

test('a grid with no axes and no groups measures nothing at all', () => {
  const spread = scatterGroupSpread({
    scores: SCORES,
    groupOf: GROUP_OF,
    groups: 0,
    axes: 0,
  });

  expect(spread.counts).toHaveLength(0);
  expect(spread.covariances).toHaveLength(0);
  expect(scatterPairEllipse(spread, 0, 0, 1)).toBeNull();
});
