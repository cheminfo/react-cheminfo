/**
 * What a drag over a cloud has done so far.
 *
 * Kept out of `useOrbitDrag` the way `lassoGesture` is kept out of the lasso:
 * how far the pointer has travelled, which turn is waiting for the next frame
 * and whether a release was a tap are questions with one answer each, and none
 * of them needs React to be read or checked.
 */

/**
 * How far a press may travel and still be a tap, in pixels of total travel.
 *
 * Generous on purpose: a mouse moves a pixel or two under the click of its own
 * button, and a finger moves rather more, so a stricter number turns "pick
 * this sample" into "turn the box by nothing at all" for anybody whose hand is
 * not steady.
 */
export const ORBIT_TAP_SLACK = 5;

/** What the pointer has done since the last frame, waiting for the next. */
export interface PendingTurn {
  /** Where it is, for a move that is not turning anything. */
  x: number;
  /** Where it is. */
  y: number;
  /** How far it has moved across since the last frame. */
  dx: number;
  /** How far it has moved down. */
  dy: number;
}

/** A drag followed from its press: where the pointer was, and how far it went. */
export interface OrbitDragTrack {
  /** Where the pointer was on the last event, in window pixels. */
  lastX: number;
  /** Where it was vertically. */
  lastY: number;
  /** How far it has travelled since the press: every move's `|dx| + |dy|`. */
  travel: number;
  /** What waits for the next frame, or `null` when nothing does. */
  pending: PendingTurn | null;
}

/**
 * A track with no press behind it.
 * @returns The track, to be held for the life of the surface.
 */
export function createOrbitDragTrack(): OrbitDragTrack {
  return { lastX: 0, lastY: 0, travel: 0, pending: null };
}

/**
 * Start following a press.
 * @param track - The track, changed in place.
 * @param clientX - Where the press happened, in the window.
 * @param clientY - Where it happened vertically.
 */
export function pressOrbitDrag(
  track: OrbitDragTrack,
  clientX: number,
  clientY: number,
): void {
  track.lastX = clientX;
  track.lastY = clientY;
  track.travel = 0;
}

/**
 * Remember where a pointer that turns nothing has moved to.
 * @param track - The track, changed in place.
 * @param x - Where the pointer is on the surface.
 * @param y - Where it is vertically.
 */
export function hoverOrbitDrag(
  track: OrbitDragTrack,
  x: number,
  y: number,
): void {
  track.pending = { x, y, dx: 0, dy: 0 };
}

/**
 * Follow a move of the claimed pointer.
 *
 * The travel is counted whether or not the drag may turn the box, so a press
 * that wandered is still not a tap when turning is off.
 * @param track - The track, changed in place.
 * @param clientX - Where the pointer is now, in the window.
 * @param clientY - Where it is vertically.
 * @param enabled - Whether the drag turns the box at all.
 * @returns Whether a frame has to be booked for the turn now waiting.
 */
export function followOrbitDrag(
  track: OrbitDragTrack,
  clientX: number,
  clientY: number,
  enabled: boolean,
): boolean {
  const dx = clientX - track.lastX;
  const dy = clientY - track.lastY;
  track.lastX = clientX;
  track.lastY = clientY;
  track.travel += Math.abs(dx) + Math.abs(dy);
  if (!enabled) return false;
  const waiting = track.pending;
  track.pending = {
    x: 0,
    y: 0,
    dx: (waiting?.dx ?? 0) + dx,
    dy: (waiting?.dy ?? 0) + dy,
  };
  return true;
}

/**
 * Take what was waiting for the frame, leaving nothing behind.
 * @param track - The track, changed in place.
 * @returns The waiting turn or move, or `null` when there was none.
 */
export function takePendingTurn(track: OrbitDragTrack): PendingTurn | null {
  const next = track.pending;
  track.pending = null;
  return next;
}

/**
 * Whether the press being released went nowhere worth calling a turn.
 * @param track - The track.
 * @returns `true` when the travel is within {@link ORBIT_TAP_SLACK}.
 */
export function isOrbitTap(track: OrbitDragTrack): boolean {
  return track.travel <= ORBIT_TAP_SLACK;
}
