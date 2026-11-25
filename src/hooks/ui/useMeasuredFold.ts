import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * A row that folds — hands some of its parts elsewhere — so the part that
 * matters keeps its room: a list's row whose buttons move into its menu so
 * its name stays readable. It folds once that part, every other part shown,
 * would have less than its least room, and unfolds once the row is wide
 * enough to hold every part and that room again: the other parts' width is
 * measured while they are shown and remembered while they are not, so the
 * row never folds and unfolds by turns. Nothing is estimated: fonts, the
 * language and the numbers a row writes move those widths.
 */

/** What decides whether a row folds. */
export interface MeasuredFoldOptions {
  /** The selector of the part that keeps its room: the first one found in the container. */
  kept: string;
  /** The least room it keeps, pixels: with less, the row folds. */
  least: number;
}

/** What a row measured. */
export interface FoldRoom {
  /** The row's width, the kept part included. */
  row: number;
  /** The kept part's width, while the row is not folded. */
  kept: number;
  /** The width the container gives the row now. */
  available: number;
}

/**
 * Whether a row folds next, and the width it needs whole.
 * @param folded - Whether it is folded now.
 * @param room - What it measured: while folded, `kept` and `row` are not read.
 * @param least - The kept part's least room.
 * @param needed - The width it needed whole, as last measured, `null` before.
 * @returns Whether it folds, and the width it needs whole.
 */
export function nextFold(
  folded: boolean,
  room: FoldRoom,
  least: number,
  needed: number | null,
): { folded: boolean; needed: number | null } {
  if (!folded) {
    return { folded: room.kept < least, needed: room.row - room.kept + least };
  }
  return { folded: needed === null || room.available < needed, needed };
}

/**
 * Whether the rows of a container fold, measured on the first row found.
 * @param container - The container: a list.
 * @param options - See {@link MeasuredFoldOptions}.
 * @returns Whether the rows are folded.
 */
export function useMeasuredFold(
  container: RefObject<HTMLElement | null>,
  options: MeasuredFoldOptions,
): boolean {
  const { kept, least } = options;
  const [folded, setFolded] = useState(false);
  const needed = useRef<number | null>(null);
  const measure = () => {
    const box = container.current;
    const part = box?.querySelector<HTMLElement>(kept);
    const row = part?.parentElement;
    if (box === null || box === undefined || part === null || !row) return;
    if (box.clientWidth === 0) return;
    const next = nextFold(
      folded,
      {
        row: row.offsetWidth,
        kept: part.offsetWidth,
        available: box.clientWidth,
      },
      least,
      needed.current,
    );
    needed.current = next.needed;
    if (next.folded !== folded) setFolded(next.folded);
  };
  const latest = useRef(measure);
  useLayoutEffect(() => {
    latest.current = measure;
    measure();
  });
  useEffect(() => {
    const box = container.current;
    if (box === null || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => latest.current());
    observer.observe(box);
    return () => observer.disconnect();
  }, [container]);
  return folded;
}
