/**
 * Every rule the figure is drawn with.
 *
 * The library ships no stylesheet for a figure — a chart writes inline style
 * objects, so a site that never renders one pays nothing and a site that does
 * cannot forget to import a file. The two colours that are not fixed here, the
 * axis ink and the band's, are resolved off the page by `parallelInk.ts` and
 * written onto the elements, so an override applies to the canvas and to the
 * markup alike.
 */

import type { CSSProperties } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';

/** A layer covering the whole figure, stacked over the ones before it. */
export const PARALLEL_LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
} as const satisfies CSSProperties;

/**
 * The block the figure occupies, which every layer is positioned against.
 * @param height - Total height of the figure, in pixels.
 * @returns The wrapper's rules.
 */
export function parallelFigureStyle(height: number): CSSProperties {
  return {
    position: 'relative',
    height: Math.max(0, height),
    minWidth: 0,
  };
}

/**
 * One of the two canvases, stretched over the figure.
 * @param height - Total height of the figure, in pixels.
 * @returns The canvas's rules.
 */
export function parallelCanvasStyle(height: number): CSSProperties {
  return {
    ...PARALLEL_LAYER_STYLE,
    width: '100%',
    height: Math.max(0, height),
  };
}

/** The drawing surface the axes, the bands and the pointer target live in. */
export const PARALLEL_SVG_STYLE = {
  ...PARALLEL_LAYER_STYLE,
  display: 'block',
  overflow: 'visible',
} as const satisfies CSSProperties;

/**
 * The layer the axis names sit in. It is HTML rather than SVG text so that a
 * name can carry a tooltip, and it lets every pointer event through so that a
 * brush started under a name still starts.
 */
export const PARALLEL_LABELS_STYLE = {
  ...PARALLEL_LAYER_STYLE,
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/**
 * One axis name, centred over its axis and taking the pointer back.
 * @param left - Where the axis stands, in pixels from the figure's left edge.
 * @returns The name's rules.
 */
export function parallelLabelStyle(left: number): CSSProperties {
  return {
    position: 'absolute',
    top: 2,
    left,
    transform: 'translateX(-50%)',
    color: TOKEN.text,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    pointerEvents: 'auto',
  };
}

/** One tick written out, tabular so a column of them lines up on the point. */
export const PARALLEL_TICK_LABEL_STYLE = {
  fontSize: 10,
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
} as const satisfies CSSProperties;

/** How far a tick mark reaches out of the axis, in pixels. */
export const PARALLEL_TICK_LENGTH = 4;

/** How far a tick label ends before its axis. */
export const PARALLEL_TICK_LABEL_INSET = 7;

/**
 * The interval one brush keeps, filled in the site's own colour.
 * @param ink - The colour to fill and outline it in.
 * @returns The band's rules.
 */
export function parallelBandStyle(ink: string): CSSProperties {
  return {
    fill: ink,
    fillOpacity: 0.16,
    stroke: ink,
    strokeOpacity: 0.55,
  };
}

/**
 * Either edge of a band, drawn so the reader can see it can be dragged.
 * @param ink - The colour to draw it in.
 * @returns The handle's rules.
 */
export function parallelHandleStyle(ink: string): CSSProperties {
  return { fill: ink, fillOpacity: 0.9 };
}

/** How tall an edge handle is drawn, in pixels. */
export const PARALLEL_HANDLE_HEIGHT = 3;

/**
 * The card over the row under the pointer.
 * @param left - Where it sits, in pixels from the figure's left edge.
 * @param top - Where it sits, in pixels from its top edge.
 * @returns The card's rules.
 */
export function parallelTooltipStyle(left: number, top: number): CSSProperties {
  return {
    position: 'absolute',
    zIndex: 5,
    left,
    top,
    padding: '4px 8px',
    borderRadius: 6,
    background: TOKEN.text,
    color: TOKEN.surface,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.4,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: TOKEN.shadowMedium,
  };
}
