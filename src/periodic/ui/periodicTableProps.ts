/**
 * What a caller hands a `PeriodicTable`.
 *
 * The props live beside the component rather than inside it, so a reader
 * looking for what the table does does not scroll past a page of options.
 */

import type { ReactNode } from 'react';

import type { Swatch } from '../../color/core/interpolate.ts';
import type { PeriodicElement } from '../core/elements.ts';
import type { ElementPick, ElementRange } from '../core/layout.ts';

/** What `PeriodicTable` needs. */
export interface PeriodicTableProps {
  /**
   * Symbol of the element the tools are pointed at.
   * @default undefined — none is
   */
  selected?: string;
  /**
   * Called with the symbol of the element that was clicked, and by the arrow
   * keys. The pick says whether the click was additive — Cmd or Ctrl held — so
   * a tool whose plain click already reads one element into a card can let the
   * same table build a set of them.
   * @default undefined — the table is a figure rather than a control
   */
  onSelect?: (symbol: string, pick: ElementPick) => void;
  /**
   * The colour each cell takes.
   * @default the family colour
   */
  swatchOf?: (element: PeriodicElement) => Swatch;
  /**
   * What is written under the symbol; an empty string writes nothing.
   * @default nothing is written
   */
  detailOf?: (element: PeriodicElement) => string;
  /**
   * How an element is named, for the label a screen reader reads. The hook a
   * site translating the table writes its own names through.
   * @default the English name
   */
  nameOf?: (element: PeriodicElement) => string;
  /**
   * Electrons in each shell of an element, innermost first, written down the
   * right-hand edge of its cell. The energy levels, which a table is also read
   * for: none of ours knows them, so the tool that does says so here.
   * @default undefined — no cell writes any
   */
  shellsOf?: (element: PeriodicElement) => readonly number[] | undefined;
  /**
   * Whether an element is inside the set the tool is showing. Everything
   * outside it is dimmed rather than removed, so the table keeps its shape.
   * @default every element is
   */
  isIncluded?: (element: PeriodicElement) => boolean;
  /**
   * What is written in the block the table leaves empty — columns 3 to 12 of
   * the first three periods, in the middle of the top edge. A tool that reads
   * one element off the table puts what it says about it there, where the eye
   * already is, rather than under the grid.
   *
   * It is sized against the table, like everything else in the grid, so give
   * it type in `em` and it scales with the drawing.
   * @default undefined — the block stays empty
   */
  inset?: ReactNode;
  /**
   * Whether to draw the group and period strips.
   * @default false
   */
  headers?: boolean;
  /**
   * Called when a whole group or period header is clicked. The run says
   * whether the click was additive — Cmd or Ctrl held — so a tool can let a
   * reader put two periods on one chart. Without it the strips are labels
   * rather than buttons.
   * @default undefined
   */
  onSelectRange?: (range: ElementRange) => void;
  /**
   * Called when the corner where the two header strips meet is clicked, which
   * is how a reader takes the whole table back. The corner shows its glyph only
   * while it is pointed at or reached from the keyboard. Without it the corner
   * stays empty.
   * @default undefined
   */
  onSelectAll?: () => void;
  /**
   * Whether to draw the family legend under the grid.
   * @default false
   */
  legend?: boolean;
  /**
   * Whether the dashed markers stand where the two inner-transition series were
   * lifted out of the main block.
   * @default true
   */
  markers?: boolean;
  /**
   * Whether the arrow keys walk the grid: down from carbon is silicon, and
   * right from the end of a period is the start of the next.
   * @default true
   */
  keyboard?: boolean;
  /**
   * Called on pointer enter with the symbol, and on leave with `null`.
   * @default undefined
   */
  onHover?: (symbol: string | null) => void;
  /**
   * Class of the outermost element.
   * @default undefined
   */
  className?: string;
}
