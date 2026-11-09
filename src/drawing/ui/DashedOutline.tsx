import type { ReactElement } from 'react';

import type { Box, Point } from '../core/types.ts';

/** How large a square handle is drawn, in screen pixels. */
const HANDLE_SIZE = 8;

/** What {@link DashedOutline} is drawn around, and how. */
export interface DashedOutlineProps {
  /**
   * The box outlined, when no corners are given.
   * @default undefined
   */
  box?: Box;
  /**
   * The corners of the polygon outlined.
   * @default undefined
   */
  points?: readonly Point[];
  /**
   * How far the outline stands off the box, in points.
   * @default 0
   */
  pad?: number;
  /** Points per screen pixel, so the dashes keep their size when zoomed. */
  pixel: number;
  /**
   * Whether the pointer is over it, which mutes it.
   * @default false
   */
  hovered?: boolean;
  /**
   * Whether a group holds it, which makes it faint.
   * @default false
   */
  grouped?: boolean;
  /**
   * A class added to the outline's, as a lasso's fill.
   * @default undefined
   */
  className?: string;
  /**
   * The width of the line, in screen pixels.
   * @default 1.5
   */
  weight?: number;
}

/**
 * The dashed line drawn around what is selected or under the pointer: a
 * polygon through corners, or a rectangle around a box.
 * @param props - See {@link DashedOutlineProps}.
 * @returns The outline, or nothing without a box or corners.
 */
export function DashedOutline(props: DashedOutlineProps): ReactElement | null {
  const { box, points, pad = 0, pixel, hovered, grouped } = props;
  const { className, weight = 1.5 } = props;
  const frame = hovered
    ? 'draw-frame draw-frame--hover'
    : grouped
      ? 'draw-frame draw-frame--grouped'
      : 'draw-frame';
  const stroke = {
    className: className ? `${frame} ${className}` : frame,
    strokeWidth: pixel * weight,
    strokeDasharray: `${pixel * 4} ${pixel * 3}`,
  };
  if (points) {
    return (
      <polygon
        {...stroke}
        points={points.map((point) => `${point.x},${point.y}`).join(' ')}
      />
    );
  }
  if (!box) return null;
  return (
    <rect
      {...stroke}
      x={box.x - pad}
      y={box.y - pad}
      width={box.width + 2 * pad}
      height={box.height + 2 * pad}
    />
  );
}

/** Which handle {@link HandleMark} draws, and where. */
export interface HandleMarkProps {
  /** The handle's name: `rotate`, or the corner or side it resizes from. */
  handle: string;
  /** Where it is. */
  point: Point;
  /** Points per screen pixel, so the handle keeps its size when zoomed. */
  pixel: number;
  /** Where the stem of the `rotate` ring starts. */
  stem: Point;
  /**
   * How far a square handle is turned, in degrees.
   * @default undefined — upright
   */
  rotation?: number;
}

/**
 * A handle of the selection frame or of a picture: a square that resizes,
 * turned by `rotation` degrees, or, for `rotate`, a ring on a stem from
 * `stem` that turns what it holds.
 * @param props - The handle, where it is, and points per screen pixel.
 * @returns The handle.
 */
export function HandleMark(props: HandleMarkProps): ReactElement {
  const { handle, point, pixel, stem, rotation } = props;
  const size = HANDLE_SIZE * pixel;
  if (handle !== 'rotate') {
    return (
      <rect
        className="draw-handle"
        data-handle={handle}
        x={point.x - size / 2}
        y={point.y - size / 2}
        width={size}
        height={size}
        strokeWidth={pixel * 1.5}
        transform={
          rotation === undefined
            ? undefined
            : `rotate(${rotation} ${point.x} ${point.y})`
        }
      />
    );
  }
  return (
    <g data-handle={handle}>
      <line
        className="draw-frame"
        x1={stem.x}
        y1={stem.y}
        x2={point.x}
        y2={point.y}
        strokeWidth={pixel * 1.5}
      />
      <circle
        className="draw-handle"
        cx={point.x}
        cy={point.y}
        r={size * 0.6}
        strokeWidth={pixel * 1.5}
      />
    </g>
  );
}
