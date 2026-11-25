import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

/** What decides whether the bar shows the name beside the mark. */
export interface WordmarkRoom {
  /** The name's own width, written whole. */
  natural: number;
  /** The width the name has in the bar, while it is shown. */
  shown: number;
  /** The room left in the bar beside the mark alone, while the name is not shown. */
  left: number;
  /** The gap between the mark and the name. */
  gap: number;
}

/**
 * Whether the bar shows the mark alone: when the name would be cut — an
 * ellipsis halfway through a site's name names no site —, and until the bar
 * has room for the whole name again.
 * @param markOnly - Whether the mark is alone now.
 * @param room - What the bar measured.
 * @returns Whether the mark is alone next.
 */
export function wholeWordmarkHidden(
  markOnly: boolean,
  room: WordmarkRoom,
): boolean {
  const { natural, shown, left, gap } = room;
  if (natural <= 0) return markOnly;
  if (!markOnly) return shown < natural;
  return left < natural + gap;
}

/**
 * The brand's name, whole or not at all: the name gives way to the mark as
 * soon as the bar would cut it, and comes back once the bar has room for it
 * whole — measured on the bar, whose pages and utilities keep their places.
 * It is measured when the bar first lays out, when it is handed another name,
 * and whenever the row or one of its parts changes size: a utility that
 * arrives after the first paint narrows the brand's room while the row keeps
 * its width. A render that changes none of these measures nothing.
 * @param bar - The bar's row (`app-header__inner`).
 * @param name - What names the site whose name the bar writes — its id or its
 *   host —, `undefined` while no bar is drawn: another name, or a bar drawn
 *   again, is measured anew.
 * @returns Whether the bar shows the mark alone.
 */
export function useWholeWordmark(
  bar: RefObject<HTMLElement | null>,
  name: string | undefined,
): boolean {
  const [markOnly, setMarkOnly] = useState(false);
  // What the last measurement decided, which the observer reads before React
  // has drawn it.
  const decided = useRef(false);
  const natural = useRef(0);
  useLayoutEffect(() => {
    const row = bar.current;
    if (row === null) return;
    const measure = () => {
      const word = row.querySelector<HTMLElement>('.brand .wordmark');
      if (word === null) return;
      const alone = decided.current;
      if (!alone) natural.current = word.scrollWidth;
      const next = wholeWordmarkHidden(alone, {
        natural: natural.current,
        shown: word.clientWidth,
        left: leftOver(row),
        gap: brandGap(row),
      });
      if (next === alone) return;
      decided.current = next;
      setMarkOnly(next);
    };
    measure();
    const Observer = globalThis.ResizeObserver as
      typeof ResizeObserver | undefined;
    if (Observer === undefined) return;
    const observer = new Observer(measure);
    observer.observe(row);
    for (const part of row.children) observer.observe(part);
    return () => observer.disconnect();
  }, [bar, name]);
  return markOnly;
}

/**
 * The room the bar leaves unused: its spacer, and what its pages hold beyond
 * their own width.
 * @param row - The bar's row.
 * @returns Pixels.
 */
function leftOver(row: HTMLElement): number {
  const spacer = row.querySelector<HTMLElement>(':scope > .spacer');
  const nav = row.querySelector<HTMLElement>(':scope > .app-header-nav');
  const spare =
    nav === null ? 0 : Math.max(0, nav.clientWidth - nav.scrollWidth);
  return (spacer?.offsetWidth ?? 0) + spare;
}

function brandGap(row: HTMLElement): number {
  const brand = row.querySelector<HTMLElement>(':scope > .brand');
  if (brand === null) return 0;
  const gap = Number.parseFloat(globalThis.getComputedStyle(brand).columnGap);
  return Number.isFinite(gap) ? gap : 0;
}
