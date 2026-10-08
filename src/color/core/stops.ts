import { clamp } from '../../format/core/clamp.ts';

import type { ColorScale, ColorStop } from './interpolate.ts';
import { colorAt } from './interpolate.ts';
import { MAXIMUM_CUSTOM_STOPS } from './scaleText.ts';

/** How few anchors a scale may have: one at each end of what it draws. */
export const MINIMUM_CUSTOM_STOPS = 2;

// A link writes three decimals, so an anchor is held where the link puts it.
const POSITION_FACTOR = 1000;

/** The anchors after an edit, and where the edited one now stands among them. */
export interface EditedStops {
  /** The anchors, from the low end. */
  stops: ColorStop[];
  /** The index of the anchor that was added or moved. */
  index: number;
}

/**
 * Add an anchor where the reader clicked, in the colour the scale already has
 * there — so adding one changes nothing until it is moved or recoloured.
 * @param scale - The scale being edited.
 * @param position - Where to add it, from 0 at the low end to 1 at the high end.
 * @returns The anchors with the new one, or `null` when the scale already holds as many as a link may carry.
 */
export function addColorStop(
  scale: ColorScale,
  position: number,
): EditedStops | null {
  if (scale.stops.length >= MAXIMUM_CUSTOM_STOPS) return null;
  const at = roundPosition(position);
  const added: ColorStop = { position: at, color: colorAt(scale, at) };
  return sortAround([...scale.stops, added], added);
}

/**
 * Move an anchor. It may pass its neighbours: the anchors are kept in order,
 * and the returned index follows the one that moved.
 * @param stops - The anchors, from the low end.
 * @param index - Which of them moves.
 * @param position - Where to, clamped to the scale.
 * @returns The anchors in their new order, and where the moved one landed.
 */
export function moveColorStop(
  stops: readonly ColorStop[],
  index: number,
  position: number,
): EditedStops {
  const stop = stops[index];
  if (stop === undefined || !Number.isFinite(position)) {
    return { stops: [...stops], index };
  }
  const moved: ColorStop = { ...stop, position: roundPosition(position) };
  return sortAround(
    stops.map((other, at) => (at === index ? moved : other)),
    moved,
  );
}

/**
 * Remove an anchor, unless the scale would be left with fewer than two.
 * @param stops - The anchors, from the low end.
 * @param index - Which of them to remove.
 * @returns The remaining anchors, or the same ones when none may go.
 */
export function removeColorStop(
  stops: readonly ColorStop[],
  index: number,
): ColorStop[] {
  if (stops.length <= MINIMUM_CUSTOM_STOPS) return [...stops];
  return stops.filter((_, at) => at !== index);
}

/**
 * Recolour an anchor.
 * @param stops - The anchors, from the low end.
 * @param index - Which of them to recolour.
 * @param color - Its new colour.
 * @returns The anchors, with that one recoloured.
 */
export function recolorColorStop(
  stops: readonly ColorStop[],
  index: number,
  color: string,
): ColorStop[] {
  return stops.map((stop, at) => (at === index ? { ...stop, color } : stop));
}

function roundPosition(position: number): number {
  return Math.round(clamp(position, 0, 1) * POSITION_FACTOR) / POSITION_FACTOR;
}

function sortAround(stops: ColorStop[], edited: ColorStop): EditedStops {
  const sorted = stops.toSorted((one, other) => one.position - other.position);
  return { stops: sorted, index: sorted.indexOf(edited) };
}
