import { useVirtualizer } from '@tanstack/react-virtual';
import type { RefObject } from 'react';

import type { RowSpacers } from '../core/rowSpacers.ts';
import { rowSpacers } from '../core/rowSpacers.ts';

/** Which rows a scrolled table draws, and the empty room around them. */
export interface VirtualRows extends RowSpacers {
  /** The indices of the rows to draw, in the order they are listed. */
  indices: number[];
  /**
   * What a drawn row reports its height through, as its `ref`. A row also has
   * to carry `data-index`, which is how the measurement finds its way back to
   * the row it was taken from.
   *
   * Any element, not a `<tr>`: a peak table's rows are table rows, while a
   * fragment list's are `<div>`s carrying a drawing, and both are measured the
   * same way.
   */
  measure: (node: HTMLElement | null) => void;
}

/**
 * Draw only the rows the scroll region is showing, however long the list is.
 *
 * A peak table is a few hundred rows at rest and several thousand once the
 * window is opened onto the whole spectrum, and every one of those rows is four
 * cells the browser lays out, styles and keeps — a cost paid on the sort, on the
 * filter, and on every zoom, for rows nobody is looking at. Drawing the twenty
 * or so in view and standing two empty rows in for the rest makes that cost the
 * size of the panel rather than the size of the spectrum.
 *
 * The rows are measured rather than assumed: a row is a line of text, so its
 * height follows the font the page is rendered at and a hard-coded one would
 * put the end of a five thousand row list several screens away from the bottom
 * of the scrollbar. `estimatedRowHeight` is only what the list is worth before
 * a single row has been drawn.
 *
 * The table header scrolls inside the same region and is not part of the list,
 * so the rows really sit one header lower than this reckons. It is left that
 * way deliberately: the overscan already draws more rows than are in view, on
 * both sides, and it absorbs a header's worth of offset without the extra
 * measurement — and without the render that measuring it would cost on the way
 * to the same picture.
 * @param scrollRef - The region the rows scroll in.
 * @param count - How many rows the list holds.
 * @param estimatedRowHeight - What one row is worth until one has been drawn.
 * @returns The rows to draw and the spacers standing in for the others.
 */
export function useVirtualRows(
  scrollRef: RefObject<HTMLDivElement | null>,
  count: number,
  estimatedRowHeight: number,
): VirtualRows {
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: OVERSCAN,
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
  };
}

/**
 * How many rows are drawn beyond each end of the region.
 *
 * Enough that a wheel gesture or a drag of the scrollbar never reaches the edge
 * of what was drawn before the next render has run, and enough to cover the
 * header the list is offset by.
 */
const OVERSCAN = 12;
