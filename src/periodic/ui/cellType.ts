/**
 * How large the writing in a cell is.
 *
 * Everything a cell holds is sized against the table's own width, so the same
 * drawing reads at 280px beside a chart and across a lecture-hall screen.
 *
 * Nothing is ever trimmed: a value cut short by an ellipsis is a wrong value —
 * `0.0899` read as `0.0…` is worse than not writing it at all. A line that is
 * still too wide at the size its table writes is condensed instead, which keeps
 * its height, its weight and its colour — the thing a reader compares two cells
 * on — while giving back the width it was missing.
 */

import { ADVANCE } from './glyphWidths.ts';
import { ofWidth } from './unit.ts';

/**
 * How wide one line of text is, in per cent of the table's width.
 *
 * A column of the grid is 4.85% of it; this is what a cell leaves of that once
 * its border and its padding are allowed for. One share rather than a share
 * less a few pixels, because the size a line is written at and the width it
 * then has are then the same arithmetic — which is what lets the scale that
 * condenses an over-wide line be a plain number rather than a length only the
 * engine can resolve.
 */
const TEXT_SHARE = 4.5;

/** The column the electron counts stand in, as a share of the table's width. */
export const SHELLS_SHARE = 1.2;

/**
 * The air between the symbol and that column, as a share of the table's width.
 *
 * Without it the widest symbols — `Md`, `Tm`, `Cm`, anything carrying an `M` or
 * an `m` — are written at the cap and end a pixel from the first electron, and
 * the cell reads as two things that collided rather than as two columns.
 */
export const SHELLS_GAP = 0.5;

/** What the counts and their air together take off the width of a cell. */
export const SHELLS_RESERVED = SHELLS_SHARE + SHELLS_GAP;

/** Largest the third line is written, as a share of the table's width. */
const DETAIL_CAP = 1.5;

/**
 * Smallest it is written, as a share of the table's width.
 *
 * Under this a name stops being readable at any table size, so the few names
 * that do not fit are condensed rather than written smaller — the table keeps
 * one size for all 118, which is what makes a column of them readable at a
 * glance.
 */
const DETAIL_FLOOR = 0.95;

/** What one tabular glyph advances, as a share of its own size. */
const TABULAR_EM = 0.6;

/** A string of digits, a decimal point, a sign, an exponent and nothing else. */
const NUMERIC = /^[\d\s.,+\-−×^eE]+$/u;

/** How the third line of a whole table is written. */
export interface DetailType {
  /** Size every cell writes it at, as a CSS length. */
  size: string;
  /** How wide one em of it is, in shares of the table's width. */
  sizeShare: number;
}

/**
 * The one size a table writes its third line at.
 *
 * The largest at which the widest of them fits, between a floor and a cap: a
 * table whose values are short writes them large, and one writing names writes
 * every name at the size the longest needs.
 * @param widths - How wide each line is, in ems of its own size.
 * @param reservedShare - Width taken by the electron counts, as a share of the
 * table's width; zero when none are written.
 * @returns The size, as a CSS length and as the share it was computed from.
 */
export function detailType(
  widths: readonly number[],
  reservedShare: number,
): DetailType {
  let widest = 1;
  for (const width of widths) {
    if (width > widest) widest = width;
  }
  const room = TEXT_SHARE - reservedShare;
  const share = rounded(
    Math.min(DETAIL_CAP, Math.max(DETAIL_FLOOR, room / widest)),
  );
  // A floor under which the type is not readable whatever the table is sized
  // to, which is the one case the share alone does not cover.
  return { size: `max(0.4rem, ${ofWidth(share)})`, sizeShare: share };
}

/**
 * How much a line has to be condensed to fit its cell.
 * @param widthInEm - How wide the line is, in ems of its own size.
 * @param type - What the table writes its third line at.
 * @param reservedShare - Width taken by the electron counts, as a share of the
 * table's width; zero when none are written.
 * @returns A horizontal scale, never above 1.
 */
