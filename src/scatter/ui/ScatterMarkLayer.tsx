import type { ReactElement } from 'react';

import type { ScreenPoints } from '../core/screenPoints.ts';

import type { ScatterPixelMark } from './scatterMarkGlyph.tsx';
import { markGlyph } from './scatterMarkGlyph.tsx';

export type { ScatterPixelMark } from './scatterMarkGlyph.tsx';

/** What {@link ScatterMarkLayer} draws. */
export interface ScatterMarkLayerProps {
  /** Where every point sits, in the frame's pixels. */
  points: ScreenPoints;
  /**
   * One entry per point, a non-zero entry meaning selected.
   * @default undefined — nothing is ringed
   */
  selected?: Uint8Array;
  /**
   * The point under the pointer, or `-1`.
   * @default -1
   */
  hovered?: number;
  /**
   * The point the keyboard cursor is on, or `-1`.
   * @default -1
   */
  focused?: number;
  /**
   * Radius of a dot in the layer below, which every ring is measured out from.
   * @default 3.5
   */
  radius?: number;
  /**
   * Which group each point belongs to; only the group averages read it.
   * @default undefined — no average can be worked out
   */
  groupOf?: ArrayLike<number>;
  /**
   * The colour of each group, in group order.
   * @default undefined
   */
  colors?: readonly string[];
  /**
   * Whether each group's average is marked with a cross. A sample far from its
   * own cross is the one the grouping fits worst.
   * @default false
   */
  showGroupMeans?: boolean;
  /**
   * Points drawn over the cloud that are not samples — a cluster centre.
   * @default undefined
   */
  marks?: readonly ScatterPixelMark[];
  /**
   * Side of the square a mark is drawn in, in pixels.
   * @default 11
   */
  markSize?: number;
}

/**
 * The rings, the group averages and the marks that sit over the cloud.
 *
 * Selection is a ring and never a change of colour: a dot's colour is the one
 * thing the reader came for, and recolouring it to say "chosen" trades the
 * answer for the question. The pointer's ring sits wider and heavier and the
 * keyboard cursor's is wider again and dashed, so a reader driving the plot by
 * keyboard while the mouse rests on it can still tell the three apart.
 * @param props - See {@link ScatterMarkLayerProps}.
 * @returns The rings and marks.
 */
export function ScatterMarkLayer(props: ScatterMarkLayerProps): ReactElement {
  const {
    points,
    selected,
    hovered = -1,
    focused = -1,
    radius = 3.5,
    groupOf,
    colors,
    showGroupMeans = false,
    marks,
    markSize = 11,
  } = props;

  const glyphs = showGroupMeans
    ? groupMeanGlyphs(points, groupOf, colors, markSize)
    : [];
  const laid = marks?.length ?? 0;
  for (let index = 0; index < laid; index++) {
    const mark = marks?.[index];
    if (mark !== undefined) glyphs.push(markGlyph(mark, markSize, `k${index}`));
  }

  return (
    <g data-layer="marks" strokeWidth={2.2} strokeLinecap="round">
      {selectionRings(points, selected, radius)}
      {ring(points, hovered, radius + GAPS.hover, 'hover', 2)}
      {ring(points, focused, radius + GAPS.focus, 'focus', 1, '2 2')}
      {glyphs}
    </g>
  );
}

/**
 * How far outside the dot each ring sits: tight for a selection, clear of that
 * for the pointer, clear of both for a cursor that can land where it already is.
 */
const GAPS = { selection: 2.5, hover: 5.5, focus: 8.5 } as const;
const RING_STYLE = { fill: 'none', stroke: 'var(--accent)' } as const;
const SELECTION_WIDTH = 1.5;

/**
 * A ring around every selected point, keyed by the point it rings.
 *
 * The rings are built here rather than one component per point: a lasso over a
 * crowd selects thousands at once, and a component call per ring is the cost
 * this layer exists to avoid.
 * @param points - Where every point sits, in the frame's pixels.
 * @param selected - One entry per point, a non-zero entry meaning selected.
 * @param radius - Radius of a dot in the layer below.
 * @returns One ring per selected point that has somewhere to be drawn.
 */
