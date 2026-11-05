/**
 * The length the whole table is drawn in multiples of.
 *
 * Every part of the drawing — the height of a row, the type in a cell, the
 * band the inner-transition series were lifted out across — is a share of the
 * table's own width, so the same table reads at 280px beside a chart and fills
 * a lecture-hall screen at twice that.
 *
 * The share is a measured length rather than a container-query unit, because
 * WebKit resolves `cqw` against the container's *zoomed* width and then applies
 * the zoom to the result a second time: inside a host that zooms the page — a
 * PowerPoint add-in frame runs at 1.34 — every cq length came out 34% too
 * large, which fits none of the floors the type is held above and overran the
 * cells. `ResizeObserver` reports the content box in the element's own CSS
 * pixels, which is the space `font-size` is resolved in, so one hundredth of
 * that number is the share, on every engine and at any zoom.
 * `getBoundingClientRect` is not: it reports the zoomed width, which would
 * reproduce the defect.
 *
 * `1cqw` stays as the fallback, so a render that never measures — a server
 * render, a prerendered page before its script runs — is the drawing it has
 * always been.
 *
 * Every share is written for the 18-column table. A 32-column table of the same
 * width draws each column 18/32 as wide, so its unit is scaled by as much, and a
 * cell keeps its proportions and the room its writing was sized for.
 */

import type { TableColumns } from '../core/geometry.ts';

/** The custom property the measured share is published as. */
export const UNIT_PROPERTY = '--periodic-unit';

/** One per cent of the table's width, as a CSS length. */
export const UNIT = `var(${UNIT_PROPERTY}, 1cqw)`;

/**
 * A share of the table's width, as a CSS length.
 * @param share - The share, in per cent of the width.
 * @returns A CSS length, usable wherever a length is.
 */
export function ofWidth(share: number): string {
  return `calc(${UNIT} * ${String(share)})`;
}

/**
 * The value the custom property takes for a table of the given width.
 * @param width - The content-box width, in CSS pixels, as `ResizeObserver`
 * reports it.
 * @param columns - How many columns the table is drawn in.
 * @returns The length one per cent of that width is, for an 18-column table,
 * and that length scaled by 18/32 for a 32-column one.
 * @default columns 18
 */
export function unitValue(width: number, columns: TableColumns = 18): string {
  const unit = `${(width / 100).toFixed(3)}px`;
  const scale = columnScale(columns);
  // Scaled by the engine rather than here, so the measured length is exactly
  // the fallback's: rounded first, the two differ by a fraction of a pixel per
  // row, and the table changing height on its first measurement makes every
  // observer above it fire again in the same frame.
  return scale === 1 ? unit : `calc(${unit} * ${String(scale)})`;
}

/**
 * The value the custom property takes before the table is measured.
 * @param columns - How many columns the table is drawn in.
 * @returns `1cqw` scaled to the width of a column, or `undefined` for an
 * 18-column table, which falls back to `1cqw` without declaring anything.
 */
export function fallbackUnit(columns: TableColumns): string | undefined {
  const scale = columnScale(columns);
  return scale === 1 ? undefined : `calc(1cqw * ${String(scale)})`;
}

/** The column count every share of the drawing is written for. */
const REFERENCE_COLUMNS = 18;

function columnScale(columns: TableColumns): number {
  return REFERENCE_COLUMNS / columns;
}
