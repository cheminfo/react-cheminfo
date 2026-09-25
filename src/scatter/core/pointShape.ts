import { chartRoundPixel } from '../../chart/core/chartScale.ts';
import type { OverlayMarkShape } from '../../overlay/core/overlayMarks.ts';

/**
 * The outline of a mark drawn as a filled polygon — a sample shaped by a
 * second grouping, or a marker drawn in one of those shapes — as SVG path data.
 *
 * Every shape covers the area of the disc it stands in for. The eye weighs a
 * mark by its ink, so a square drawn in the disc's own box would make its
 * group read as the heavier one — which is a claim about the data that nothing
 * in the data supports.
 * @param shape - The shape.
 * @param x - Horizontal centre, in pixels.
 * @param y - Vertical centre, in pixels.
 * @param radius - Radius of the disc the shape stands in for, in pixels.
 * @returns The path data, or `null` for a disc, which is drawn as a circle,
 * and for every mark that is not a filled polygon.
 */
export function pointShapePath(
  shape: OverlayMarkShape,
  x: number,
  y: number,
  radius: number,
): string | null {
  if (shape === 'square') {
    const half = SQUARE_HALF * radius;
    return polygon([
      [x - half, y - half],
      [x + half, y - half],
      [x + half, y + half],
      [x - half, y + half],
    ]);
  }
  if (shape === 'diamond') {
    const reach = DIAMOND_REACH * radius;
    return polygon([
      [x, y - reach],
      [x + reach, y],
      [x, y + reach],
      [x - reach, y],
    ]);
  }
  if (shape === 'triangle' || shape === 'triangle-down') {
    // The centroid sits on the point, so the triangle is balanced on the
    // sample rather than hanging from it.
    const tip = TRIANGLE_TIP * radius;
    const half = TRIANGLE_HALF_BASE * radius;
    const base = (TRIANGLE_TIP / 2) * radius;
    const flip = shape === 'triangle' ? 1 : -1;
    return polygon([
      [x, y - flip * tip],
      [x + half, y + flip * base],
      [x - half, y + flip * base],
    ]);
  }
  return null;
}

function polygon(corners: ReadonlyArray<readonly [number, number]>): string {
  let path = '';
  for (const [x, y] of corners) {
    path += `${path === '' ? 'M' : 'L'}${chartRoundPixel(x)} ${chartRoundPixel(y)}`;
  }
  return `${path}Z`;
}

/** Half the side of a square as large as a disc of radius one: √π / 2. */
const SQUARE_HALF = Math.sqrt(Math.PI) / 2;

/** How far a diamond as large as that disc reaches from its centre: √(π / 2). */
const DIAMOND_REACH = Math.sqrt(Math.PI / 2);

/**
 * The side of an equilateral triangle as large as that disc is √(4π / √3). Its
 * tip stands side / √3 from the centroid, and its base half as far on the other
 * side.
 */
const TRIANGLE_SIDE = Math.sqrt((4 * Math.PI) / Math.sqrt(3));
const TRIANGLE_TIP = TRIANGLE_SIDE / Math.sqrt(3);
const TRIANGLE_HALF_BASE = TRIANGLE_SIDE / 2;
