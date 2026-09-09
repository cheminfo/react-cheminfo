/**
 * What a lasso is asked for, what it hands back, and the arithmetic behind the
 * rectangle it is drawn on.
 *
 * Kept out of the hook the way `listNavigation` is kept out of its own: where
 * the pointer is, which modifier wins and how a frame is booked are questions
 * with one answer each, and none of them needs React to be read or checked.
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import type { LassoPath } from '../core/lassoPath.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';

/**
 * What the transparent rectangle laid over a plot has to carry.
 *
 * One rectangle takes every gesture, rather than each dot carrying handlers of
 * its own: two thousand `<circle>` elements with six listeners each is two
 * thousand times the work on mount, and a hit test against a coordinate array
 * is cheaper than one against the DOM. Spread the whole object, and give the
 * rectangle a fill — a rectangle with none is never hit.
 */
export interface ScatterSurfaceProps {
  /** Starts the drag and claims the pointer for the rest of it. */
  onPointerDown: (event: ReactPointerEvent<Element>) => void;
  /** Follows the pointer, at most once a frame. */
  onPointerMove: (event: ReactPointerEvent<Element>) => void;
  /** Ends the drag and commits what was drawn. */
  onPointerUp: (event: ReactPointerEvent<Element>) => void;
  /** Abandons the drag when the browser takes the pointer away. */
  onPointerCancel: (event: ReactPointerEvent<Element>) => void;
  /** Abandons it when the capture is lost for any other reason. */
  onLostPointerCapture: (event: ReactPointerEvent<Element>) => void;
  /** Tells a hover card the pointer has left, when no drag is running. */
  onPointerLeave: (event: ReactPointerEvent<Element>) => void;
  /** Keeps a finger from scrolling the page, and names the pointer. */
  style: CSSProperties;
}

/** What `useLassoGesture` needs. */
export interface LassoGestureOptions {
  /**
   * Whether a drag draws an outline. The pointer is still followed when it is
   * off, so a plot with no lasso still has a hover card.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether a finger draws rather than scrolling the page. Off, because a
   * figure that traps the page scroll on a phone is the worse fault.
   * @default false
   */
  touch?: boolean;
  /**
   * How far the pointer moves before a vertex is kept, in pixels.
   * @default 3
   */
  minDistance?: number;
  /**
   * Where the rectangle's left edge sits in the space the points were measured
   * in — the plot's `left`, since a plot is inset by its axes.
   * @default 0
   */
  originX?: number;
  /**
   * Where its top edge sits, the plot's `top`.
   * @default 0
   */
  originY?: number;
  /**
   * What a drag with no modifier held does to the selection.
   * @default 'replace'
   */
  mode?: ScatterSelectionMode;
  /**
   * Called on every frame the outline grew, and once with `null` when the drag
   * ends — so whatever was drawn from the growing path is cleared by the same
   * hand that set it.
   * @default undefined
   */
  onDraw?: (path: LassoPath | null, mode: ScatterSelectionMode) => void;
  /**
   * Called when a ring was released. The path is reused by the next drag, so
   * read it before returning.
   * @default undefined
   */
  onComplete?: (path: LassoPath, mode: ScatterSelectionMode) => void;
  /**
   * Called instead when the pointer went up having drawn nothing worth
   * closing — a click, which a scatter reads as picking one point.
   * @default undefined
   */
  onClick?: (x: number, y: number, mode: ScatterSelectionMode) => void;
  /**
   * Called with every position the rectangle saw, coalesced to one a frame,
   * and whether a drag was running. A hover test belongs here, where it pays
   * the throttle the outline is already paying.
   * @default undefined
   */
  onMove?: (x: number, y: number, drawing: boolean) => void;
  /**
   * Called when the pointer leaves with no drag running.
   * @default undefined
   */
  onLeave?: () => void;
}

