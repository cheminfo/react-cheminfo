import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { ScatterSurfaceProps } from '../../scatter/ui/lassoGesture.ts';
import {
  capturePointer,
  dropFrame,
  modifierMode,
  scheduleFrame,
  surfacePosition,
} from '../../scatter/ui/lassoGesture.ts';
import type { OrbitCamera } from '../core/orbitCamera.ts';
import { orbitByDrag } from '../core/orbitCamera.ts';

/** What {@link useOrbitDrag} needs. */
export interface OrbitDragOptions {
  /**
   * Whether a drag turns the box at all. Off, the surface still reports a tap,
   * so the reader can pick a sample while the drag belongs to something else.
   * @default true
   */
  enabled?: boolean;
  /** Called with the camera each frame of a drag leaves behind. */
  onOrbit: (turn: (camera: OrbitCamera) => OrbitCamera) => void;
  /**
   * Called when a press and release happened in one place — a click, however
   * the reader's hand shook.
   * @default undefined
   */
  onTap?: (x: number, y: number, mode: ScatterSelectionMode) => void;
  /**
   * Called with the pointer's position on every frame it moves without
   * turning, which is what raises the card under it.
   * @default undefined
   */
  onMove?: (x: number, y: number) => void;
  /**
   * Called when the pointer leaves the surface without a drag in progress.
   * @default undefined
   */
  onLeave?: () => void;
  /**
   * What a tap with no modifier held does to the selection.
   * @default 'replace'
   */
  mode?: ScatterSelectionMode;
}

/** A drag that turns the box, and the taps it lets through. */
export interface OrbitDrag {
  /** Whether the box is being turned right now. */
  turning: boolean;
  /** Spread onto the transparent rectangle over the figure. */
  surface: ScatterSurfaceProps;
}

/**
 * Turning the box with the pointer.
 *
 * It is the lasso's twin and is built the same way — the pointer is captured
 * on the way down so a drag that wanders off the figure keeps turning it, all
 * three ways a capture can end lead to one function, and moves are coalesced
 * to one a frame because a pointer emits many per frame and each one that
 * reaches the caller repaints every dot and every face.
 *
 * A press that goes nowhere is a tap rather than a turn of no degrees, because
 * nobody presses a mouse button without moving it a pixel or two and a reader
 * who meant to pick a sample must not have to hold their hand still to do it.
 * @param options - See {@link OrbitDragOptions}.
 * @returns The drag. See {@link OrbitDrag}.
 */
export function useOrbitDrag(options: OrbitDragOptions): OrbitDrag {
  const {
    enabled = true,
    onOrbit,
    onTap,
    onMove,
    onLeave,
    mode: restingMode = 'replace',
  } = options;

  const pointerRef = useRef<number | null>(null);
  const lastRef = useRef({ x: 0, y: 0 });
  const travelRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<PendingTurn | null>(null);
  const [turning, setTurning] = useState(false);

  const flush = useCallback(() => {
    frameRef.current = null;
    const next = pendingRef.current;
    pendingRef.current = null;
    if (next === null) return;
    if (pointerRef.current === null) {
      onMove?.(next.x, next.y);
      return;
    }
    onOrbit((camera) => orbitByDrag(camera, next.dx, next.dy));
  }, [onMove, onOrbit]);

  const end = useCallback(
    (event: ReactPointerEvent<Element>, commit: boolean) => {
      if (event.pointerId !== pointerRef.current) return;
      pointerRef.current = null;
      pendingRef.current = null;
      dropFrame(frameRef);
      setTurning(false);
      if (!commit || travelRef.current > TAP_SLACK) return;
      const at = surfacePosition(event, 0, 0);
      onTap?.(at.x, at.y, modifierMode(event, restingMode));
    },
    [onTap, restingMode],
  );

  const handleDown = useCallback((event: ReactPointerEvent<Element>) => {
    if (pointerRef.current !== null || event.button > 0) return;
    pointerRef.current = event.pointerId;
    lastRef.current = { x: event.clientX, y: event.clientY };
    travelRef.current = 0;
    setTurning(true);
    capturePointer(event);
  }, []);

  const handleMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const active = pointerRef.current;
      if (active === null) {
        const at = surfacePosition(event, 0, 0);
        pendingRef.current = { x: at.x, y: at.y, dx: 0, dy: 0 };
        scheduleFrame(frameRef, flush);
        return;
      }
      if (event.pointerId !== active) return;
      const last = lastRef.current;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      lastRef.current = { x: event.clientX, y: event.clientY };
      travelRef.current += Math.abs(dx) + Math.abs(dy);
      if (!enabled) return;
      const waiting = pendingRef.current;
      pendingRef.current = {
        x: 0,
        y: 0,
        dx: (waiting?.dx ?? 0) + dx,
        dy: (waiting?.dy ?? 0) + dy,
      };
      scheduleFrame(frameRef, flush);
    },
    [enabled, flush],
  );

  const handleUp = useCallback(
    (event: ReactPointerEvent<Element>) => {
      end(event, true);
    },
    [end],
  );

  const handleAbandon = useCallback(
    (event: ReactPointerEvent<Element>) => {
      end(event, false);
    },
    [end],
  );

  const handleLeave = useCallback(() => {
    if (pointerRef.current !== null) return;
    pendingRef.current = null;
    onLeave?.();
  }, [onLeave]);

  const surface = useMemo<ScatterSurfaceProps>(
    () => ({
      onPointerDown: handleDown,
      onPointerMove: handleMove,
      onPointerUp: handleUp,
      onPointerCancel: handleAbandon,
      onLostPointerCapture: handleAbandon,
      onPointerLeave: handleLeave,
      style: {
        cursor: enabled ? (turning ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none',
      },
    }),
    [
      enabled,
      handleAbandon,
      handleDown,
      handleLeave,
      handleMove,
      handleUp,
      turning,
    ],
  );

  return { turning, surface };
}

/**
 * How far a press may travel and still be a tap, in pixels of total travel.
 *
 * Generous on purpose: a mouse moves a pixel or two under the click of its own
 * button, and a finger moves rather more, so a stricter number turns "pick
 * this sample" into "turn the box by nothing at all" for anybody whose hand is
 * not steady.
 */
const TAP_SLACK = 5;

/** What the pointer has done since the last frame, waiting for the next. */
interface PendingTurn {
  /** Where it is, for a move that is not turning anything. */
  x: number;
  /** Where it is. */
  y: number;
  /** How far it has moved across since the last frame. */
  dx: number;
  /** How far it has moved down. */
  dy: number;
}
