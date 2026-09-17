/**
 * Dragging an axis by its name to stand somewhere else.
 *
 * Two columns only show their relationship when they are neighbours, so the
 * order the axes stand in is a question the reader asks, not a decision the
 * caller takes once. The name is the handle: it is the only part of an axis
 * that is not already spoken for by the brush, and it is what a reader reaches
 * for anyway.
 *
 * The gesture moves the name and nothing else. Reordering the axes for real
 * would repaint every line on every frame, which a library of ten thousand
 * molecules cannot afford — so the figure shows where the axis would land and
 * moves it once, on release.
 */

import type { KeyboardEvent, PointerEvent } from 'react';
import { useRef, useState } from 'react';

import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import {
  parallelAxisOrder,
  parallelDropIndex,
  parallelMoveAxis,
} from '../core/parallelOrder.ts';

/** What {@link useParallelAxisDrag} needs. */
export interface ParallelAxisDragOptions {
  /** The axes, from left to right, already placed. */
  layouts: readonly ParallelAxisLayout[];
  /**
   * Called with the axis ids in the order the reader put them in.
   * @default undefined — the axes cannot be moved
   */
  onAxisOrder?: ((ids: readonly string[]) => void) | undefined;
}

/** The name being dragged, and where it would land. */
export interface ParallelAxisDragState {
  /** Which axis is moving, as an index into the axes. */
  from: number;
  /** How far its name has been dragged, in pixels. */
  dx: number;
  /** Which place it would take if let go now. */
  to: number;
}

/** The reorder gesture, as the figure renders it. */
export interface ParallelAxisDrag {
  /** Whether the axes can be moved at all. */
  enabled: boolean;
  /** The name being dragged, or `null` when none is. */
  active: ParallelAxisDragState | null;
  /** Spread onto one axis's name. */
  propsFor: (index: number) => ParallelAxisHandleProps;
}

/** What one axis name carries so it can be dragged and stepped with the keys. */
export interface ParallelAxisHandleProps {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  tabIndex: number;
}

/** A name that has not been dragged, and is not moving anything. */
const IDLE: ParallelAxisHandleProps = {
  onPointerDown: noop,
  onPointerMove: noop,
  onPointerUp: noop,
  onPointerCancel: noop,
  onKeyDown: noop,
  tabIndex: -1,
};

/**
 * Move an axis by dragging its name, or by stepping it with the arrow keys.
 * @param options - See {@link ParallelAxisDragOptions}.
 * @returns The gesture. See {@link ParallelAxisDrag}.
 */
export function useParallelAxisDrag(
  options: ParallelAxisDragOptions,
): ParallelAxisDrag {
  const { layouts, onAxisOrder } = options;
  const [active, setActive] = useState<ParallelAxisDragState | null>(null);
  const originRef = useRef(0);

  function move(from: number, to: number): void {
    if (onAxisOrder === undefined) return;
    const order = parallelAxisOrder(layouts);
    if (to < 0 || to >= order.length || to === from) return;
    onAxisOrder(parallelMoveAxis(order, from, to));
  }

  function dropAt(from: number, dx: number): number {
    const layout = layouts[from];
    if (layout === undefined) return from;
    return parallelDropIndex(layout.x + dx, layouts);
  }

  function propsFor(index: number): ParallelAxisHandleProps {
    if (onAxisOrder === undefined) return IDLE;
    return {
      tabIndex: 0,
      onPointerDown: (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        originRef.current = event.clientX;
        setActive({ from: index, dx: 0, to: index });
      },
      onPointerMove: (event) => {
        setActive((current) => {
          if (current?.from !== index) return current;
          const dx = event.clientX - originRef.current;
          return { from: index, dx, to: dropAt(index, dx) };
        });
      },
      onPointerUp: (event) => {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        setActive((current) => {
          if (current !== null && current.from === index) {
            move(current.from, current.to);
          }
          return null;
        });
      },
      onPointerCancel: () => {
        setActive(null);
      },
      onKeyDown: (event) => {
        const step =
          event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
        if (step === 0) return;
        event.preventDefault();
        move(index, index + step);
      },
    };
  }

  return { enabled: onAxisOrder !== undefined, active, propsFor };
}

function noop(): void {
  // A figure whose axes are fixed hands its names no handlers at all.
}
