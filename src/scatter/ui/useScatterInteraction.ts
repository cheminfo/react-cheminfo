import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type { LassoPath } from '../core/lassoPath.ts';
import { pointsInPolygon } from '../core/polygon.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';
import { nearestPointIndex } from '../core/screenPoints.ts';

import type { SurfaceEvent } from './lassoGesture.ts';
import { surfacePosition } from './lassoGesture.ts';
import type {
  ScatterInteractionApi,
  ScatterInteractionOptions,
} from './scatterInteractionTypes.ts';
import { useLassoGesture } from './useLassoGesture.ts';
import { DEFAULT_HOVER_RADIUS, usePointHover } from './usePointHover.ts';
import { useScatterKeyboard } from './useScatterKeyboard.ts';
import { useScatterSelection } from './useScatterSelection.ts';

/**
 * Every way a reader touches a scatter, wired together.
 *
 * The four hooks underneath are separately usable and separately tested; this
 * is the one a plot calls, and it holds the decisions that only make sense
 * between them — that a click on empty ground clears rather than selecting
 * nothing, that hovering stops while a lasso is drawn, and that `Escape`
 * abandons the drag and lets the card go.
 *
 * The buffer the polygon test writes into is kept across frames: a drag runs
 * that test once a frame over every point, and a fresh mask per frame is an
 * allocation the collector answers for during the one interaction where a
 * dropped frame shows as a kink in the line being drawn.
 * @param options - See {@link ScatterInteractionOptions}.
 * @returns The interaction. See {@link ScatterInteractionApi}.
 */
export function useScatterInteraction(
  options: ScatterInteractionOptions,
): ScatterInteractionApi {
  const {
    points,
    originX = 0,
    originY = 0,
    selected,
    defaultSelected,
    onSelectionChange,
    selectMode = 'replace',
    enabled = true,
    touchLasso = false,
    hoverRadius,
    included,
    onHoverChange,
    onPinChange,
    onLassoChange,
  } = options;

  const radius = hoverRadius ?? DEFAULT_HOVER_RADIUS;
  const count = Math.min(points.x.length, points.y.length);
  const hitsRef = useRef<Uint8Array | null>(null);

  const selection = useScatterSelection({
    count,
    selected,
    defaultSelected,
    onSelectionChange,
  });
  const hover = usePointHover({
    points,
    radius,
    included,
    onHoverChange,
    onPinChange,
  });

  const { clear, preview, select, selectMask } = selection;
  const { leave, moveTo, pin, unpin } = hover;

  const caught = useCallback(
    (path: LassoPath) => {
      const hits = pointsInPolygon(
        points,
        path.xs,
        path.ys,
        path.length,
        hitsRef.current ?? undefined,
      );
      hitsRef.current = hits;
      return hits;
    },
    [points],
  );

  const onDraw = useCallback(
    (path: LassoPath | null, mode: ScatterSelectionMode) => {
      preview(path === null ? null : caught(path), mode);
    },
    [caught, preview],
  );

  const onComplete = useCallback(
    (path: LassoPath, mode: ScatterSelectionMode) => {
      selectMask(caught(path), mode, 'lasso');
    },
    [caught, selectMask],
  );

  const clickAt = useCallback(
    (x: number, y: number, mode: ScatterSelectionMode) => {
      const index = nearestPointIndex(points, x, y, radius, included);
      if (index === -1) {
        unpin();
        if (mode === 'replace') clear();
        return;
      }
      select([index], mode, 'point');
      pin(index);
    },
    [clear, included, pin, points, radius, select, unpin],
  );

  const onMove = useCallback(
    (x: number, y: number, drawing: boolean) => {
      if (!drawing) moveTo(x, y);
    },
    [moveTo],
  );

  const lasso = useLassoGesture({
    enabled,
    touch: touchLasso,
    originX,
    originY,
    mode: selectMode,
    onDraw,
    onComplete,
    onClick: clickAt,
    onMove,
    onLeave: leave,
  });

  const onCommit = useCallback(
    (index: number, mode: ScatterSelectionMode) => {
      select([index], mode, 'keyboard');
      pin(index);
    },
    [pin, select],
  );

  const onCancel = useCallback(() => {
    lasso.cancel();
    unpin();
  }, [lasso, unpin]);

  const keyboard = useScatterKeyboard({ count, onCommit, onCancel });

  const pointAt = useCallback(
    (x: number, y: number) => nearestPointIndex(points, x, y, radius, included),
    [included, points, radius],
  );

  const openAt = useCallback(
    (event: SurfaceEvent) => {
      const at = surfacePosition(event, originX, originY);
      const index = pointAt(at.x, at.y);
      if (index === -1) return null;
      const { clientX, clientY } = event;
      return { index, x: at.x, y: at.y, clientX, clientY };
    },
    [originX, originY, pointAt],
  );

  // Held in a ref so an inline arrow, which is how every caller writes it, does
  // not put the callback in the effect's dependencies and report a drag that
  // never changed on every render.
  const reportLasso = useRef(onLassoChange);
  useLayoutEffect(() => {
    reportLasso.current = onLassoChange;
  });
  const drawing = lasso.drawing;
  useEffect(() => {
    reportLasso.current?.(drawing);
  }, [drawing]);

  return {
    surface: lasso.surface,
    selection,
    hover,
    keyboard,
    lasso,
    pointAt,
    clickAt,
    openAt,
  };
}
