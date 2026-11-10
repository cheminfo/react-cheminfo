import type { Highlight, HighlightState } from '../core/highlight.ts';
import {
  highlightStateOf,
  hoverHighlight,
  sameHighlightKey,
  selectHighlight,
} from '../core/highlight.ts';

/**
 * What {@link highlightTarget} spreads onto an element: how it is lit, as
 * `data-highlight`, which is what `chrome.css` draws, and its three handlers.
 */
export type HighlightTargetProps = Record<'data-highlight', HighlightState> &
  HighlightHandlers;

/** The handlers of {@link HighlightTargetProps}. */
export interface HighlightHandlers {
  /** Points at the element's key. */
  onPointerEnter: () => void;
  /** Points at nothing, unless another element has already taken over. */
  onPointerLeave: () => void;
  /** Chooses the element's key. */
  onClick: () => void;
}

/**
 * Make an element of a view — a table row, a cell, a mark on a figure — both
 * show the page's highlight and write it. Pointing at the element lights every
 * view's drawing of the same thing; clicking or tapping it chooses it.
 *
 * Call it during render: it reads the highlight's cells there, so a component
 * that tracks its signals re-renders when either changes. A table row is
 * washed by `chrome.css`; a mark on a figure reads `data-highlight` in the
 * site's own stylesheet.
 * @param highlight - The page's highlight.
 * @param key - The thing the element draws.
 * @returns Props to spread onto the element.
 */
export function highlightTarget<K>(
  highlight: Highlight<K>,
  key: K,
): HighlightTargetProps {
  return {
    'data-highlight': highlightStateOf(highlight, key),
    onPointerEnter: () => {
      hoverHighlight(highlight, key);
    },
    onPointerLeave: () => {
      // React may deliver the next element's enter before this leave, and an
      // unconditional clear would then wipe what that element just lit.
      if (sameHighlightKey(highlight.hovered.value, key)) {
        hoverHighlight(highlight, null);
      }
    },
    onClick: () => {
      selectHighlight(highlight, key);
    },
  };
}
