/**
 * Three runs of numbers, stretched into the cube the cloud is drawn in.
 *
 * A map draws its two axes at whatever scale each one needs, and the tick
 * labels are the reader's record of that. A cloud has no such record: it is
 * one solid seen from an angle, so three axes drawn at three scales would make
 * a group lean in a direction that is an artefact of the scaling and not
 * anything in the data. Every axis is therefore stretched to the same cube,
 * the frame is labelled with which axis is which, and the numbers stay in the
 * card the pointer raises.
 *
 * The shells are fitted in this cube for the same reason the map fits its
 * outlines in pixels: a shell has to sit on the cloud the reader is looking
 * at, not on a cloud in units nothing draws.
 */

import {
  chartPadExtent,
  chartValuesExtent,
} from '../../chart/core/chartExtent.ts';

import type { Vector3 } from './orbitCamera.ts';

/** How {@link cubePoints} stretches the runs it is given. */
export interface CubePointsOptions {
  /**
   * Share of each axis' span left empty at both ends, so the cloud does not
   * touch the frame.
   * @default 0.05
   */
  padding?: number;
}

/**
 * Three runs of numbers, each stretched to `[-1, 1]`.
 * @param x - Where every sample sits along the axis that runs left to right.
 * @param y - Along the axis that runs bottom to top, in the same order.
 * @param z - Along the axis that runs away from the reader.
 * @param options - See {@link CubePointsOptions}.
 * @returns One point per sample, as many as the shortest run holds. An axis with no spread at all puts every sample at the middle of it rather than dividing by zero, and a value that is not finite stays that way so nothing draws it.
 */
export function cubePoints(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  z: ArrayLike<number>,
  options: CubePointsOptions = {},
): Vector3[] {
  const { padding = 0.05 } = options;
  const toCube = [x, y, z].map((values) => axisMapper(values, padding));
  const across = toCube[0] as Mapper;
  const up = toCube[1] as Mapper;
  const away = toCube[2] as Mapper;

  const count = Math.min(x.length, y.length, z.length);
  const points = new Array<Vector3>(count);
  for (let index = 0; index < count; index++) {
    points[index] = [
      across(x[index] as number),
      up(y[index] as number),
      away(z[index] as number),
    ];
  }
  return points;
}

type Mapper = (value: number) => number;

function axisMapper(values: ArrayLike<number>, padding: number): Mapper {
  const { min, max } = chartPadExtent(chartValuesExtent(values), padding);
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) {
    return (value: number) => (Number.isFinite(value) ? 0 : Number.NaN);
  }
  return (value: number) => (2 * (value - min)) / span - 1;
}
