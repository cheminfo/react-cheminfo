/**
 * The pages the canvas's arrows go through, one at a time: the page the reader
 * is on, and where each arrow leads from it.
 */

import { boxContains } from './geometry.ts';
import type { Box } from './types.ts';

/** Which way a page is turned. */
export type PageDirection = 'previous' | 'next';

/** The reader's place among the pages. */
export interface PageStops {
  /** The place of the page in focus or in view, from 1; 0 for none. */
  place: number;
  /** How many pages there are to go through. */
  total: number;
  /**
   * Where the arrow back leads.
   * @default undefined — there is no such arrow
   */
  previous?: Box;
  /**
   * Where the arrow on leads.
   * @default undefined — there is no such arrow
   */
  next?: Box;
}

/** What the arrows are worked out from. */
export interface PageStopsInput {
  /** The sheets that hold something, in reading order. */
  sheets: readonly Box[];
  /** Whether nothing is drawn, so that the one sheet given holds nothing. */
  empty: boolean;
  /** The sheet shown alone, or null. */
  focused: Box | null;
  /** The box the view shows, in points. */
  visible: Box;
}

/** No arrows at all. */
export const NO_STOPS: PageStops = { place: 0, total: 0 };

/** Sheets of one grid closer than this are the same sheet, in points. */
const SAME_SHEET = 0.01;

/**
 * Where the arrows lead. A page shown alone goes to its neighbours, and from
 * the last page holding something to a blank one beyond it, which counts as a
 * page for as long as it has the focus. With no page shown alone, the arrows
 * start from the page in view: forward to the next one, back to the previous
 * one or, from the first, to the page in view itself. With no such page, they
 * start at either end. An empty drawing has no arrows until a page is shown.
 * @param input - The sheets, the focus and the view.
 * @returns The place, and where each arrow leads.
 */
export function pageStops(input: PageStopsInput): PageStops {
  const { sheets, empty, focused, visible } = input;
  if (empty && !focused) return NO_STOPS;
  const stops = pagesInOrder(sheets, focused);
  const here = focused
    ? stops.findIndex((sheet) => sameSheet(sheet, focused))
    : sheetInView(stops, visible);
  const total = stops.length;
  const current = stops[here];
  if (!current) {
    return { place: 0, total, previous: stops.at(-1), next: stops[0] };
  }
  const holdsSomething =
    !empty && sheets.some((sheet) => sameSheet(sheet, current));
  const previous = stops[here - 1] ?? (focused ? undefined : current);
  const next =
    stops[here + 1] ?? (holdsSomething ? sheetAfter(current) : undefined);
  return { place: here + 1, total, previous, next };
}

/**
 * The pages to go through, in reading order: those holding something, and a
 * blank one for as long as it has the focus.
 * @param sheets - The sheets that hold something, in reading order.
 * @param focused - The sheet shown alone, or null.
 * @returns The pages.
 */
export function pagesInOrder(
  sheets: readonly Box[],
  focused: Box | null,
): readonly Box[] {
  return focused ? withSheet(sheets, focused) : sheets;
}

function sameSheet(a: Box, b: Box): boolean {
  return Math.abs(a.x - b.x) < SAME_SHEET && Math.abs(a.y - b.y) < SAME_SHEET;
}

// The sheets with one more, in reading order: a blank page has the focus.
function withSheet(sheets: readonly Box[], added: Box): readonly Box[] {
  if (sheets.some((sheet) => sameSheet(sheet, added))) return sheets;
  return [...sheets, added].toSorted((a, b) => a.y - b.y || a.x - b.x);
}

function sheetAfter(sheet: Box): Box {
  return { ...sheet, x: sheet.x + sheet.width };
}

// The one page wholly in view; several are an overview of the pages, with none
// to start from. Closer than a whole page, the page under the middle of the view.
function sheetInView(sheets: readonly Box[], visible: Box): number {
  let whole = -1;
  for (let index = 0; index < sheets.length; index++) {
    if (!isInside(sheets[index] as Box, visible)) continue;
    if (whole !== -1) return -1;
    whole = index;
  }
  if (whole !== -1) return whole;
  const middle = {
    x: visible.x + visible.width / 2,
    y: visible.y + visible.height / 2,
  };
  return sheets.findIndex((sheet) => boxContains(sheet, middle));
}

function isInside(sheet: Box, visible: Box): boolean {
  return (
    sheet.x >= visible.x &&
    sheet.y >= visible.y &&
    sheet.x + sheet.width <= visible.x + visible.width &&
    sheet.y + sheet.height <= visible.y + visible.height
  );
}
