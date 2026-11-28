/**
 * Whether a gesture holds the canvas: a piece, a selection, the frame, a box
 * being dragged. Each commits against the document it started from, so a key
 * that changes the document meanwhile — Undo, Delete — waits for it. A drag
 * ends once, whether the pointer is let go, cancelled, or loses its capture,
 * so the keys are never held for good.
 */

/** How far the pointer goes, in screen pixels, before a press is a drag. */
export const CLICK_SLOP = 3;

let active = 0;

/** What a drag does as the pointer moves and when it ends. */
export interface DragHandlers {
  /** The pointer moved. */
  move: (event: PointerEvent) => void;
  /** The drag ended: `event.type` says how, `pointerup` for a release. */
  end: (event: PointerEvent) => void;
}

/**
 * Follow a pointer pressed on an element until the drag ends: it takes the
 * pointer, holds the canvas meanwhile, and ends exactly once.
 * @param target - The element pressed.
 * @param pointerId - The pointer.
 * @param handlers - See {@link DragHandlers}.
 */
export function followPointer(
  target: HTMLElement | SVGElement,
  pointerId: number,
  handlers: DragHandlers,
): void {
  target.setPointerCapture(pointerId);
  // The pointer events, typed: the element's own overloads do not resolve
  // across the union of an HTML and an SVG element.
  const events: GlobalEventHandlers = target;
  active++;
  let ended = false;
  const finish = (event: PointerEvent) => {
    if (ended) return;
    ended = true;
    events.removeEventListener('pointermove', handlers.move);
    events.removeEventListener('pointerup', finish);
    events.removeEventListener('pointercancel', finish);
    events.removeEventListener('lostpointercapture', finish);
    active = Math.max(0, active - 1);
    handlers.end(event);
  };
  events.addEventListener('pointermove', handlers.move);
  events.addEventListener('pointerup', finish);
  events.addEventListener('pointercancel', finish);
  events.addEventListener('lostpointercapture', finish);
}

/**
 * Whether a drag is under way.
 * @returns Whether it is.
 */
export function inGesture(): boolean {
  return active > 0;
}

/**
 * Whether a pointer has gone far enough from where it was pressed to make
 * the press a drag.
 * @param from - Where it was pressed, in screen pixels.
 * @param from.clientX - Its x.
 * @param from.clientY - Its y.
 * @param to - Where it is now.
 * @param to.clientX - Its x.
 * @param to.clientY - Its y.
 * @param slop - How far, in screen pixels.
 * @default slop CLICK_SLOP
 * @returns True once it has.
 */
export function pastClickSlop(
  from: { clientX: number; clientY: number },
  to: { clientX: number; clientY: number },
  slop = CLICK_SLOP,
): boolean {
  return (
    Math.hypot(to.clientX - from.clientX, to.clientY - from.clientY) >= slop
  );
}
