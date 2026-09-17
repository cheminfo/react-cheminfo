/**
 * The small answers the figure needs before it renders: how many rows there
 * are, what is colouring the lines, which rows are drawn over the mass, and
 * what a screen reader is told.
 *
 * Kept out of the component for the reason `scatterPlotModel.ts` is: none of
 * them needs React to be read or checked, and a component that is mostly
 * arithmetic is a component nobody can see the layout in.
 */

import { formatInteger } from '../../format/core/numbers.ts';
import type { ParallelHighlight } from '../core/parallelPaint.ts';
import type {
  ParallelAxis,
  ParallelColorBy,
  ParallelRanges,
} from '../core/parallelTypes.ts';

/**
 * How many rows the figure draws.
 * @param axes - The axes, whose columns are read.
 * @param count - What the caller insists on, if anything.
 * @returns The count — the shortest column, so no axis is ever read past its
 * own end.
 */
export function parallelRowCount(
  axes: readonly ParallelAxis[],
  count?: number,
): number {
  if (count !== undefined) return Math.max(0, Math.trunc(count));
  let shortest = 0;
  for (let index = 0; index < axes.length; index++) {
    const axis = axes[index];
    if (axis === undefined) continue;
    const length = axis.values.length;
    if (index === 0 || length < shortest) shortest = length;
  }
  return shortest;
}

/**
 * The quantity the lines are coloured by.
 * @param color - The quantity the caller gave outright.
 * @param colorAxis - The id of an axis already drawn, for the common case.
 * @param axes - The axes, to find that id among.
 * @returns The quantity, or `undefined` when the lines all take one ink. An
 * axis named by `colorAxis` lends its own domain as well as its values, so the
 * ramp and the axis beside it read the same range.
 */
export function parallelColorOf(
  color: ParallelColorBy | undefined,
  colorAxis: string | undefined,
  axes: readonly ParallelAxis[],
): ParallelColorBy | undefined {
  if (color !== undefined) return color;
  if (colorAxis === undefined) return undefined;
  for (const axis of axes) {
    if (axis.id !== colorAxis) continue;
    const domain = axis.domain;
    if (domain === undefined) return { values: axis.values };
    return {
      values: axis.values,
      min: Math.min(domain[0], domain[1]),
      max: Math.max(domain[0], domain[1]),
      logarithmic: axis.scale === 'log',
    };
  }
  return undefined;
}

/**
 * Whether any axis on the figure carries an interval at all.
 * @param axes - The axes, whose ids the intervals are keyed by.
 * @param ranges - The interval each axis keeps.
 * @returns Whether anything is brushed, which is what decides whether a line
 * is ever drawn in the excluded ink.
 */
export function parallelIsBrushed(
  axes: readonly ParallelAxis[],
  ranges: ParallelRanges,
): boolean {
  for (const axis of axes) {
    const range = ranges[axis.id];
    if (range !== null && range !== undefined) return true;
  }
  return false;
}

/**
 * The rows drawn over the mass, in the order they are painted.
 * @param selected - The rows singled out elsewhere.
 * @param hovered - The row under the pointer, or `-1`.
 * @param selectionInk - The ink a singled-out row takes.
 * @param hoverInk - The ink the hovered row takes.
 * @returns The highlights, the hovered row last so that it paints on top and
 * a row that is both selected and hovered is drawn once rather than twice.
 */
export function parallelHighlightsOf(
  selected: readonly number[] | undefined,
  hovered: number,
  selectionInk: string,
  hoverInk: string,
): ParallelHighlight[] {
  const highlights: ParallelHighlight[] = [];
  if (selected !== undefined) {
    for (const row of selected) {
      if (row < 0 || row === hovered) continue;
      highlights.push({ row, color: selectionInk });
    }
  }
  if (hovered >= 0) highlights.push({ row: hovered, color: hoverInk });
  return highlights;
}

/**
 * What a screen reader is told the figure shows.
 * @param axes - The axes, from left to right.
 * @param count - How many rows are drawn.
 * @returns The sentence, naming every axis and how much is on the figure.
 */
export function parallelFigureLabel(
  axes: readonly ParallelAxis[],
  count: number,
): string {
  const names: string[] = [];
  for (const axis of axes) names.push(axis.label);
  const rows = count === 1 ? '1 row' : `${formatInteger(count)} rows`;
  if (names.length === 0) return `Parallel coordinates of ${rows}.`;
  return `Parallel coordinates of ${rows}, on ${names.join(', ')}.`;
}
