/**
 * The small decisions `AtomicOrbitalCanvas` makes between a sample and the
 * camera, kept out of the component so it stays a list of effects.
 */

import type { ResolutionLimits } from '../core/atomicGrid.ts';

import type { OrbitalViewer } from './viewer.ts';

/**
 * Draw the cartesian frame around the orbital, or remove it.
 * @param viewer - The viewer holding the canvas; only its two frame methods
 * are called.
 * @param reach - How far the drawn surface reaches, as `showOrbital` returned
 * it.
 * @param axes - Whether the frame is wanted.
 * @returns What the camera has to fit: the frame reaches past the surface, so
 * turning it on has to zoom out or the labels sit off screen.
 */
export async function fitAxes(
  viewer: Pick<OrbitalViewer, 'hideAxes' | 'showAxes'>,
  reach: number | undefined,
  axes: boolean,
): Promise<number | undefined> {
  if (!axes) {
    await viewer.hideAxes();
    return reach;
  }
  if (reach === undefined) return undefined;
  return (await viewer.showAxes(reach)) ?? reach;
}

/**
 * A stable identity for either shape the resolution prop can take.
 * @param resolution - A fixed sample count, or the limits it may vary between.
 * @returns A string that changes exactly when the sampling would.
 */
export function resolutionKey(resolution: number | ResolutionLimits): string {
  return typeof resolution === 'number'
    ? String(resolution)
    : `${resolution.floor}-${resolution.cap}`;
}