/** A lasso being drawn, or waiting to be. */
export interface LassoGesture {
  /** Spread onto the rectangle laid over the plot. */
  surface: ScatterSurfaceProps;
  /** Whether a drag is under way. */
  drawing: boolean;
  /** The outline so far as an SVG `d`, left open; `''` between drags. */
  pathData: string;
  /**
   * What releasing now would do to the selection. It is reported while the
   * drag runs, so a caption can say `Adding to the selection` from the moment
   * Shift goes down rather than after the fact.
   */
  mode: ScatterSelectionMode;
  /** Abandon the drag from outside — what Escape is wired to. */
  cancel: () => void;
}

/** The modifier keys the hand making a gesture is holding. */
export interface GestureModifiers {
  /** Whether Alt is down, which always removes. */
  altKey: boolean;
  /** Whether Shift is down, which always adds. */
  shiftKey: boolean;
}

/** Where a booked animation frame is remembered between calls. */
export interface FrameSlot {
  /** The frame's handle, or `null` when none is booked. */
  current: number | null;
}

/** How far the pointer travels before a vertex is worth keeping, in pixels. */
export const DEFAULT_LASSO_MIN_DISTANCE = 3;

/** Vertices a stroke needs before it is a ring rather than a click. */
export const MINIMUM_RING_VERTICES = 3;

/**
 * The mode a drag is running in, from the keys the hand is holding.
 *
 * Alt removes and Shift adds whatever the plot's resting mode is, so both
 * gestures mean the same thing on every figure. Alt wins a hand holding both,
 * because taking points out is the more deliberate of the two asks.
 * @param event - The pointer event, for its modifier keys.
 * @param resting - What a drag with neither key held does.
 * @returns The mode a release would use.
 */
export function modifierMode(
  event: GestureModifiers,
  resting: ScatterSelectionMode,
): ScatterSelectionMode {
  if (event.altKey) return 'remove';
  if (event.shiftKey) return 'add';
  return resting;
}

/**
 * Where the pointer is, in the space the points were measured in.
 *
 * Measured from the rectangle rather than from the page and then shifted by
 * the plot's own corner, so the answer can be compared with a point coordinate
 * without the caller mapping anything. An element that cannot be measured —
 * a server render — reports the corner itself rather than throwing.
 * @param event - The pointer event.
 * @param originX - The rectangle's left edge in the points' space.
 * @param originY - Its top edge.
 * @returns The position, in pixels.
 */
export function surfacePosition(
  event: ReactPointerEvent<Element>,
  originX: number,
  originY: number,
): { x: number; y: number } {
  const target = event.currentTarget;
  if (typeof target?.getBoundingClientRect !== 'function') {
    return { x: originX, y: originY };
  }
  const box = target.getBoundingClientRect();
  return {
    x: event.clientX - box.left + originX,
    y: event.clientY - box.top + originY,
  };
}

/**
 * Claim the pointer, so a drag that wanders off the figure keeps drawing.
 * @param event - The pointer event that started the drag.
 */
export function capturePointer(event: ReactPointerEvent<Element>): void {
  const target = event.currentTarget;
  if (typeof target?.setPointerCapture !== 'function') return;
  try {
    target.setPointerCapture(event.pointerId);
  } catch {
    // The pointer was already gone; the drag ends through the same one path.
  }
}

/**
 * Book a frame to do the work on, unless one is already booked.
 *
 * Where there is no `requestAnimationFrame` — a server render, a test — the
 * work is done at once. Coalescing is a saving, never a requirement, and a
 * gesture that only worked in a browser with a frame clock would be untestable
 * as well as fragile.
 * @param frameRef - Where the booking is held.
 * @param run - What the frame should do.
 */
export function scheduleFrame(frameRef: FrameSlot, run: () => void): void {
  if (frameRef.current !== null) return;
  if (typeof requestAnimationFrame === 'function') {
    frameRef.current = requestAnimationFrame(run);
  } else {
    run();
  }
}

/**
 * Drop a frame that was booked and is no longer wanted.
 * @param frameRef - Where the booking is held; emptied either way.
 */
export function dropFrame(frameRef: FrameSlot): void {
  if (frameRef.current === null) return;
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(frameRef.current);
  }
  frameRef.current = null;
}