function selectionRings(
  points: ScreenPoints,
  selected: Uint8Array | undefined,
  radius: number,
): ReactElement[] {
  const rings: ReactElement[] = [];
  if (selected === undefined) return rings;
  const count = Math.min(points.x.length, points.y.length, selected.length);
  for (let index = 0; index < count; index++) {
    if (selected[index] === 0) continue;
    const x = points.x[index];
    const y = points.y[index];
    if (x === undefined || !Number.isFinite(x)) continue;
    if (y === undefined || !Number.isFinite(y)) continue;
    rings.push(
      <circle
        key={index}
        data-ring="select"
        cx={round(x)}
        cy={round(y)}
        r={radius + GAPS.selection}
        strokeWidth={SELECTION_WIDTH}
        {...RING_STYLE}
      />,
    );
  }
  return rings;
}

/**
 * The one ring that says where the pointer or the keyboard cursor is.
 * @param points - Where every point sits, in the frame's pixels.
 * @param index - The point to ring, or `-1` for none.
 * @param radius - Radius of the ring itself, in pixels.
 * @param kind - What the ring is saying, as its `data-ring` attribute.
 * @param width - How heavily it is drawn.
 * @param dashes - Its `stroke-dasharray`, for a cursor that must read as one.
 * @returns The ring, or `null` when there is no point to draw it on.
 */
function ring(
  points: ScreenPoints,
  index: number,
  radius: number,
  kind: string,
  width: number,
  dashes?: string,
): ReactElement | null {
  if (index < 0) return null;
  const x = points.x[index];
  const y = points.y[index];
  if (x === undefined || !Number.isFinite(x)) return null;
  if (y === undefined || !Number.isFinite(y)) return null;
  return (
    <circle
      data-ring={kind}
      cx={round(x)}
      cy={round(y)}
      r={radius}
      strokeWidth={width}
      strokeDasharray={dashes}
      {...RING_STYLE}
    />
  );
}

/**
 * A cross at each group's average, in the group's own colour.
 * @param points - Where every point sits, in the frame's pixels.
 * @param groupOf - Which group each point belongs to.
 * @param colors - The colour of each group, in group order.
 * @param size - Side of the square a cross is drawn in, in pixels.
 * @returns One cross per group that anything belongs to.
 */
function groupMeanGlyphs(
  points: ScreenPoints,
  groupOf: ArrayLike<number> | undefined,
  colors: readonly string[] | undefined,
  size: number,
): ReactElement[] {
  const glyphs: ReactElement[] = [];
  if (groupOf === undefined || colors === undefined) return glyphs;
  const sums = groupMeans(points, groupOf, colors.length);
  for (let group = 0; group < colors.length; group++) {
    const seen = sums[group * 3 + 2] ?? 0;
    const color = colors[group];
    if (seen === 0 || color === undefined) continue;
    const x = (sums[group * 3] ?? 0) / seen;
    const y = (sums[group * 3 + 1] ?? 0) / seen;
    const at = { label: 'Group average', x, y, color };
    glyphs.push(markGlyph(at, size, `m${group}`));
  }
  return glyphs;
}

/*
 * Each group's running total, as `x`, `y` and how many landed in it. Averaging
 * pixels is the same answer as averaging data values on a linear axis and one
 * pass fewer; one flat array costs nothing for a group nobody belongs to.
 */
function groupMeans(
  points: ScreenPoints,
  groupOf: ArrayLike<number>,
  groups: number,
): Float64Array {
  const sums = new Float64Array(groups * 3);
  const total = Math.min(points.x.length, points.y.length, groupOf.length);
  for (let index = 0; index < total; index++) {
    const group = groupOf[index];
    if (group === undefined || group < 0 || group >= groups) continue;
    const x = points.x[index];
    const y = points.y[index];
    if (x === undefined || !Number.isFinite(x)) continue;
    if (y === undefined || !Number.isFinite(y)) continue;
    sums[group * 3] = (sums[group * 3] ?? 0) + x;
    sums[group * 3 + 1] = (sums[group * 3 + 1] ?? 0) + y;
    sums[group * 3 + 2] = (sums[group * 3 + 2] ?? 0) + 1;
  }
  return sums;
}

const round = (value: number): number => Math.round(value * 100) / 100;
