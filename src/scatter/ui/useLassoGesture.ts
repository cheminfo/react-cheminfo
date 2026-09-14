import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import type { LassoPath } from '../core/lassoPath.ts';
import {
  appendLassoPoint,
  createLassoPath,
  lassoPathData,
  resetLassoPath,
} from '../core/lassoPath.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';

import type { LassoGesture, LassoGestureOptions } from './lassoGesture.ts';
import {
  DEFAULT_LASSO_MIN_DISTANCE,
  MINIMUM_RING_VERTICES,
  modifierMode,
  surfacePosition,
} from './lassoGesture.ts';
import { useCapturedPointer } from './useCapturedPointer.ts';

/**
 * A free-hand outline drawn over a plot with the pointer.
 *
 * The pointer is claimed through `useCapturedPointer`, which is what makes a
 * drag that wanders off the figure keep drawing and still finish, and what
 * coalesces the moves to one a frame — each one that reaches the caller costs
 * a walk over every point. What is left here is the path itself.
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

  const modeRef = useRef<ScatterSelectionMode>(restingMode);
  const pendingRef = useRef<PendingMove | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [pathData, setPathData] = useState('');
  const [mode, setMode] = useState<ScatterSelectionMode>(restingMode);

  const press = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (!enabled) return false;
      const position = surfacePosition(event, originX, originY);
      const gesture = modifierMode(event, restingMode);
      modeRef.current = gesture;
      resetLassoPath(path);
      appendLassoPoint(path, position.x, position.y, 0);
      setMode(gesture);
      setDrawing(true);
      setPathData(lassoPathData(path, false));
      return true;
    },
    [enabled, originX, originY, path, restingMode],
  );

  const follow = useCallback(
    (event: ReactPointerEvent<Element>, claimed: boolean) => {
      const { x, y } = surfacePosition(event, originX, originY);
      const gesture = claimed ? modifierMode(event, restingMode) : restingMode;
      pendingRef.current = { x, y, mode: gesture };
      return true;
    },
    [originX, originY, restingMode],
  );

  const flush = useCallback(
    (claimed: boolean) => {
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next === null) return;
      if (!claimed) {
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
    },
    [minDistance, onDraw, onMove, path],
  );

  const finish = useCallback(
    (_event: ReactPointerEvent<Element> | null, commit: boolean) => {
      pendingRef.current = null;
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

  const forget = useCallback(() => {
    pendingRef.current = null;
    onLeave?.();
  }, [onLeave]);

  const { surface, abandon } = useCapturedPointer({
    touch,
    cursor: enabled ? 'crosshair' : 'default',
    onPress: press,
    onMove: follow,
    onFrame: flush,
    onRelease: finish,
    onLeave: forget,
  });

  return {
    surface,
    drawing,
    pathData,
    mode: drawing ? mode : restingMode,
    cancel: abandon,
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
