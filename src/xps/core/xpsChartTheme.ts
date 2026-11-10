/**
 * What an XPS chart draws that no other spectrum does, and how.
 *
 * The axes, the grid, the crosshair, the highlight and the peak label spacing
 * are the family's, from the shared chart theme, so an XPS chart and a mass
 * spectrum on one page are read against the same frame. What is left here
 * belongs to XPS alone: the regions a file defined a background under, the
 * envelope over a fit, the fitted components themselves, and the wash over a
 * chart a file is being dropped onto.
 *
 * Each colour is a custom property with a literal fallback baked in, applied
 * through the `style` prop rather than through the matching SVG attribute —
 * `var()` is a CSS value, and a presentation attribute is not parsed as one.
 */

/** The colours of what an XPS chart draws beyond the shared frame. */
export const XPS_CHART_COLORS = {
  /** The band shading a region the file defined a background under. */
  region: 'var(--xps-region, rgba(100, 116, 139, 0.09))',
  /** Its edges, which is where the background was anchored. */
  regionBorder: 'var(--xps-region-border, #cbd5e1)',
  /** What the region is called, written at the top of its band. */
  regionLabel: 'var(--xps-region-label, #64748b)',
  /** The sum of the fitted components, drawn over the trace it claims to be. */
  envelope: 'var(--xps-envelope, #334155)',
  /** The wash over a chart a file is being dragged onto. */
  dropOverlay: 'var(--xps-drop-overlay, rgba(37, 99, 235, 0.08))',
  /** Its border, and the text inviting the drop. */
  dropBorder: 'var(--xps-drop-border, #2563eb)',
} as const;

/** The type sizes of what an XPS chart writes beyond the shared frame. */
export const XPS_CHART_FONT = {
  /** The name written at the top of a region band. */
  region: 10,
  /** What a chart being dropped onto says. */
  overlay: 13,
} as const;

/**
 * The geometry of a label pinned above an XPS peak, beyond the line spacing the
 * shared `PEAK_LABEL` already holds.
 */
export const XPS_PEAK_LABEL = {
  /**
   * How far the mark on a named peak reaches down from its maximum, so the
   * numbers written above it are unambiguously about that peak and not about the
   * shoulder beside it.
   */
  topMark: 8,
  /**
   * How wide a label is taken to be while its neighbours are being spaced, in
   * pixels. Six characters of the label font at its widest, which is what
   * `284.80` measures — the caption line is usually shorter and never the one
   * that decides.
   */
  width: 42,
} as const;

/**
 * How a trace is drawn, in pixels.
 *
 * The highlighted width is not merely thicker but thick enough to be seen
 * without* looking for it: a reader running down a table of fifty spectra is
 * watching the chart out of the corner of their eye, and a half-pixel change
 * says nothing at that distance.
 */
export const TRACE_WIDTH = {
  /** An ordinary trace. */
  normal: 1,
  /** The one the panels act on. */
  selected: 1.75,
  /** The one the pointer is resting on, wherever it was hovered. */
  highlighted: 2.5,
} as const;

/** How a fitted component is drawn. */
export const COMPONENT_STYLE = {
  /** How opaque the fill under one is. */
  fillOpacity: 0.18,
  /** How opaque it becomes once the pointer rests on it. */
  highlightOpacity: 0.42,
  /** How thick its outline is. */
  strokeWidth: 1,
  /** How thick the envelope over them all is. */
  envelopeWidth: 1.25,
  /** What the envelope is dashed with, so it is never read as the measurement. */
  envelopeDash: '5 3',
} as const;
