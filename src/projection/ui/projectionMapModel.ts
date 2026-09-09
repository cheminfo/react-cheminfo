/**
 * Where a map's samples land, and which corner of the picture is free.
 *
 * It sits beside the component rather than inside it because a plot has to
 * know where its dots fall before it can decide where its controls may sit,
 * and because all of it is arithmetic that can be checked without rendering
 * anything. The words the same tab writes are in `projectionMapChrome.ts`.
 */

import {
  chartColumnExtent,
  chartPadExtent,
} from '../../chart/core/chartExtent.ts';
import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import type { MatrixLike } from '../../chart/core/matrix.ts';
import { emptiestCorner } from '../../overlay/core/emptiestCorner.ts';
import type { OverlayCorner } from '../../overlay/core/overlayPlacement.ts';
import type {
  ScatterGroup,
  ScatterMarker,
} from '../../scatter/ui/ScatterPlot.tsx';
import type {
  ProjectionMarker,
  ProjectionResult,
} from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

/** Where every sample sits on the map, in the embedding's own units. */
export interface ProjectionMapCloud {
  /** Horizontal coordinate of every sample, in row order. */
  x: Float64Array;
  /** Vertical coordinate of every sample, in the same order. */
  y: Float64Array;
}

/**
 * A dot, a marker or an average that stands for no group at all.
 *
 * It has to be the one ink on the map that names nothing, or a reader counts
 * it as one more group.
 */
export const UNGROUPED_INK = 'var(--text-faint)';

/**
 * How many samples a group needs before it is outlined at all. Below it the
 * shape of the outline says more about the one sample than about the group.
 */
export const MINIMUM_OUTLINE_POINTS = 3;

/**
 * The two score columns the map draws, read out of the matrix once.
 *
 * The columns are copied because a plot takes two arrays and a matrix cannot
 * hand out one of its columns. It is the only copy the tab makes: every range,
 * every outline and every hit test afterwards reads the data where it stands.
 * @param scores - Where every sample landed.
 * @param xColumn - Which column runs left to right.
 * @param yColumn - Which one runs bottom to top.
 * @returns The two columns.
 */
export function projectionMapCloud(
  scores: MatrixLike,
  xColumn: number,
  yColumn: number,
): ProjectionMapCloud {
  const count = Math.max(0, scores.rows);
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  for (let row = 0; row < count; row++) {
    x[row] = scores.get(row, xColumn);
    y[row] = scores.get(row, yColumn);
  }
  return { x, y };
}

/**
 * The range one axis covers, over every sample or over a chosen few.
 *
 * Handing it a selection is what "zoom to selection" is: the same frame drawn
 * around fewer rows, rather than a second transform layered under the first.
 * @param scores - Where every sample landed.
 * @param column - Which column the axis draws.
 * @param rows - The rows to cover; an empty or absent list covers them all.
 * @returns The range, as a frame takes it.
 */
export function projectionMapDomain(
  scores: MatrixLike,
  column: number,
  rows?: readonly number[],
): readonly [number, number] {
  const covered = rows === undefined || rows.length === 0 ? undefined : rows;
  const extent = chartColumnExtent(scores, column, { indices: covered });
  return [extent.min, extent.max];
}

/**
 * The frame drawn around a chosen few samples, which is what "zoom to
 * selection" hands the map.
 *
 * Room is left around them: a frame pulled tight on the outermost dots puts
 * half of them on the edge of the picture, where a dot is hard to read and its
 * name has nowhere to go.
 * @param scores - Where every sample landed.
 * @param xColumn - Which column runs left to right.
 * @param yColumn - Which one runs bottom to top.
 * @param rows - The rows to frame; an empty or absent list frames them all.
 * @param padding - Share added at each end. Defaults to {@link SELECTION_ROOM}.
 * @returns The frame, in the embedding's own units.
 */
export function projectionMapViewport(
  scores: MatrixLike,
  xColumn: number,
  yColumn: number,
  rows?: readonly number[],
  padding = SELECTION_ROOM,
): ChartViewport {
  return {
    x: withRoom(projectionMapDomain(scores, xColumn, rows), padding),
    y: withRoom(projectionMapDomain(scores, yColumn, rows), padding),
  };
}

