/**
 * The box primitives take up on the page, strokes included, which is what a
 * drawing is framed, exported and hit by.
 */

import type { Box } from '../core/types.ts';

import { captionCorners } from './captions.ts';
import { capHeight, textWidth } from './metrics.ts';
import { imageCorners } from './pictures.ts';
import type { Primitive } from './primitives.ts';

/**
 * The box a set of primitives fits in, strokes included.
 * @param primitives - The primitives.
 * @returns The box, or undefined when there is nothing to bound.
 */
export function primitivesBounds(
  primitives: readonly Primitive[],
): Box | undefined {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number, pad: number) => {
    if (x - pad < minX) minX = x - pad;
    if (y - pad < minY) minY = y - pad;
    if (x + pad > maxX) maxX = x + pad;
    if (y + pad > maxY) maxY = y + pad;
  };
  for (const primitive of primitives) {
    switch (primitive.kind) {
      case 'line':
        add(primitive.from.x, primitive.from.y, primitive.width / 2);
        add(primitive.to.x, primitive.to.y, primitive.width / 2);
        break;
      case 'polygon':
        for (const point of primitive.points) add(point.x, point.y, 0);
        break;
      case 'path':
        for (const point of primitive.extent) {
          add(point.x, point.y, primitive.width / 2);
        }
        break;
      case 'dot':
        add(primitive.x, primitive.y, primitive.r);
        break;
      case 'text': {
        const width = textWidth(primitive.text, primitive.size);
        const height = capHeight(primitive.size);
        add(primitive.x, primitive.y - height, 0);
        add(primitive.x + width, primitive.y + primitive.size * 0.21, 0);
        break;
      }
      case 'caption':
        for (const point of captionCorners(primitive)) add(point.x, point.y, 0);
        break;
      case 'image':
        for (const point of imageCorners(primitive)) add(point.x, point.y, 0);
        break;
      default:
        break;
    }
  }
  if (minX === Infinity) return undefined;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * The box two boxes fit in together.
 * @param a - One box, or undefined.
 * @param b - The other, or undefined.
 * @returns Their union, or undefined when both are.
 */
export function unionBox(a: Box | undefined, b: Box | undefined) {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}
