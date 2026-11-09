import { expect, test } from 'vitest';

import { NO_STOPS, pageStops, pagesInOrder } from '../pageStops.ts';
import type { Box } from '../types.ts';

function sheet(column: number, row = 0): Box {
  return { x: column * 100, y: row * 200, width: 100, height: 200 };
}

const THREE = [sheet(0), sheet(1), sheet(0, 1)];
/** A view on the first sheet, whole, with some of the next one beside it. */
const ON_FIRST: Box = { x: -10, y: -10, width: 150, height: 220 };
/** A view of the three sheets at once. */
const OVERVIEW: Box = { x: -10, y: -10, width: 300, height: 500 };
/** A view closer than a page, over the second sheet. */
const INSIDE_SECOND: Box = { x: 120, y: 20, width: 50, height: 50 };

function stops(focused: Box | null, visible = ON_FIRST, empty = false) {
  return pageStops({ sheets: THREE, empty, focused, visible });
}

test('a page shown alone goes to its neighbours, in reading order', () => {
  expect(stops(sheet(1))).toStrictEqual({
    place: 2,
    total: 3,
    previous: sheet(0),
    next: sheet(0, 1),
  });
});

test('the first page shown alone has no way back', () => {
  expect(stops(sheet(0))).toStrictEqual({
    place: 1,
    total: 3,
    previous: undefined,
    next: sheet(1),
  });
});

test('past the last page holding something lies a blank one, beside it', () => {
  expect(stops(sheet(0, 1))).toStrictEqual({
    place: 3,
    total: 3,
    previous: sheet(1),
    next: sheet(1, 1),
  });
});

test('a blank page counts while it has the focus, and has nothing after it', () => {
  expect(stops(sheet(1, 1))).toStrictEqual({
    place: 4,
    total: 4,
    previous: sheet(0, 1),
    next: undefined,
  });
});

test('a page emptied in the middle stays in its place while it has the focus', () => {
  const focused = sheet(1);

  expect(
    pageStops({
      sheets: [sheet(0), sheet(0, 1)],
      empty: false,
      focused,
      visible: ON_FIRST,
    }),
  ).toStrictEqual({
    place: 2,
    total: 3,
    previous: sheet(0),
    next: sheet(0, 1),
  });
});

test('with no page alone, the arrows start from the only page wholly in view', () => {
  expect(stops(null)).toStrictEqual({
    place: 1,
    total: 3,
    previous: sheet(0),
    next: sheet(1),
  });
});

test('closer than a page, they start from the page under the middle of the view', () => {
  expect(stops(null, INSIDE_SECOND)).toStrictEqual({
    place: 2,
    total: 3,
    previous: sheet(0),
    next: sheet(0, 1),
  });
});

test('over all the pages, they start at either end', () => {
  expect(stops(null, OVERVIEW)).toStrictEqual({
    place: 0,
    total: 3,
    previous: sheet(0, 1),
    next: sheet(0),
  });
});

test('an empty drawing has no arrows', () => {
  expect(
    pageStops({
      sheets: [sheet(0)],
      empty: true,
      focused: null,
      visible: ON_FIRST,
    }),
  ).toStrictEqual(NO_STOPS);
});

test('the page of a drawing emptied while shown alone has nowhere to go', () => {
  expect(
    pageStops({
      sheets: [sheet(0)],
      empty: true,
      focused: sheet(0),
      visible: ON_FIRST,
    }),
  ).toStrictEqual({
    place: 1,
    total: 1,
    previous: undefined,
    next: undefined,
  });
});

test('the pages to jump to are those holding something, and the blank one in focus', () => {
  expect(pagesInOrder(THREE, null)).toBe(THREE);
  expect(pagesInOrder(THREE, sheet(1))).toBe(THREE);
  expect(pagesInOrder(THREE, sheet(2))).toStrictEqual([
    sheet(0),
    sheet(1),
    sheet(2),
    sheet(0, 1),
  ]);
});
