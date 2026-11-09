/**
 * Two sizes a drawing can set, which never touch one another: the paper or the
 * slide it is laid out on, a grid of sheets that printing follows; and its
 * saved figure, the drawing and a narrow margin unless a journal column says
 * otherwise.
 */

import type { Box, DrawPage, FigureSize } from './types.ts';
import { isFiniteNumber, isRecord } from './values.ts';

/** Points in a centimetre. */
export const POINTS_PER_CM = 72 / 2.54;

/** The smallest and the largest side of a page, in points: 1 cm to 3 m. */
export const PAGE_LIMITS = { min: POINTS_PER_CM, max: 300 * POINTS_PER_CM };

/** How a sheet lies. */
export type Orientation = 'portrait' | 'landscape';

/** A paper or a slide offered in one pick. */
interface NamedSize<Size> {
  /** Identifier. */
  id: string;
  /** Its name in a menu. */
  name: string;
  /** The size. */
  size: Size;
}

/** The paper most of the world prints on. */
export const A4: DrawPage = { width: 595.28, height: 841.89 };

/** The paper the Americas print on, for the most part. */
export const US_LETTER: DrawPage = { width: 612, height: 792 };

/** The papers offered, upright. */
export const PAPER_SIZES: ReadonlyArray<NamedSize<DrawPage>> = [
  { id: 'a3', name: 'A3', size: { width: 841.89, height: 1190.55 } },
  { id: 'a4', name: 'A4', size: A4 },
  { id: 'a5', name: 'A5', size: { width: 419.53, height: 595.28 } },
  { id: 'letter', name: 'US Letter', size: US_LETTER },
  { id: 'legal', name: 'US Legal', size: { width: 612, height: 1008 } },
];

/**
 * The slides PowerPoint and Keynote open at, 13.33 × 7.5 in and 10 × 7.5 in,
 * lying wide.
 */
export const SLIDE_SIZES: ReadonlyArray<NamedSize<DrawPage>> = [
  { id: 'slide-wide', name: 'Slide 16:9', size: { width: 960, height: 540 } },
  { id: 'slide', name: 'Slide 4:3', size: { width: 720, height: 540 } },
];

/** What the Page row offers: the papers, then the slides. */
export const PAGE_SIZES: ReadonlyArray<NamedSize<DrawPage>> = [
  ...PAPER_SIZES,
  ...SLIDE_SIZES,
];

/**
 * How a sheet lies; a square one counts as upright.
 * @param page - The sheet.
 * @returns Its orientation.
 */
export function orientationOf(page: DrawPage): Orientation {
  return page.width > page.height ? 'landscape' : 'portrait';
}

/**
 * A sheet lying a given way.
 * @param page - The sheet.
 * @param orientation - How it should lie.
 * @returns The sheet, its sides swapped when it lay the other way.
 */
export function turnedTo(page: DrawPage, orientation: Orientation): DrawPage {
  return orientationOf(page) === orientation
    ? page
    : { width: page.height, height: page.width };
}

/**
 * The sheet a pick from the Page row makes: a paper lies the way the page does,
 * and a slide lies wide, as a projector shows it.
 * @param chosen - The size picked, as the row offers it.
 * @param current - The page it replaces.
 * @returns The sheet.
 */
export function pickedPage(chosen: DrawPage, current: DrawPage): DrawPage {
  return orientationOf(chosen) === 'landscape'
    ? chosen
    : turnedTo(chosen, orientationOf(current));
}

/**
 * A sheet laid over a drawing anew. Its grid is placed once, here, so that it
 * stays put while objects are moved across its lines.
 * @param page - The sheet.
 * @param fitted - The box the drawing and its padding take up, in points.
 * @returns The sheet, with its place.
 */
export function pageOver(page: DrawPage, fitted: Box): DrawPage {
  return placedPage({ width: page.width, height: page.height }, fitted);
}

/**
 * A sheet with its place: the one it holds or, for a sheet that holds none, its
 * place over the drawing. Along each side, a drawing that fits is centred on
 * the sheet, and one that does not starts at its edge and runs on to the next.
 * @param page - The sheet.
 * @param fitted - The box the drawing and its padding take up, in points.
 * @returns The sheet, `x` and `y` set.
 */
export function placedPage(page: DrawPage, fitted: Box): Required<DrawPage> {
  return {
    ...page,
    x: page.x ?? placeOf(fitted.x, fitted.width, page.width),
    y: page.y ?? placeOf(fitted.y, fitted.height, page.height),
  };
}

/**
 * Whether two figures are the same size, to a hundredth of a point.
 * @param size - A size, or undefined for one that fits the drawing.
 * @param other - Another.
 * @returns True when each side matches.
 */
export function sameFigureSize(
  size: FigureSize | undefined,
  other: FigureSize | undefined,
): boolean {
  return (
    sameSide(size?.width, other?.width) && sameSide(size?.height, other?.height)
  );
}

/**
 * Whether two sheets are the same size, whichever way each of them lies.
 * @param page - A sheet.
 * @param other - Another.
 * @returns True when each side matches, the sides swapped or not.
 */
export function samePaper(page: DrawPage, other: DrawPage): boolean {
  return sameFigureSize(turnedTo(page, orientationOf(other)), {
    width: other.width,
    height: other.height,
  });
}

/**
 * A sheet from parsed JSON, each side brought inside the limits.
 * @param value - What the document's `page` holds.
 * @returns The sheet, or undefined unless it sets both sides.
 */
export function parsePage(value: unknown): DrawPage | undefined {
  if (!isRecord(value)) return undefined;
  const { width, height, x, y } = value;
  if (!isFiniteNumber(width) || !isFiniteNumber(height)) return undefined;
  const page: DrawPage = { width: clampSide(width), height: clampSide(height) };
  if (isFiniteNumber(x)) page.x = x;
  if (isFiniteNumber(y)) page.y = y;
  return page;
}

/**
 * A figure's size from parsed JSON, each side brought inside the limits.
 * @param value - What the document's `figure` holds.
 * @returns The size, or undefined when it fixes no side.
 */
export function parseFigureSize(value: unknown): FigureSize | undefined {
  if (!isRecord(value)) return undefined;
  const size: FigureSize = {};
  const { width, height } = value;
  if (isFiniteNumber(width)) size.width = clampSide(width);
  if (isFiniteNumber(height)) size.height = clampSide(height);
  return size.width === undefined && size.height === undefined
    ? undefined
    : size;
}

/**
 * A side of a page, inside the limits.
 * @param length - The side, in points.
 * @returns It, at least 1 cm and at most 3 m.
 */
export function clampSide(length: number): number {
  return Math.min(PAGE_LIMITS.max, Math.max(PAGE_LIMITS.min, length));
}

/**
 * A length in points, written in centimetres.
 * @param points - The length.
 * @returns It, as `8.5 cm`.
 */
export function centimetres(points: number): string {
  return `${(points / POINTS_PER_CM).toFixed(1)} cm`;
}

/**
 * A width and a height in points, written in millimetres.
 * @param width - The width.
 * @param height - The height.
 * @returns Them, as `32.5 × 20.1 mm`.
 */
export function sizeInMillimetres(width: number, height: number): string {
  const perMillimetre = POINTS_PER_CM / 10;
  return `${(width / perMillimetre).toFixed(1)} × ${(height / perMillimetre).toFixed(1)} mm`;
}

function placeOf(start: number, length: number, side: number): number {
  return length > side ? start : start + (length - side) / 2;
}

function sameSide(side: number | undefined, other: number | undefined) {
  if (side === undefined || other === undefined) return side === other;
  return Math.abs(side - other) < 0.01;
}
