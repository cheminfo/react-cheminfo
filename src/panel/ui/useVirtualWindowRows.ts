/**
 * Drawing only the rows the page is showing, for a list that scrolls with it.
 *
 * `useVirtualRows` measures a scroll region of its own, which is what a panel
 * beside a chart has. A table filling a tab has none: it flows down the document
 * and the browser window is what scrolls it, so giving the list its own
 * `overflow` would grow a second scrollbar inside the first and cap the table at
 * whatever height it was handed — a layout change made to serve the virtualiser
 * rather than the reader.
 */

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useState } from 'react';

import { rowSpacers } from '../core/rowSpacers.ts';

import type { VirtualRows } from './useVirtualRows.ts';

/** The rows to draw, and what the list reports its own position through. */
export interface VirtualWindowRows extends VirtualRows {
  /**
   * What the element holding the rows reports its position through, as its
   * `ref`. Without it every offset is reckoned from the top of the document and
   * the wrong rows are drawn, by however tall whatever sits above the list is.
   */
  measureList: (node: HTMLElement | null) => void;
}

/**
 * Draw only the rows the page is showing, however long the list is.
 *
 * The rows are measured against the window, so the list only has to say how far
 * down the page it begins — which is what the virtualiser calls its scroll
 * margin, and what `measureList` reports.
 *
 * That position is read in a ref callback rather than in an effect, which is
 * how `useChartSize` reads a box for the same reason: the node is the only
 * thing the measurement needs, so it is taken the moment React has one and
 * taken again whenever it hands over another. A filter that cuts a thousand
 * rows to fifty changes how tall the list is and not where it starts, so there
 * is nothing to remeasure when the count moves.
 * @param count - How many rows the list holds.
 * @param estimatedRowHeight - What one row is worth until one has been drawn.
 * @returns The rows to draw, the spacers standing in for the others, and the
 * ref the list reports its position through.
 */
export function useVirtualWindowRows(
  count: number,
  estimatedRowHeight: number,
): VirtualWindowRows {
  const [scrollMargin, setScrollMargin] = useState(0);

  const measureList = useCallback((node: HTMLElement | null) => {
    if (node === null) return;
    setScrollMargin(node.getBoundingClientRect().top + window.scrollY);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => estimatedRowHeight,
    overscan: OVERSCAN,
    scrollMargin,
  });

  const drawn = virtualizer.getVirtualItems();
  const indices = new Array<number>(drawn.length);
  for (let position = 0; position < drawn.length; position++) {
    indices[position] = (drawn[position] as { index: number }).index;
  }

  return {
    indices,
    ...rowSpacers(drawn, virtualizer.getTotalSize()),
    measure: virtualizer.measureElement,
    measureList,
  };
}

/**
 * How many rows are drawn beyond each end of the window.
 *
 * The same reasoning as `useVirtualRows`, and the same number: enough that a
 * wheel gesture never reaches the edge of what was drawn before the next render
 * has run.
 */
const OVERSCAN = 12;
