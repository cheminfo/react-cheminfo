/**
 * Boxes lined up or spaced out, or both: by how much each one moves. They line
 * up on the box they fit in together, and they are spaced out inside it, so a
 * selection stays where it is and only its parts move.
 */

import { roundCoordinate } from './geometry.ts';
import type { Box, Point } from './types.ts';

/** A way of arranging boxes. */
export type Arrangement =
  | 'left'
  | 'centre'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom'
  | 'distribute-horizontally'
  | 'distribute-vertically'
  | 'row'
  | 'column';

/**
 * What an arrangement does along one axis: brings each box to a line, given as
 * a share of its side; leaves equal gaps in the room there is (`even`); or
 * leaves equal gaps no smaller than the smallest allowed (`apart`), as boxes
 * brought to one line would otherwise land on one another.
 */
type Step = number | 'even' | 'apart';

const PLANS: Record<Arrangement, { x?: Step; y?: Step }> = {
  left: { x: 0 },
  centre: { x: 0.5 },
  right: { x: 1 },
  top: { y: 0 },
  middle: { y: 0.5 },
  bottom: { y: 1 },
  'distribute-horizontally': { x: 'even' },
  'distribute-vertically': { y: 'even' },
  row: { x: 'apart', y: 0.5 },
  column: { x: 0.5, y: 'apart' },
};

/** Where a box lies along one axis. */
interface Span {
  start: number;
  size: number;
}

/**
 * How far each box moves in an arrangement. An alignment brings an edge or the
 * middle of each box to the same line. A distribution leaves the same gap
 * between neighbours, whatever their sizes, in the room their extent gives. A
 * row or a column does both, and grows about its middle where the room is too
 * small.
 * @param boxes - The boxes.
 * @param arrangement - How to arrange them.
 * @param smallestGap - The smallest gap of a row or a column, in points.
 * @default 0
 * @returns How far each box moves, to the hundredth of a point, in the order
 * of the boxes.
 */
export function arrangementShifts(
  boxes: readonly Box[],
  arrangement: Arrangement,
  smallestGap = 0,
): Point[] {
  const across = boxes.map((box) => ({ start: box.x, size: box.width }));
  const down = boxes.map((box) => ({ start: box.y, size: box.height }));
  const plan = PLANS[arrangement];
  const x = offsetsAlong(across, down, plan.x, smallestGap);
  const y = offsetsAlong(down, across, plan.y, smallestGap);
  return x.map((offset, index) => ({
    x: roundCoordinate(offset),
    y: roundCoordinate(y[index] ?? 0),
  }));
}

function offsetsAlong(
  spans: readonly Span[],
  crossing: readonly Span[],
  step: Step | undefined,
  smallestGap: number,
): number[] {
  if (step === undefined) return spans.map(() => 0);
  if (step === 'even') return distributedOffsets(spans, spans, -Infinity);
  if (step === 'apart') {
    // Boxes spread further the other way are a stack being laid out: they keep
    // the order they are read in, top to bottom becoming left to right.
    const readAlong = spreadOf(crossing) > spreadOf(spans) ? crossing : spans;
    return distributedOffsets(spans, readAlong, smallestGap);
  }
  return alignedOffsets(spans, step);
}

function alignedOffsets(spans: readonly Span[], share: number): number[] {
  const { start, end } = extentOf(spans);
  const line = start + share * (end - start);
  return spans.map((span) => line - (span.start + share * span.size));
}

function distributedOffsets(
  spans: readonly Span[],
  readAlong: readonly Span[],
  smallestGap: number,
): number[] {
  const { start, end } = extentOf(spans);
  let sizes = 0;
  for (const span of spans) sizes += span.size;
  const gaps = Math.max(1, spans.length - 1);
  const gap = Math.max(smallestGap, (end - start - sizes) / gaps);
  const inOrder = spans
    .map((span, index) => ({ span, index }))
    .toSorted(
      (a, b) => middleOf(readAlong[a.index]) - middleOf(readAlong[b.index]),
    );
  const offsets: number[] = spans.map(() => 0);
  let at = (start + end - sizes - gap * gaps) / 2;
  for (const { span, index } of inOrder) {
    offsets[index] = at - span.start;
    at += span.size + gap;
  }
  return offsets;
}

function middleOf(span: Span | undefined): number {
  return span ? span.start + span.size / 2 : 0;
}

function spreadOf(spans: readonly Span[]): number {
  let lowest = Infinity;
  let highest = -Infinity;
  for (const span of spans) {
    const middle = middleOf(span);
    if (middle < lowest) lowest = middle;
    if (middle > highest) highest = middle;
  }
  return highest - lowest;
}

function extentOf(spans: readonly Span[]): { start: number; end: number } {
  let start = Infinity;
  let end = -Infinity;
  for (const span of spans) {
    if (span.start < start) start = span.start;
    if (span.start + span.size > end) end = span.start + span.size;
  }
  return { start, end };
}
