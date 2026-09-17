/**
 * One pointer over the whole figure, serving both the brush and the hover.
 *
 * A hook cannot be called inside a `map`, so a brush per axis would have to
 * live in refs and be attached by hand; one surface that works out from the
 * press which axis was grabbed has no such problem, and it gives the hover
 * search the same once-a-frame coalescing the drag already pays for.
 *
 * The band follows the pointer live and the interval is reported on release
 * only: a table filtering on the reported interval is asked to re-render once
 * per gesture rather than sixty times a second.
 */

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

import type {
  ScatterSurfaceProps,
  SurfaceEvent,
} from '../../scatter/ui/lassoGesture.ts';
import { useCapturedPointer } from '../../scatter/ui/useCapturedPointer.ts';
import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import { PARALLEL_MARGIN } from '../core/parallelAxes.ts';
import type { ParallelBand, ParallelBrushDrag } from '../core/parallelBrush.ts';
import {
  parallelBandAt,
  parallelBandOf,
  parallelBrushTarget,
} from '../core/parallelBrush.ts';
import { parallelNearestRow } from '../core/parallelHit.ts';
import { parallelRangeList } from '../core/parallelSelection.ts';
import type { ParallelRange, ParallelRanges } from '../core/parallelTypes.ts';

import type { ParallelDraft } from './parallelGestureModel.ts';
import {
  parallelAxisById,
  parallelAxisNear,
  parallelBandsOf,
  parallelCommitOf,
  parallelPointOf,
} from './parallelGestureModel.ts';

/** What {@link useParallelGesture} needs. */
export interface ParallelGestureOptions {
  /** The axes, from left to right. */
  layouts: readonly ParallelAxisLayout[];
  /** Each axis's column, in the same order. */
  values: ReadonlyArray<ArrayLike<number>>;
  /** How many rows are drawn. */
  count: number;
  /** Height of the drawing area, in pixels. */
  innerHeight: number;
  /** Which rows a brush keeps, so an excluded line cannot be pointed at. */
  included: Uint8Array | null;
  /** The intervals in force, whoever owns them. */
  ranges: ParallelRanges;
  /**
   * Whether one axis may keep several intervals at once.
   * @default false
   */
  several?: boolean | undefined;
  /** Called when a brush is released, with every interval that axis now keeps. */
  onRangeChange: (axisId: string, ranges: readonly ParallelRange[]) => void;
  /** Called on every frame a band grows. */
  onRangePreview?:
    ((axisId: string, ranges: readonly ParallelRange[]) => void) | undefined;
  /** The row the caller says is hovered, if it owns that. */
  hovered?: number | undefined;
  /** Called with the row under the pointer, or `-1`. */
  onHoverChange?: ((index: number) => void) | undefined;
  /** Called when a line is clicked, with the row, or `-1` for empty ground. */
  onRowClick?: ((index: number) => void) | undefined;
}

/** The gesture, as the figure renders it. */
export interface ParallelGesture {
  /** Spread onto the transparent rectangle laid over the figure. */
  surface: ScatterSurfaceProps;
  /** Put on the same rectangle, for the click that picks a line. */
  onClick: (event: ReactMouseEvent<Element>) => void;
  /** The bands to draw on each axis, the one being dragged included. */
  bands: ReadonlyMap<string, ParallelBand[]>;
  /** The row under the pointer, or `-1`. */
  hovered: number;
  /** Where the pointer is in the figure, or `null` when it is away. */
  pointer: { x: number; y: number } | null;
  /** Whether a band is being dragged right now. */
  brushing: boolean;
}

/**
 * The brush and the hover, over one surface.
 * @param options - See {@link ParallelGestureOptions}.
 * @returns The gesture. See {@link ParallelGesture}.
 */
