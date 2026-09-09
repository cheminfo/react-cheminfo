import { useCallback, useRef } from 'react';

import type { LassoPath } from '../core/lassoPath.ts';
import { pointsInPolygon } from '../core/polygon.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';
import type { ScreenPoints } from '../core/screenPoints.ts';
import { nearestPointIndex } from '../core/screenPoints.ts';

import type { LassoGesture, ScatterSurfaceProps } from './lassoGesture.ts';
import { useLassoGesture } from './useLassoGesture.ts';
import type { PointHoverApi } from './usePointHover.ts';
import { DEFAULT_HOVER_RADIUS, usePointHover } from './usePointHover.ts';
import type { ScatterKeyboardApi } from './useScatterKeyboard.ts';
import { useScatterKeyboard } from './useScatterKeyboard.ts';
import type {
  ScatterSelectionApi,
  SelectionChange,
} from './useScatterSelection.ts';
import { useScatterSelection } from './useScatterSelection.ts';

/** What {@link useScatterInteraction} needs. */
export interface ScatterInteractionOptions {
  /** Where every point sits on screen; how many there are is read from it. */
  points: ScreenPoints;
  /**
   * Where the plot's left edge is, so a gesture lands in the same space the
   * points were measured in.
   * @default 0
   */
  originX?: number;
  /**
   * Where its top edge is.
   * @default 0
   */
  originY?: number;
  /**
   * The selected rows when the caller owns them.
   * @default undefined — the hook keeps them
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything.
   * @default undefined
   */
  defaultSelected?: readonly number[];
  /**
   * Called once per settled gesture, never during a drag.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * What a gesture with no modifier held does to the selection.
   * @default 'replace'
   */
  selectMode?: ScatterSelectionMode;
  /**
   * Whether a drag draws a lasso at all. The hover card works either way.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether a finger draws one rather than scrolling the page.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * How near the pointer a point must be to be hovered or clicked, in pixels.
   * @default 12
   */
  hoverRadius?: number;
  /**
   * One entry per point, a zero meaning it cannot be hovered or clicked.
   * @default undefined — every point can be
   */
  included?: Uint8Array;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called with the row whose card is pinned, or `-1`.
   * @default undefined
   */
  onPinChange?: (index: number) => void;
}

/** Everything a scatter needs to be touched, in five pieces. */
export interface ScatterInteractionApi {
  /** Spread onto the transparent rectangle over the plot. */
  surface: ScatterSurfaceProps;
  /** What is picked, including what a half-drawn lasso would pick. */
  selection: ScatterSelectionApi;
  /** The point a card is about, and where to put it. */
  hover: PointHoverApi;
  /** The roving cursor, whose `onKeyDown` goes on the focusable wrapper. */
  keyboard: ScatterKeyboardApi;
  /** The outline being drawn, for the plot to stroke. */
  lasso: LassoGesture;
}

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

  const onClick = useCallback(
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
    onClick,
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

  return { surface: lasso.surface, selection, hover, keyboard, lasso };
}
