import type { ReactElement } from 'react';
import { memo } from 'react';

import type { ScreenPoints } from '../../scatter/core/screenPoints.ts';
import { depthFraction } from '../core/orbitCamera.ts';

/** What {@link CloudPointLayer} draws. */
export interface CloudPointLayerProps {
  /** Where every sample sits, in the figure's pixels. */
  points: ScreenPoints;
  /** How far towards the reader each one is, in cube units. */
  depths: Float64Array;
  /** The rows, furthest first, which is the order they are painted in. */
  order: Uint32Array;
  /**
   * Which group each sample belongs to, as an index into `colors`. An entry of
   * `-1`, or one outside the range, is a sample in no group.
   * @default undefined — every sample is one crowd
   */
  groupOf?: ArrayLike<number>;
  /**
   * The colour of each group, in group order.
   * @default undefined — every sample takes `fallbackColor`
   */
  colors?: readonly string[];
  /**
   * How strongly each group is drawn, in the same order.
   * @default undefined — every group is drawn at full strength
   */
  opacities?: readonly number[];
  /**
   * Colour of a sample belonging to no group.
   * @default 'var(--text-faint)'
   */
  fallbackColor?: string;
  /**
   * Radius of a dot at the middle of the cube, in pixels. A dot at the front
   * is drawn larger and one at the back smaller, about this.
   * @default 3.5
   */
  radius?: number;
  /**
   * The index from which samples are drawn as outlines rather than filled,
   * which is how one the model was fitted on is told from one placed into it
   * afterwards.
   * @default undefined — every sample is filled
   */
  outlinedFrom?: number;
}

/**
 * Every sample as one dot, painted from the back of the box forwards.
 *
 * Two things carry the depth, and neither costs an event handler: the order,
 * so a dot in front covers one behind it, and the size, so a dot at the front
 * of the box is a fifth larger than the same dot at the back. Both are read
 * from the projection rather than from the data, so a turn changes them and a
 * filter does not.
 *
 * Like the flat cloud's own layer, this one carries no handler and no closure
 * per dot: every gesture lands on one transparent rectangle above it and is
 * answered from a coordinate array.
 * @param props - See {@link CloudPointLayerProps}.
 * @returns The cloud.
 */
export const CloudPointLayer = memo(function CloudPointLayer(
  props: CloudPointLayerProps,
): ReactElement {
  const { points, depths, order, groupOf, colors, opacities } = props;
  const { fallbackColor = 'var(--text-faint)', radius = 3.5 } = props;
  const { outlinedFrom } = props;

  const xs = points.x;
  const ys = points.y;
  const count = Math.min(xs.length, ys.length, order.length);
  const hollowFrom = outlineStart(outlinedFrom, count);

  const dots: ReactElement[] = [];
  for (let step = 0; step < count; step++) {
    const index = order[step] as number;
    const x = xs[index];
    const y = ys[index];
    if (x === undefined || y === undefined) continue;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const group = groupOf?.[index] ?? -1;
    const color = colors?.[group] ?? fallbackColor;
    const alpha = opacities?.[group] ?? 1;
    const hollow = index >= hollowFrom;
    dots.push(
      <circle
        key={index}
        cx={round(x)}
        cy={round(y)}
        r={round(radius * depthScale(depths[index] as number))}
        fill={hollow ? 'none' : color}
        stroke={hollow ? color : undefined}
        strokeWidth={hollow ? OUTLINE_WIDTH : undefined}
        opacity={alpha === 1 ? undefined : alpha}
      />,
    );
  }

  return <g data-layer="points">{dots}</g>;
});

/**
 * How much larger a dot is drawn for sitting near the front of the box.
 *
 * A fifth from back to front. Enough that the eye reads it as depth when it is
 * looking for depth, and little enough that nobody mistakes it for a value:
 * a dot size that carried a measurement would be a fourth dimension nothing
 * labelled.
 * @param depth - How far towards the reader the sample is, in cube units.
 * @returns The factor to draw its radius at.
 */
function depthScale(depth: number): number {
  return 0.9 + DEPTH_RANGE * depthFraction(depth);
}

function outlineStart(outlinedFrom: number | undefined, count: number): number {
  if (outlinedFrom === undefined || !Number.isFinite(outlinedFrom)) {
    return count;
  }
  return Math.max(0, Math.floor(outlinedFrom));
}

const DEPTH_RANGE = 0.4;

/** The same weight the flat cloud draws a hollow dot at, so the two read alike. */
const OUTLINE_WIDTH = 1.5;

const round = (value: number): number => Math.round(value * 100) / 100;