/**
 * The corner of the map with the fewest dots under it.
 *
 * All four are offered. The chrome that asks is laid out inside the plot
 * rectangle rather than over the figure's box, so no corner of it costs the
 * reader an axis label, and the only thing left to weigh is how many samples
 * each one would cover.
 * @param cloud - Where every sample sits, in data units.
 * @param xDomain - The range the horizontal axis covers.
 * @param yDomain - The range the vertical axis covers.
 * @param width - Width of the plot rectangle, in pixels.
 * @param height - Its height.
 * @returns The corner the card sits in.
 */
export function projectionMapCorner(
  cloud: ProjectionMapCloud,
  xDomain: readonly [number, number],
  yDomain: readonly [number, number],
  width: number,
  height: number,
): OverlayCorner {
  return emptiestCorner(
    placeAlong(cloud.x, xDomain, width, false),
    placeAlong(cloud.y, yDomain, height, true),
    { width, height, cardWidth: CARD_WIDTH, cardHeight: CARD_HEIGHT },
  );
}

/**
 * The reference points of a result, placed on the two axes the map draws.
 * @param markers - The reference points, in the embedding's own units.
 * @param groups - The groups, whose colours the markers borrow.
 * @param xColumn - Which axis runs left to right.
 * @param yColumn - Which one runs bottom to top.
 * @returns The markers a plot can draw; one standing off the two axes drawn is left out.
 */
export function projectionMapMarkers(
  markers: readonly ProjectionMarker[],
  groups: ResolvedProjectionGroups,
  xColumn: number,
  yColumn: number,
): ScatterMarker[] {
  const placed: ScatterMarker[] = [];
  for (const marker of markers) {
    const x = marker.position[xColumn];
    const y = marker.position[yColumn];
    if (x === undefined || y === undefined) continue;
    placed.push({
      label: marker.label,
      x,
      y,
      color: groups.entries[marker.group ?? -1]?.color ?? UNGROUPED_INK,
      shape: marker.shape ?? 'cross',
    });
  }
  return placed;
}

/**
 * The groups in the shape a plot colours by.
 * @param groups - The groups as the viewer resolved them.
 * @returns One entry per group, in the order they are coloured.
 */
export function projectionScatterGroups(
  groups: ResolvedProjectionGroups,
): ScatterGroup[] {
  const plotted: ScatterGroup[] = [];
  for (const entry of groups.entries) {
    plotted.push({ id: entry.id, label: entry.label, color: entry.color });
  }
  return plotted;
}

/**
 * What one axis of the map is called.
 *
 * Built by `chartAxisTitle` rather than assembled here, so a component reads
 * `PC1 — 73.0 %` in exactly the form every other figure in the package writes
 * it, and a method that publishes no share gets a bare name instead of a
 * percentage nobody can stand behind.
 * @param result - The reduced space being drawn.
 * @param index - Which axis.
 * @returns The title, or `undefined` for an axis the result does not have.
 */
export function projectionAxisTitle(
  result: ProjectionResult,
  index: number,
): string | undefined {
  const axis = result.axes[index];
  if (axis === undefined) return undefined;
  return chartAxisTitle(axis.name, { share: axis.share });
}

function withRoom(
  domain: readonly [number, number],
  padding: number,
): readonly [number, number] {
  const extent = chartPadExtent({ min: domain[0], max: domain[1] }, padding);
  return [extent.min, extent.max];
}

function placeAlong(
  values: Float64Array,
  domain: readonly [number, number],
  size: number,
  flip: boolean,
): Float64Array {
  const span = domain[1] - domain[0];
  const factor = span === 0 ? 0 : size / span;
  const pixels = new Float64Array(values.length);
  for (let index = 0; index < values.length; index++) {
    const along = ((values[index] ?? Number.NaN) - domain[0]) * factor;
    pixels[index] = flip ? size - along : along;
  }
  return pixels;
}

/**
 * How much of the plot the floating key is expected to cover.
 *
 * It is an estimate on purpose — the card has not been laid out when the
 * corner is chosen — and it is the compact key's size rather than the roomier
 * card the overlay domain assumes: a corner counted as three species wide
 * would call a corner busy that the key never reaches.
 */
const CARD_WIDTH = 170;
const CARD_HEIGHT = 84;

/** Room left around a framed selection, as a share of its own span. */
const SELECTION_ROOM = 0.1;
