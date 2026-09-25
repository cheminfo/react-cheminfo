/**
 * Which corner of the map the floating key takes.
 *
 * It is a module of its own because it is the one piece of the map that has to
 * know where the dots fall before anything is drawn over them, and it is all
 * arithmetic that can be checked without rendering anything.
 */

import { emptiestCorner } from '../../overlay/core/emptiestCorner.ts';
import type { OverlayCorner } from '../../overlay/core/overlayPlacement.ts';

import type { ProjectionMapCloud } from './projectionMapModel.ts';

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
