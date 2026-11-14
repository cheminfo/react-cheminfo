/**
 * A gradient a shape is filled with, laid out on the page: the line a linear
 * one runs along, the ellipse a radial one fills, and the colours it passes
 * through. Its id is written from what it paints, so two figures on one page
 * never borrow each other's gradient, and two equal gradients may share one.
 */

import { splitColor } from '../core/palette.ts';
import type { Point } from '../core/types.ts';

import { escapeAttribute, number } from './markup.ts';
import type { Scene } from './primitives.ts';

/** A colour the gradient passes through. */
export interface GradientStop {
  /** Where, from 0 at its start to 1 at its end. */
  offset: number;
  /** The colour, `#rrggbb` or `#rrggbbaa`. */
  color: string;
}

/** A gradient along a line, in points. */
export interface LinearPaint {
  /** What it is. */
  kind: 'linear';
  /** Where its first colour is. */
  from: Point;
  /** Where its last colour is. */
  to: Point;
  /** Its colours. */
  stops: GradientStop[];
}

/** A gradient out from a centre to the rim of an ellipse, in points. */
export interface RadialPaint {
  /** What it is. */
  kind: 'radial';
  /** Where its first colour is. */
  centre: Point;
  /** The radii of the ellipse its last colour lies on, across and down. */
  radii: Point;
  /** How far the ellipse is turned, clockwise, in degrees. */
  rotation: number;
  /** Its colours. */
  stops: GradientStop[];
}

/** A gradient laid out on the page. */
export type GradientPaint = LinearPaint | RadialPaint;

/**
 * The id a gradient is referred to by, written from what it paints.
 * @param paint - The gradient.
 * @returns The id.
 */
export function gradientId(paint: GradientPaint): string {
  const place =
    paint.kind === 'linear'
      ? [paint.from.x, paint.from.y, paint.to.x, paint.to.y]
      : [
          paint.centre.x,
          paint.centre.y,
          paint.radii.x,
          paint.radii.y,
          paint.rotation,
        ];
  const colors = paint.stops.map(
    (stop) => `${number(stop.offset)}${stop.color.slice(1).toLowerCase()}`,
  );
  return `cd-${paint.kind}_${place.map(number).join('_')}_${colors.join('_')}`;
}

/**
 * The gradients a scene fills its shapes with, each once.
 * @param scene - The scene.
 * @returns The gradients, in the order they are first used.
 */
export function sceneGradients(scene: Scene): GradientPaint[] {
  const paints = new Map<string, GradientPaint>();
  for (const item of scene.items) {
    for (const primitive of item.primitives) {
      if (primitive.kind !== 'path' || !primitive.gradient) continue;
      const id = gradientId(primitive.gradient);
      if (!paints.has(id)) paints.set(id, primitive.gradient);
    }
  }
  return [...paints.values()];
}

/**
 * The `<defs>` holding every gradient a scene fills its shapes with.
 * @param scene - The scene.
 * @returns The element, or nothing for a scene filled flat.
 */
export function gradientDefs(scene: Scene): string {
  const paints = sceneGradients(scene);
  if (paints.length === 0) return '';
  return `<defs>${paints.map(gradientMarkup).join('')}</defs>`;
}

/**
 * What a shape filled with a gradient writes as its fill.
 * @param paint - The gradient.
 * @returns The `url(#…)` reference.
 */
export function gradientFill(paint: GradientPaint): string {
  return `url(#${gradientId(paint)})`;
}

/**
 * A gradient as SVG writes it, laid out in the page's own points.
 * @param paint - The gradient.
 * @returns The `<linearGradient>` or `<radialGradient>` element.
 */
export function gradientMarkup(paint: GradientPaint): string {
  const id = escapeAttribute(gradientId(paint));
  const stops = paint.stops.map(stopMarkup).join('');
  if (paint.kind === 'linear') {
    const { from, to } = paint;
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${number(from.x)}" y1="${number(from.y)}" x2="${number(to.x)}" y2="${number(to.y)}">${stops}</linearGradient>`;
  }
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="${radialTransform(paint)}">${stops}</radialGradient>`;
}

/**
 * Where the unit circle a radial gradient is drawn on goes: onto its
 * ellipse, turned.
 * @param paint - The gradient.
 * @returns The value of its `gradientTransform`.
 */
export function radialTransform(paint: RadialPaint): string {
  const { centre, radii, rotation } = paint;
  const turn = rotation ? ` rotate(${number(rotation)})` : '';
  return `translate(${number(centre.x)} ${number(centre.y)})${turn} scale(${number(radii.x)} ${number(radii.y)})`;
}

function stopMarkup(stop: GradientStop): string {
  const { hex, opacity } = splitColor(stop.color);
  const alpha = opacity < 1 ? ` stop-opacity="${number(opacity)}"` : '';
  return `<stop offset="${number(stop.offset)}" stop-color="${hex}"${alpha}/>`;
}
