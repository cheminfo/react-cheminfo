import type { ReactElement } from 'react';
import { memo } from 'react';

import { chartGroupIndex } from '../../chart/core/chartGroups.ts';
import { chartRoundPixel } from '../../chart/core/chartScale.ts';
import type { OverlaySampleShape } from '../../overlay/core/overlayMarks.ts';
import { pointShapePath } from '../core/pointShape.ts';
import type { ScreenPoints } from '../core/screenPoints.ts';

/** What {@link ScatterPointLayer} draws. */
export interface ScatterPointLayerProps {
  /**
   * Where every point already sits, in the frame's pixels. The layer never
   * sees a data value, which is what lets a zoom, a resize and a change of
   * axis all arrive here as the same thing.
   */
  points: ScreenPoints;
  /**
   * Which group each point belongs to, as an index into `colors`. An entry of
   * `-1`, or one outside the range, is a point in no group.
   * @default undefined — every point is one crowd
   */
  groupOf?: ArrayLike<number>;
  /**
   * The colour of each group, in the order the groups were given.
   * @default undefined — every point takes `fallbackColor`
   */
  colors?: readonly string[];
  /**
   * How strongly each group is drawn, in the same order. This is what a
   * legend entry switching a group off actually changes — the dots stay where
   * they are, so the reader can still see the shape they are hiding.
   * @default undefined — every group is drawn at full strength
   */
  opacities?: readonly number[];
  /**
   * Which shape each point takes, as an index into `shapes`. An entry of `-1`,
   * or one outside the range, is a disc.
   * @default undefined — every point is a disc
   */
  shapeOf?: ArrayLike<number>;
  /**
   * The shapes, in the order `shapeOf` names them.
   * @default undefined
   */
  shapes?: readonly OverlaySampleShape[];
  /**
   * Colour of a point belonging to no group. It has to be the one ink on the
   * plot that names nothing, or a reader counts it as one more group.
   * @default 'var(--text-faint)'
   */
  fallbackColor?: string;
  /**
   * Radius of a dot, in pixels.
   * @default 3.5
   */
  radius?: number;
  /**
   * One radius per point, in pixels, for a figure whose dots are not all the
   * same size — a cloud draws the dots at the front of its box larger.
   * @default undefined — every dot takes `radius`
   */
  radii?: ArrayLike<number>;
  /**
   * The rows in the order they are painted, for a figure where a dot in front
   * has to cover the one behind it.
   * @default undefined — the rows are painted in their own order
   */
  order?: ArrayLike<number>;
  /**
   * The index from which points are drawn as outlines rather than filled.
   *
   * It is how a sample the model was built from is told from one placed into
   * it afterwards: the first kind helped choose where the axes point and is
   * bound to sit somewhere reasonable, while the second can land anywhere.
   * Points before it are filled, points from it on are hollow.
   * @default undefined — every point is filled
   */
  outlinedFrom?: number;
}

/**
 * Every sample as one dot, and nothing else.
 *
 * It carries no event handler, no closure per point and no state: the gestures
 * all land on one transparent rectangle above it and are answered from a
 * coordinate array. That is what keeps two thousand dots inside a frame, and
 * it is the whole reason this layer could be swapped for a canvas one day
 * without a single other file changing.
 *
 * A hollow dot is the same dot at the same radius with its colour moved from
 * the fill to the stroke, so the two read as one kind of thing seen at two
 * levels of confidence rather than as two unrelated marks. A shaped point
 * follows the same rule, and covers the area of the disc it stands in for.
 * @param props - See {@link ScatterPointLayerProps}.
 * @returns The cloud.
 */
export const ScatterPointLayer = memo(function ScatterPointLayer(
  props: ScatterPointLayerProps,
): ReactElement {
  const {
    points,
    groupOf,
    colors,
    opacities,
    shapeOf,
    shapes,
    fallbackColor = 'var(--text-faint)',
    radius = 3.5,
    radii,
    order,
    outlinedFrom,
  } = props;

  const xs = points.x;
  const ys = points.y;
  const count = Math.min(xs.length, ys.length);
  const steps = order === undefined ? count : Math.min(count, order.length);
  const hollowFrom = outlineStart(outlinedFrom, count);
  const groups = colors?.length ?? 0;
  const shapeCount = shapes?.length ?? 0;
  const ink = groupInk(colors, opacities, fallbackColor);

  const dots: ReactElement[] = [];
  for (let step = 0; step < steps; step++) {
    const index = order === undefined ? step : (order[step] as number);
    const x = xs[index];
    const y = ys[index];
    if (x === undefined || y === undefined) continue;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const slot = chartGroupIndex(groupOf, index, groups) + 1;
    const color = ink.colors[slot] ?? fallbackColor;
    const hollow = index >= hollowFrom;
    const size = radii?.[index];
    const reach = size === undefined ? radius : chartRoundPixel(size);
    const shape = shapes?.[chartGroupIndex(shapeOf, index, shapeCount)];
    const outline =
      shape === undefined ? null : pointShapePath(shape, x, y, reach);
    const paint = {
      fill: hollow ? 'none' : color,
      stroke: hollow ? color : undefined,
      strokeWidth: hollow ? OUTLINE_WIDTH : undefined,
      opacity: ink.opacities[slot],
    };
    dots.push(
      outline === null ? (
        <circle
          key={index}
          cx={chartRoundPixel(x)}
          cy={chartRoundPixel(y)}
          r={reach}
          {...paint}
        />
      ) : (
        <path key={index} d={outline} {...paint} />
      ),
    );
  }

  return <g data-layer="points">{dots}</g>;
});

/**
 * Where the hollow dots begin.
 * @param outlinedFrom - The index the caller asked for, if any.
 * @param count - How many points there are.
 * @returns The first index drawn as an outline; `count` when none is.
 */
function outlineStart(outlinedFrom: number | undefined, count: number): number {
  if (outlinedFrom === undefined || !Number.isFinite(outlinedFrom)) {
    return count;
  }
  return Math.max(0, Math.floor(outlinedFrom));
}

/**
 * A dot's ink, worked out once per group instead of once per point.
 *
 * Both arrays are offset by one, so a point in no group — which arrives as
 * `-1` — reads its fallback through the same indexed read as every other
 * point. An opacity of one is stored as `undefined` because that is the value
 * the attribute is then left out with.
 * @param colors - The colour of each group, in group order.
 * @param opacities - How strongly each group is drawn, in the same order.
 * @param fallbackColor - Colour of a point belonging to no group.
 * @returns The colour and the written opacity of every group, from slot 1.
 */
function groupInk(
  colors: readonly string[] | undefined,
  opacities: readonly number[] | undefined,
  fallbackColor: string,
): { colors: string[]; opacities: Array<number | undefined> } {
  const groups = colors?.length ?? 0;
  const inks: string[] = [fallbackColor];
  const alphas: Array<number | undefined> = [undefined];
  for (let group = 0; group < groups; group++) {
    inks.push(colors?.[group] ?? fallbackColor);
    const alpha = opacities?.[group] ?? 1;
    alphas.push(alpha === 1 ? undefined : alpha);
  }
  return { colors: inks, opacities: alphas };
}

/**
 * Heavy enough that a ring of it beside a filled dot of the same radius reads
 * as the same colour. A hairline would read as a paler group instead, which is
 * exactly the wrong thing to say about a projected sample.
 */
const OUTLINE_WIDTH = 1.5;
