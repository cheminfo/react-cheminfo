/**
 * Bring part of an element into view through every box that scrolls around
 * it — a table's own scroller, the panel body holding the table, the page —
 * and say whether it shows: a panel sharing a column with another clips the
 * table under it, so a row inside the table's own box can still be out of
 * sight.
 */

/** A vertical extent on screen, CSS pixels. */
export interface ScreenExtent {
  /** Its top. */
  top: number;
  /** Its bottom. */
  bottom: number;
}

/** How a band is placed in a box it is brought into. */
export type RevealBlock = 'nearest' | 'center';

/** What {@link revealInScrollers} brings into view, and how. */
export interface RevealOptions {
  /**
   * The part of the element to show, CSS pixels from its top: a row and the
   * head of the settings under it.
   * @default the whole element
   */
  band?: ScreenExtent;
  /**
   * The least scroll that shows the band (its top first when it does not
   * fit), or the band in the middle of each box.
   * @default 'nearest'
   */
  block?: RevealBlock;
  /**
   * Leave still every box the pointer is over: the person is working in it,
   * so a category clicked in a panel does not slide away under the pointer
   * while the table in the same panel brings its row in.
   * @default false
   */
  keepHovered?: boolean;
}

/** The overflow values of a box that scrolls. */
const SCROLLS: ReadonlySet<string> = new Set(['auto', 'scroll']);

/** The overflow values of a box that clips what it holds. */
const CLIPS: ReadonlySet<string> = new Set([
  'auto',
  'scroll',
  'hidden',
  'clip',
]);

/**
 * How far a box scrolls, downwards, so a band shows in its view: with
 * `nearest`, nothing when it shows already, else the least that shows it,
 * never so far that the band's top leaves the view; with `center`, the band's
 * middle to the view's.
 * @param view - The box's view, on screen.
 * @param band - The band, on screen.
 * @param block - How the band is placed.
 * @default block 'nearest'
 * @returns The scroll, CSS pixels; negative upwards.
 */
export function revealShift(
  view: ScreenExtent,
  band: ScreenExtent,
  block: RevealBlock = 'nearest',
): number {
  if (block === 'center') {
    return (band.top + band.bottom) / 2 - (view.top + view.bottom) / 2;
  }
  if (band.top < view.top) return band.top - view.top;
  if (band.bottom > view.bottom) {
    return Math.min(band.bottom - view.bottom, band.top - view.top);
  }
  return 0;
}

/**
 * Where an element stands on screen, top to bottom: its border box.
 * @param element - The element.
 * @returns Its extent, on screen.
 */
export function screenExtent(element: Element): ScreenExtent {
  const { top, bottom } = element.getBoundingClientRect();
  return { top, bottom };
}

/**
 * The part of the screen where an element can show: the views of every box
 * clipping it, and the window's, laid over one another.
 * @param element - The element.
 * @returns The extent, on screen; empty (`bottom <= top`) when a box hides it.
 */
export function shownExtent(element: Element): ScreenExtent {
  const shown: ScreenExtent = { top: 0, bottom: viewportHeight(element) };
  for (let box = element.parentElement; box !== null; box = box.parentElement) {
    if (box === scrollingRoot(element) || !clips(box)) continue;
    const view = viewOf(box);
    shown.top = Math.max(shown.top, view.top);
    shown.bottom = Math.min(shown.bottom, view.bottom);
  }
  return shown;
}

/**
 * Scroll every box around an element that scrolls, innermost first, the
 * page last, so a band of the element shows: each box moves by
 * {@link revealShift}, and the boxes around it see the band where that left it.
 * @param element - The element.
 * @param options - See {@link RevealOptions}.
 */
export function revealInScrollers(
  element: Element,
  options: RevealOptions = {},
): void {
  const { block = 'nearest', keepHovered = false } = options;
  const rect = element.getBoundingClientRect();
  const band = options.band ?? { top: 0, bottom: rect.height };
  let target: ScreenExtent = {
    top: rect.top + band.top,
    bottom: rect.top + band.bottom,
  };
  const root = scrollingRoot(element);
  for (let box = element.parentElement; box !== null; box = box.parentElement) {
    const page = box === root;
    if (!page && !scrolls(box)) continue;
    if (!page && keepHovered && box.matches(':hover')) continue;
    const view = page
      ? { top: 0, bottom: viewportHeight(element) }
      : viewOf(box);
    const shift = revealShift(view, target, block);
    if (shift === 0) continue;
    const before = box.scrollTop;
    box.scrollTop = before + shift;
    const moved = box.scrollTop - before;
    target = { top: target.top - moved, bottom: target.bottom - moved };
  }
}

function viewOf(box: Element): ScreenExtent {
  const top = box.getBoundingClientRect().top + box.clientTop;
  return { top, bottom: top + box.clientHeight };
}

function scrolls(box: Element): boolean {
  if (box.scrollHeight <= box.clientHeight) return false;
  return SCROLLS.has(overflowY(box));
}

function clips(box: Element): boolean {
  return CLIPS.has(overflowY(box));
}

function overflowY(box: Element): string {
  const view = box.ownerDocument.defaultView;
  return view === null ? 'visible' : view.getComputedStyle(box).overflowY;
}

function scrollingRoot(element: Element): Element | null {
  return element.ownerDocument.scrollingElement;
}

function viewportHeight(element: Element): number {
  return element.ownerDocument.defaultView?.innerHeight ?? 0;
}
