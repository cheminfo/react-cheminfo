import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { LassoPath } from '../core/lassoPath.ts';
import {
  appendLassoPoint,
  createLassoPath,
  lassoPathData,
  resetLassoPath,
} from '../core/lassoPath.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';

import type {
  LassoGesture,
  LassoGestureOptions,
  ScatterSurfaceProps,
} from './lassoGesture.ts';
import {
  DEFAULT_LASSO_MIN_DISTANCE,
  MINIMUM_RING_VERTICES,
  capturePointer,
  dropFrame,
  modifierMode,
  scheduleFrame,
  surfacePosition,
} from './lassoGesture.ts';

export type {
  LassoGesture,
  LassoGestureOptions,
  ScatterSurfaceProps,
} from './lassoGesture.ts';

/**
 * A free-hand outline drawn over a plot with the pointer.
 *
 * The pointer is captured on the way down, so a drag that wanders off the
 * figure, or off the window, keeps drawing and still finishes. All three ways
 * a capture can end lead to one function: a lasso left half-drawn because
 * `pointercancel` was handled and `lostpointercapture` was not is the classic
 * fault here, and it leaves a stroke on screen that nothing can clear.
 *
 * Moves are coalesced to one a frame, because a pointer emits many per frame
 * and each one that reaches the caller costs a walk over every point.
 * @param options - See {@link LassoGestureOptions}.
 * @returns The gesture. See {@link LassoGesture}.
 */
export function useLassoGesture(
  options: LassoGestureOptions = {},
): LassoGesture {
  const {
    enabled = true,
    touch = false,
    minDistance = DEFAULT_LASSO_MIN_DISTANCE,
    originX = 0,
    originY = 0,
    mode: restingMode = 'replace',
    onDraw,
    onComplete,
    onClick,
    onMove,
    onLeave,
  } = options;

  const pathRef = useRef<LassoPath | null>(null);
  pathRef.current ??= createLassoPath();
  const path = pathRef.current;

  const pointerRef = useRef<number | null>(null);
  const modeRef = useRef<ScatterSelectionMode>(restingMode);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<PendingMove | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [pathData, setPathData] = useState('');
  const [mode, setMode] = useState<ScatterSelectionMode>(restingMode);

  const flush = useCallback(() => {
    frameRef.current = null;
    const next = pendingRef.current;
    pendingRef.current = null;
    if (next === null) return;
    if (pointerRef.current === null) {
      onMove?.(next.x, next.y, false);
      return;
    }
    modeRef.current = next.mode;
    setMode(next.mode);
    if (appendLassoPoint(path, next.x, next.y, minDistance)) {
      setPathData(lassoPathData(path, false));
      onDraw?.(path, next.mode);
    }
    onMove?.(next.x, next.y, true);
  }, [minDistance, onDraw, onMove, path]);

  const end = useCallback(
    (commit: boolean) => {
      if (pointerRef.current === null) return;
      pointerRef.current = null;
      pendingRef.current = null;
      dropFrame(frameRef);
      const gesture = modeRef.current;
      setDrawing(false);
      setPathData('');
      if (commit) {
        if (path.length >= MINIMUM_RING_VERTICES) onComplete?.(path, gesture);
        else onClick?.(path.xs[0] ?? 0, path.ys[0] ?? 0, gesture);
      }
      onDraw?.(null, gesture);
      resetLassoPath(path);
    },
    [onClick, onComplete, onDraw, path],
  );

  const handleDown = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (!enabled || pointerRef.current !== null || event.button > 0) return;
      if (event.pointerType === 'touch' && !touch) return;
      const position = surfacePosition(event, originX, originY);
      const gesture = modifierMode(event, restingMode);
      pointerRef.current = event.pointerId;
      modeRef.current = gesture;
      resetLassoPath(path);
      appendLassoPoint(path, position.x, position.y, 0);
      setMode(gesture);
      setDrawing(true);
      setPathData(lassoPathData(path, false));
      capturePointer(event);
    },
    [enabled, originX, originY, path, restingMode, touch],
  );

  const handleMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const active = pointerRef.current;
      if (active !== null && event.pointerId !== active) return;
      const { x, y } = surfacePosition(event, originX, originY);
      const drawn = active !== null;
      pendingRef.current = {
        x,
        y,
        mode: drawn ? modifierMode(event, restingMode) : restingMode,
      };
      scheduleFrame(frameRef, flush);
    },
    [flush, originX, originY, restingMode],
  );

  const handleUp = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (event.pointerId === pointerRef.current) end(true);
    },
    [end],
  );

  const handleAbandon = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (event.pointerId === pointerRef.current) end(false);
    },
    [end],
  );

  const handleLeave = useCallback(() => {
    if (pointerRef.current !== null) return;
    pendingRef.current = null;
    onLeave?.();
  }, [onLeave]);

  const cancel = useCallback(() => {
    end(false);
  }, [end]);

  const surface = useMemo<ScatterSurfaceProps>(
    () => ({
      onPointerDown: handleDown,
      onPointerMove: handleMove,
      onPointerUp: handleUp,
      onPointerCancel: handleAbandon,
      onLostPointerCapture: handleAbandon,
      onPointerLeave: handleLeave,
      style: {
        cursor: enabled ? 'crosshair' : 'default',
        touchAction: touch ? 'none' : 'auto',
      },
    }),
    [
      enabled,
      handleAbandon,
      handleDown,
      handleLeave,
      handleMove,
      handleUp,
      touch,
    ],
  );

  return {
    surface,
    drawing,
    pathData,
    mode: drawing ? mode : restingMode,
    cancel,
  };
}

/** The last position the pointer reported, waiting for the next frame. */
interface PendingMove {
  /** Horizontal position, in the points' space. */
  x: number;
  /** Vertical position. */
  y: number;
  /** What a release at that moment would have done. */
  mode: ScatterSelectionMode;
}
