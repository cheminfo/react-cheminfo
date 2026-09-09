/**
 * Putting a data-space outline on the screen.
 *
 * Kept apart from `confidenceEllipse` because the measurement is a property of
 * the samples and the projection is a property of the plot: the same outline
 * is drawn again at every zoom and every resize, and only this half has to be
 * redone.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';

import type { ConfidenceEllipse, EllipsePoint } from './confidenceEllipse.ts';
import { ellipseAxes } from './confidenceEllipse.ts';

const HALF_TURN_DEGREES = 180;
const DEFAULT_STEPS = 64;
const MINIMUM_STEPS = 3;

/** An ellipse ready to be handed to an SVG `<ellipse>` element. */
export interface PixelEllipse {
  /** Centre of the ellipse, in pixels. */
  cx: number;
  /** Centre of the ellipse, in pixels. */
  cy: number;
  /** Semi-major axis length, in pixels. */
  rx: number;
  /** Semi-minor axis length, in pixels; `0` for a perfectly collinear group. */
  ry: number;
  /** Rotation of the major axis, in degrees, for `transform="rotate(...)"`. */
  angleDegrees: number;
}

/**
 * Map a data-space ellipse onto the plot, keeping it exact when the two axes
 * carry different numbers of pixels per data unit.
 *
 * Scaling `rx` and `ry` and reusing the data-space angle is wrong: an
 * anisotropic map turns the ellipse by a different amount and changes the
 * ratio of its axes — on a 640 by 400 plot of one measured cloud the naive
 * route was 47 pixels out. The covariance is therefore transformed first and
 * only then decomposed, which is exact for any linear axis and lets the
 * browser draw a real curve at any zoom. Drawing a data-space ellipse inside a
 * scaled `<g>` would be geometrically right and visually wrong, because SVG
 * scales the stroke with the group.
 * @param ellipse - An ellipse in data units.
 * @param x - The plot's horizontal data-to-pixel mapping.
 * @param y - Its vertical mapping, whose `factor` is negative.
 * @returns The ellipse in pixels, or `null` when the mapping overflows.
 */
export function projectEllipse(
  ellipse: ConfidenceEllipse,
  x: ChartScale,
  y: ChartScale,
): PixelEllipse | null {
  const cosine = Math.cos(ellipse.angle);
  const sine = Math.sin(ellipse.angle);
  const along = ellipse.rx * ellipse.rx;
  const across = ellipse.ry * ellipse.ry;

  // The quadratic form of the drawn ellipse, which shares its shape with a
  // covariance and so decomposes the same way.
  const xx = along * cosine * cosine + across * sine * sine;
  const xy = (along - across) * cosine * sine;
  const yy = along * sine * sine + across * cosine * cosine;

  // Only the linear part of the mapping changes the shape; the offsets move
  // the centre and nothing else. A negative vertical factor flips the cross
  // term, which is what turns a counter-clockwise data angle into the
  // clockwise one SVG rotates by.
  const factors = x.factor * y.factor;
  const projected = ellipseAxes({
    xx: x.factor * x.factor * xx,
    xy: factors * xy,
    yy: y.factor * y.factor * yy,
  });

  const result: PixelEllipse = {
    cx: x.offset + ellipse.cx * x.factor,
    cy: y.offset + ellipse.cy * y.factor,
    rx: projected.rx,
    ry: projected.ry,
    angleDegrees: (projected.angle * HALF_TURN_DEGREES) / Math.PI,
  };
  if (
    !Number.isFinite(result.cx) ||
    !Number.isFinite(result.cy) ||
    !Number.isFinite(result.rx) ||
    !Number.isFinite(result.ry) ||
    !Number.isFinite(result.angleDegrees)
  ) {
    return null;
  }
  return result;
}

/**
 * Sample the outline of a data-space ellipse, for a plot whose axes are not
 * linear and where the shape is therefore no longer an ellipse on screen.
 *
 * Prefer {@link projectEllipse} on linear axes: it is exact, it is constant
 * time, and the browser draws a curve rather than a polygon.
 * @param ellipse - An ellipse in data units.
 * @param steps - Points around the outline, at least three. Sixty-four keeps the flat sides under a third of a pixel on a 640 by 400 plot. Defaults to `64`.
 * @returns The outline in data units, the first point not repeated at the end.
 */
export function ellipsePolygon(
  ellipse: ConfidenceEllipse,
  steps = DEFAULT_STEPS,
): EllipsePoint[] {
  const total = Number.isFinite(steps)
    ? Math.max(MINIMUM_STEPS, Math.floor(steps))
    : DEFAULT_STEPS;
  const cosine = Math.cos(ellipse.angle);
  const sine = Math.sin(ellipse.angle);
  const outline: EllipsePoint[] = new Array(total);
  for (let index = 0; index < total; index++) {
    const turn = (2 * Math.PI * index) / total;
    const along = ellipse.rx * Math.cos(turn);
    const across = ellipse.ry * Math.sin(turn);
    outline[index] = {
      x: ellipse.cx + along * cosine - across * sine,
      y: ellipse.cy + along * sine + across * cosine,
    };
  }
  return outline;
}
