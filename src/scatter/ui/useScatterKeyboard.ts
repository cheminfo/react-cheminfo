import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import { handleListNavigationKey } from '../../hooks/ui/listNavigation.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';

import { modifierMode } from './lassoGesture.ts';

/** What {@link useScatterKeyboard} needs. */
export interface ScatterKeyboardOptions {
  /** How many points the cloud holds. */
  count: number;
  /**
   * Whether the keys are read. Off, the plot still takes the focus but every
   * key falls through to the page.
   * @default true
   */
  enabled?: boolean;
  /**
   * How many points `PageUp` and `PageDown` move by.
   * @default 10
   */
  pageStep?: number;
  /**
   * Called whenever the cursor lands somewhere new, including `-1`.
   * @default undefined
   */
  onCursorChange?: (index: number) => void;
  /**
   * Called when the reader commits the cursor with `Enter` or the space bar,
   * with the mode the held modifiers ask for.
   * @default undefined
   */
  onCommit?: (index: number, mode: ScatterSelectionMode) => void;
  /**
   * Called on `Escape` — what a half-drawn lasso and a pinned card listen for.
   * @default undefined
   */
  onCancel?: () => void;
}

/** A roving cursor over the points, for a reader with no pointer. */
export interface ScatterKeyboardApi {
  /** The point the cursor is on, or `-1` before any key. */
  cursor: number;
  /** Move it from outside, so a click and the cursor agree on where they are. */
  setCursor: (index: number) => void;
  /** Put on the focusable element around the plot. */
  onKeyDown: (event: ReactKeyboardEvent<Element>) => void;
}

/**
 * Reaching every point of a scatter without a pointer.
 *
 * The same roving cursor the periodic table and every list in this family use,
 * over the same `handleListNavigationKey`, so the arrows, the page keys and
 * `Home` and `End` behave identically wherever a reader meets them. Without
 * it a lasso is the only way to pick anything, and a lasso needs a hand.
 *
 * The cursor is not the selection. It says where the reader is; `Enter` or the
 * space bar is what settles it, with Shift and Alt meaning what they mean
 * during a drag — otherwise arrowing across a cloud would replace the
 * selection on every step and the reader could never build one up.
 * @param options - See {@link ScatterKeyboardOptions}.
 * @returns The cursor. See {@link ScatterKeyboardApi}.
 */
export function useScatterKeyboard(
  options: ScatterKeyboardOptions,
): ScatterKeyboardApi {
  const {
    count,
    enabled = true,
    pageStep,
    onCursorChange,
    onCommit,
    onCancel,
  } = options;

  const [cursor, setCursorState] = useState(-1);
  const cursorRef = useRef(-1);

  const setCursor = useCallback(
    (index: number) => {
      const next =
        Number.isInteger(index) && index >= 0 && index < count ? index : -1;
      if (next === cursorRef.current) return;
      cursorRef.current = next;
      setCursorState(next);
      onCursorChange?.(next);
    },
    [count, onCursorChange],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<Element>) => {
      if (!enabled || count <= 0) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel?.();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const index = cursorRef.current;
        if (index === -1) return;
        event.preventDefault();
        onCommit?.(index, modifierMode(event, 'replace'));
        return;
      }
      handleListNavigationKey(event, {
        length: count,
        selectedIndex: cursorRef.current,
        pageStep,
        onSelect: setCursor,
      });
    },
    [count, enabled, onCancel, onCommit, pageStep, setCursor],
  );

  return { cursor, setCursor, onKeyDown };
}