export function useParallelGesture(
  options: ParallelGestureOptions,
): ParallelGesture {
  const { layouts, values, count, innerHeight, included, ranges } = options;
  const { several = false } = options;
  const { onRangeChange, onRangePreview, onHoverChange, onRowClick } = options;

  const [draft, setDraft] = useState<ParallelDraft | null>(null);
  const [ownHovered, setOwnHovered] = useState(-1);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const hovered = options.hovered ?? ownHovered;

  const dragRef = useRef<ParallelBrushDrag | null>(null);
  const pointRef = useRef({ x: 0, y: 0 });
  const reportedRef = useRef(-1);
  const claimedRef = useRef(false);

  function commit(
    drag: ParallelBrushDrag,
    band: ParallelBand,
  ): readonly ParallelRange[] {
    const layout = parallelAxisById(layouts, drag.axis);
    if (layout === undefined) return parallelRangeList(ranges[drag.axis]);
    return parallelCommitOf({
      list: parallelRangeList(ranges[drag.axis]),
      index: drag.index,
      band,
      layout,
      still: unmoved(drag, band),
      several,
    });
  }

  function report(index: number): void {
    if (index === reportedRef.current) return;
    reportedRef.current = index;
    setOwnHovered(index);
    onHoverChange?.(index);
  }

  function findRow(point: { x: number; y: number }): number {
    return parallelNearestRow(
      point,
      layouts,
      values,
      count,
      included ?? undefined,
    );
  }

  function press(event: SurfaceEvent): boolean {
    const point = parallelPointOf(event);
    const index = parallelAxisNear(point.x, layouts);
    const layout = layouts[index];
    if (layout === undefined || point.y < 0 || point.y > innerHeight) {
      claimedRef.current = false;
      return false;
    }
    const list = parallelRangeList(ranges[layout.id]);
    const bands: ParallelBand[] = [];
    for (const range of list) bands.push(parallelBandOf(range, layout));
    const target = parallelBrushTarget(point.y, bands);
    const held = target.index === -1 ? undefined : bands[target.index];
    const drag: ParallelBrushDrag = {
      axis: layout.id,
      index: target.index,
      grip: target.grip,
      originY: point.y,
      origin: held ?? { top: point.y, bottom: point.y },
    };
    dragRef.current = drag;
    pointRef.current = point;
    claimedRef.current = true;
    setDraft({
      axis: layout.id,
      index: target.index,
      band: parallelBandAt(drag, point.y, innerHeight),
    });
    return true;
  }

  function frame(claimed: boolean): void {
    const point = pointRef.current;
    const drag = dragRef.current;
    if (claimed && drag !== null) {
      const band = parallelBandAt(drag, point.y, innerHeight);
      setDraft({ axis: drag.axis, index: drag.index, band });
      onRangePreview?.(drag.axis, commit(drag, band));
      return;
    }
    setPointer({
      x: point.x + PARALLEL_MARGIN.left,
      y: point.y + PARALLEL_MARGIN.top,
    });
    report(findRow(point));
  }

  function release(event: SurfaceEvent | null, keep: boolean): void {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraft(null);
    if (drag === null) return;
    if (event !== null) pointRef.current = parallelPointOf(event);
    if (!keep) {
      onRangePreview?.(drag.axis, parallelRangeList(ranges[drag.axis]));
      return;
    }
    const kept = commit(
      drag,
      parallelBandAt(drag, pointRef.current.y, innerHeight),
    );
    onRangePreview?.(drag.axis, kept);
    onRangeChange(drag.axis, kept);
  }

  const { surface } = useCapturedPointer({
    touch: false,
    cursor: 'crosshair',
    onPress: press,
    onMove: (event) => {
      pointRef.current = parallelPointOf(event);
      return true;
    },
    onFrame: frame,
    onRelease: release,
    onLeave: () => {
      setPointer(null);
      report(-1);
    },
  });

  const bands = useMemo(
    () => parallelBandsOf(layouts, ranges, draft),
    [layouts, ranges, draft],
  );

  function handleClick(event: ReactMouseEvent<Element>): void {
    if (claimedRef.current || onRowClick === undefined) return;
    onRowClick(findRow(parallelPointOf(event)));
  }

  return {
    surface,
    onClick: handleClick,
    bands,
    hovered,
    pointer,
    brushing: draft !== null,
  };
}

/**
 * Whether a press took hold of an interval and let it go where it found it,
 * which is a click on that interval rather than a move of it.
 * @param drag - The drag, as it began.
 * @param band - The band as the pointer left it.
 * @returns Whether nothing moved.
 */
function unmoved(drag: ParallelBrushDrag, band: ParallelBand): boolean {
  return (
    drag.index !== -1 &&
    band.top === drag.origin.top &&
    band.bottom === drag.origin.bottom
  );
}