export function condensedScale(
  widthInEm: number,
  type: DetailType,
  reservedShare: number,
): number {
  const room = TEXT_SHARE - reservedShare;
  return Math.min(1, room / (widthInEm * type.sizeShare));
}

/**
 * The size the symbol is written at.
 *
 * Every symbol is written at the same size, except the widest of them — the
 * ones whose second letter is an `m` — which are written a tenth smaller rather
 * than run into the edges of their cell.
 * @param symbol - The chemical symbol.
 * @param cap - Largest it is written, as a share of the table's width.
 * @param reservedShare - Width taken by the electron counts, as a share of the
 * table's width; zero when none are written.
 * @returns A CSS length.
 */
export function symbolFontSize(
  symbol: string,
  cap: number,
  reservedShare: number,
): string {
  const room = TEXT_SHARE - reservedShare;
  const share = rounded(Math.min(cap, room / (textWidthInEm(symbol) * BOLD)));
  return `max(0.5rem, ${ofWidth(share)})`;
}

/**
 * A share, at the precision a length is written to.
 * @param share - The share, in per cent of the table's width.
 * @returns The same share, rounded.
 */
export function rounded(share: number): number {
  return Number(share.toFixed(3));
}

/**
 * How wide a string is, in ems of its own size.
 *
 * A value is written with tabular figures, where every glyph — the decimal
 * point and the minus of an exponent included — advances the same width, so
 * counting its characters is the measurement. A name is proportional, and is
 * measured letter by letter: measured as figures, every name in the table would
 * be sized for a width it does not have.
 * @param text - The string.
 * @returns Its width, never zero.
 */
export function textWidthInEm(text: string): number {
  if (NUMERIC.test(text)) return Math.max(text.length, 1) * TABULAR_EM * SAFETY;
  let width = 0;
  for (const character of text) {
    width += glyphWidth(character);
  }
  return Math.max(width * SAFETY, TABULAR_EM);
}

/**
 * How wide one glyph is, in ems.
 *
 * Measured in the family's own type rather than guessed at by class: the four
 * classes a glyph can be sorted into put `Tm` an eighth wider than it is, which
 * is a symbol written an eighth smaller than its cell can take.
 * @param character - The glyph.
 * @returns Its advance.
 */
function glyphWidth(character: string): number {
  const measured = ADVANCE[character];
  if (measured !== undefined) return measured;
  return character >= 'a' && character <= 'z' ? 0.54 : 0.65;
}

/** What is added to every measurement, for the faces this one stands in for. */
const SAFETY = 1.04;

/** How much wider the same string is when it is set bold, as the symbol is. */
const BOLD = 1.08;

/**
 * The size a stack of electron counts is written at.
 *
 * Seven shells have to stand in the height of one cell, so the size is what
 * the deepest stack of the table leaves — francium's seven, wherever the table
 * writes any.
 * @param count - How many shells stand in the tallest stack.
 * @returns A CSS length.
 */
export function shellFontSize(count: number): string {
  const share = rounded(
    Math.min(SHELL_CAP, ROW_SHARE / (Math.max(count, 1) * SHELL_LEADING)),
  );
  return `max(0.3rem, ${ofWidth(share)})`;
}

/**
 * A horizontal scale, written as a transform.
 * @param scale - The scale, from {@link condensedScale}.
 * @returns The transform, or nothing at all when the line fits as it is.
 */
export function scaleX(scale: number): string | undefined {
  return scale >= 1 ? undefined : `scaleX(${scale.toFixed(3)})`;
}

/** The size the symbol is written at wherever it fits, as a share of the table. */
export const SYMBOL_CAP = 2.1;

/** How tall one row of the table is, as a share of its width. */
export const ROW_SHARE = 6.8;

/** The size the electron counts are written at where they have the room. */
const SHELL_CAP = 1.1;

/** The height one of them takes, in ems of its own size. */
export const SHELL_LEADING = 1.2;
