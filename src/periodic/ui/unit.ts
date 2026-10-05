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
 */

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
 * @returns The length one per cent of that width is.
 */
export function unitValue(width: number): string {
  return `${(width / 100).toFixed(3)}px`;
}
