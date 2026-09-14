import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { ScatterSurfaceProps } from '../../scatter/ui/lassoGesture.ts';
import {
  modifierMode,
  surfacePosition,
} from '../../scatter/ui/lassoGesture.ts';
import { useCapturedPointer } from '../../scatter/ui/useCapturedPointer.ts';
import type { OrbitCamera } from '../core/orbitCamera.ts';
import { orbitByDrag } from '../core/orbitCamera.ts';

import type { OrbitDragTrack } from './orbitDragTrack.ts';
import {
  createOrbitDragTrack,
  followOrbitDrag,
  hoverOrbitDrag,
  isOrbitTap,
  pressOrbitDrag,
  takePendingTurn,
} from './orbitDragTrack.ts';

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
 * It is the lasso's twin and stands on the same `useCapturedPointer`, so a
 * drag that wanders off the figure keeps turning it and every way a capture
 * can end leads to one place. A finger is always claimed: a box whose one
 * gesture is turning cannot be turned on a phone that scrolls instead.
 *
 * A press that goes nowhere is a tap rather than a turn of no degrees, because
 * nobody presses a mouse button without moving it a pixel or two and a reader
 * who meant to pick a sample must not have to hold their hand still to do it.
 * The arithmetic of that decision is in `orbitDragTrack`.
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

  const trackRef = useRef<OrbitDragTrack>(createOrbitDragTrack());
  const [turning, setTurning] = useState(false);

  const press = useCallback((event: ReactPointerEvent<Element>) => {
    pressOrbitDrag(trackRef.current, event.clientX, event.clientY);
    setTurning(true);
    return true;
  }, []);

  const follow = useCallback(
    (event: ReactPointerEvent<Element>, claimed: boolean) => {
      if (!claimed) {
        const at = surfacePosition(event, 0, 0);
        hoverOrbitDrag(trackRef.current, at.x, at.y);
        return true;
      }
      return followOrbitDrag(
        trackRef.current,
        event.clientX,
        event.clientY,
        enabled,
      );
    },
    [enabled],
  );

  const flush = useCallback(
    (claimed: boolean) => {
      const next = takePendingTurn(trackRef.current);
      if (next === null) return;
      if (!claimed) {
        onMove?.(next.x, next.y);
        return;
      }
      onOrbit((camera) => orbitByDrag(camera, next.dx, next.dy));
    },
    [onMove, onOrbit],
  );

  const finish = useCallback(
    (event: ReactPointerEvent<Element> | null, commit: boolean) => {
      const track = trackRef.current;
      takePendingTurn(track);
      setTurning(false);
      if (event === null || !commit || !isOrbitTap(track)) return;
      const at = surfacePosition(event, 0, 0);
      onTap?.(at.x, at.y, modifierMode(event, restingMode));
    },
    [onTap, restingMode],
  );

  const forget = useCallback(() => {
    takePendingTurn(trackRef.current);
    onLeave?.();
  }, [onLeave]);

  const { surface } = useCapturedPointer({
    touch: true,
    cursor: enabled ? (turning ? 'grabbing' : 'grab') : 'default',
    onPress: press,
    onMove: follow,
    onFrame: flush,
    onRelease: finish,
    onLeave: forget,
  });

  return { turning, surface };
}
