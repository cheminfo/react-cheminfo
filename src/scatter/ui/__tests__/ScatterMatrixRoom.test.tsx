import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import { ScatterMatrix } from '../ScatterMatrix.tsx';
import {
  SCATTER_MATRIX_ROOM,
  scatterMatrixPlotSide,
  scatterMatrixRoom,
} from '../scatterMatrixLayout.ts';
import type { ScatterMatrixAxis } from '../scatterMatrixProps.ts';

const AXES: ScatterMatrixAxis[] = [
  { name: 'PC 1', share: 0.6 },
  { name: 'PC 2', share: 0.3 },
  { name: 'PC 3', share: 0.1 },
];

/**
 * Twelve rows: the second component runs from -125.9 to -124.6, so its axis
 * is written `-126.0` … `-124.5`, six characters where the usual room holds
 * three.
 */
const SCORES = rowMatrix(
  Array.from({ length: 12 }, (_, row) => [
    row - 6,
    -125.9 + (row * 1.3) / 11,
    (row % 4) / 2 - 0.75,
  ]),
);

/**
 * The left column's vertical axis titles, by the row of their cell: the `x`
 * each is drawn at, rotated about.
 * @param html - The grid's markup.
 * @returns The x of each title.
 */
function leftTitles(html: string): Record<string, number> {
  const titles: Record<string, number> = {};
  for (const part of html.split('data-scatter-cell="').slice(1)) {
    const [column, row] = part.slice(0, part.indexOf('"')).split(',');
    if (column !== '0' || row === undefined) continue;
    const rotation = /transform="rotate\(-90 (?<x>[\d.-]+) /u.exec(part);
    if (rotation?.groups?.x !== undefined) {
      titles[row] = Number(rotation.groups.x);
    }
  }
  return titles;
}

/**
 * The widths of the grid's columns, as its template writes them.
 * @param html - The grid's markup.
 * @returns The widths, in pixels.
 */
function columns(html: string): number[] {
  const template = /grid-template-columns:(?<widths>[^;"]+)/u.exec(html);
  return (template?.groups?.widths ?? '')
    .trim()
    .split(/\s+/u)
    .map((width) => Number.parseFloat(width));
}

test('labels no wider than the usual column keep the usual room', () => {
  expect(
    scatterMatrixRoom(
      [
        { min: 0, max: 1 },
        { min: -4, max: 4 },
        { min: 0.5, max: 2.5 },
      ],
      3,
      3,
    ),
  ).toStrictEqual(SCATTER_MATRIX_ROOM);
});

test('a column of labels below minus a hundred takes the room they need', () => {
  expect(
    scatterMatrixRoom(
      [
        { min: 0, max: 1 },
        { min: -150, max: -100 },
      ],
      2,
      3,
    ),
  ).toStrictEqual({ left: 63, bottom: SCATTER_MATRIX_ROOM.bottom });
});

test('the diagonal heading the column writes no ticks, so its range takes no room', () => {
  expect(
    scatterMatrixRoom(
      [
        { min: -150, max: -100 },
        { min: 0, max: 1 },
      ],
      2,
      3,
    ),
  ).toStrictEqual(SCATTER_MATRIX_ROOM);
});

test('each title up the left column stands beside its own labels, inside its cell', () => {
  const html = renderToStaticMarkup(
    <ScatterMatrix scores={SCORES} axes={AXES} width={523} />,
  );

  // The cell's own left edge is 0: the widest column of labels sets the room,
  // so its title stands at the grid's margin and title room less the tick,
  // 8 + 17 - 4; a narrower column's title stands that much further in.
  expect(leftTitles(html)).toStrictEqual({ '1': 21, '2': 37 });
  expect(scatterMatrixPlotSide(523, 3, 75)).toBe(132);
  expect(columns(html)).toStrictEqual([215, 148, 148]);
});
