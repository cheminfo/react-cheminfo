/**
 * How solid the glass is, and how it thickens from the middle to the rim.
 */

/**
 * How solid one wall of the glass is, seen square on, by default.
 *
 * Low, because a ray straight through a shell already meets two walls, and two
 * shells that overlap put four in the reader's way.
 */
export const SHELL_FILL_OPACITY = 0.1;

/**
 * How many walls' worth of glass the rim is allowed to reach.
 *
 * The path through a shell grows as the secant of the angle it is seen at, so
 * at the silhouette it is unbounded and the rim would go opaque. Held to a few
 * walls it reads as the swell of a ball; unheld it reads as a ring drawn round
 * a disc, which is the wireframe this fill replaced.
 */
const RIM_WALLS = 6;

/** One stop of the glass gradient. */
export interface ShellGlassStop {
  /** How far out it sits, from `0` at the middle to `1` at the rim. */
  offset: number;
  /** How solid the glass is there. */
  opacity: number;
}

/**
 * The gradient one shell is filled with, which is what gives it its relief.
 *
 * A shell is a surface, not a filled solid, so what the reader looks through
 * is two walls of it. Straight through the middle they are met square on and
 * the glass is at its thinnest; towards the rim the same two walls are met at
 * a closing angle and the path through them lengthens as the secant of it, so
 * the shell swells towards its edge and reads as round. That is the whole of
 * the modelling the tessellated version did, minus the seams between the faces
 * it needed to do it.
 *
 * The walls are composited rather than added, so two of them at a tenth are
 * not a fifth but a nineteenth-something — the same arithmetic the browser was
 * doing when they were stacked polygons.
 * @param strength - How solid one wall is, after the group's own opacity.
 * @returns The stops, from the middle outwards.
 */
export function shellGlassStops(strength: number): ShellGlassStop[] {
  const wall = Math.min(1, Math.max(0, strength));
  const clear = 1 - wall;
  return GLASS_OFFSETS.map((offset) => ({
    offset,
    opacity: round(1 - clear ** wallsAt(offset)),
  }));
}

/**
 * How much glass a ray meets at a given distance out from the middle.
 * @param offset - How far out, from `0` at the middle to `1` at the rim.
 * @returns The number of walls' worth, held to {@link RIM_WALLS}.
 */
function wallsAt(offset: number): number {
  const facing = Math.sqrt(Math.max(0, 1 - offset * offset));
  if (facing <= 0) return RIM_WALLS;
  return Math.min(RIM_WALLS, 2 / facing);
}

/*
 * Close together near the rim, where the glass thickens quickest, and sparse
 * through the middle, where it barely changes.
 */
const GLASS_OFFSETS = [0, 0.3, 0.5, 0.66, 0.78, 0.87, 0.93, 0.97, 1];

const round = (value: number): number => Math.round(value * 10000) / 10000;
