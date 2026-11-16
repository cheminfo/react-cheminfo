/**
 * A filled graphic's gradient laid out on the page: the line a linear one runs
 * along, the ellipse a radial one fills, and the colours it passes through.
 * Its id is written from what it paints, so two figures on one page never
 * borrow each other's gradient, and two equal gradients may share one.
 */

import { boundsOf, roundCoordinate } from '../core/geometry.ts';
import type { DrawGraphic } from '../core/graphics.ts';
import { graphicCorners, isBoxGraphic } from '../core/graphics.ts';
import type { Point } from '../core/types.ts';
import { turnAbout } from '../core/vectors.ts';

import type { GradientPaint } from './gradients.ts';

/**
 * The gradient a graphic is filled with, laid out over it: a linear one from
 * edge to edge in its direction, a reflected one the same with the fill in
 * the middle, a radial one from its centre out to the farthest point of the
 * shape. It turns with a turned rectangle or ellipse.
 * @param graphic - The graphic.
 * @returns The gradient, or undefined for a graphic filled flat or not at all.
 */
export function gradientPaint(graphic: DrawGraphic): GradientPaint | undefined {
  const { fill, gradient } = graphic;
  if (!fill || !gradient) return undefined;
  const { centre, width, height, rotation, round } = frameOf(graphic);
  if (gradient.kind === 'radial') {
    // Out from its centre to the farthest point of the shape: the rim of an
    // ellipse, or a corner of a rectangle.
    const { x: across = 0, y: down = 0 } = gradient.centre ?? {};
    const reach = round
      ? 1 + Math.hypot(across, down)
      : Math.hypot(1 + Math.abs(across), 1 + Math.abs(down));
    const turn = turnAbout({ x: 0, y: 0 }, rotation);
    const shift = turn({ x: (across * width) / 2, y: (down * height) / 2 });
    return {
      kind: 'radial',
      centre: rounded({ x: centre.x + shift.x, y: centre.y + shift.y }),
      radii: rounded({ x: (width / 2) * reach, y: (height / 2) * reach }),
      rotation,
      stops: [
        { offset: 0, color: fill },
        { offset: 1, color: gradient.color },
      ],
    };
  }
  const local = ((gradient.angle ?? 0) * Math.PI) / 180;
  const across = Math.abs(Math.cos(local)) * (width / 2);
  const down = Math.abs(Math.sin(local)) * (height / 2);
  const reach = round ? Math.hypot(across, down) : across + down;
  const turn = local + (rotation * Math.PI) / 180;
  const step = { x: Math.cos(turn) * reach, y: Math.sin(turn) * reach };
  return {
    kind: 'linear',
    from: rounded({ x: centre.x - step.x, y: centre.y - step.y }),
    to: rounded({ x: centre.x + step.x, y: centre.y + step.y }),
    stops:
      gradient.kind === 'reflected'
        ? [
            { offset: 0, color: gradient.color },
            { offset: 0.5, color: fill },
            { offset: 1, color: gradient.color },
          ]
        : [
            { offset: 0, color: fill },
            { offset: 1, color: gradient.color },
          ],
  };
}

function rounded(point: Point): Point {
  return { x: roundCoordinate(point.x), y: roundCoordinate(point.y) };
}

// The box a gradient is laid over, upright in its own frame.
function frameOf(graphic: DrawGraphic): {
  centre: Point;
  width: number;
  height: number;
  rotation: number;
  round: boolean;
} {
  if (isBoxGraphic(graphic)) {
    const { x, y, width, height, rotation = 0, kind } = graphic;
    return {
      centre: { x: x + width / 2, y: y + height / 2 },
      width,
      height,
      rotation,
      round: kind === 'ellipse',
    };
  }
  const { x, y, width, height } = boundsOf(graphicCorners(graphic));
  return {
    centre: { x: x + width / 2, y: y + height / 2 },
    width,
    height,
    rotation: 0,
    round: false,
  };
}
