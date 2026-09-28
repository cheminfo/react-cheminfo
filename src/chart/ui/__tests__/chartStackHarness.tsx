/**
 * The DOM a stack is stood up in, and the gestures a test makes on it.
 *
 * jsdom lays nothing out and implements no `ResizeObserver`, and `SplitPane`
 * needs both: it follows its own size through an observer, and it works a drag
 * out from the `clientHeight` of the box the splitter sits in. So a test stands
 * the stack up here, gives the two elements a gesture is measured against a
 * height of their own, and hands every borrowed global back when it is done —
 * a global left replaced makes a real measurement quietly impossible for
 * whatever runs next.
 *
 * The splitter is found by the mark it draws rather than by a class, which
 * emotion hashes: the mark's own element holds nothing else, and the element
 * that answers the gesture is the one holding that.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import { CHART_PANE_ATTRIBUTE } from '../../core/chartPane.ts';
import type { ChartStackPane } from '../ChartStack.tsx';
import { ChartStack } from '../ChartStack.tsx';

import { clearMountLog } from './mountLog.ts';

/** How tall the stack is laid out, in a DOM that lays nothing out by itself. */
export const STACK_HEIGHT = 600;

/**
 * Stand a stack up in a document of its own, with everything it measures with.
 */
export function mountStack(): void {
  // Without this React runs the effects outside the act that caused them, and
  // warns; a probe that reports being mounted would then report it late.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 800, STACK_HEIGHT),
  );

  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  rested.length = 0;
  clearMountLog();
}

/** Take the stack down again, and put the DOM back as it was found. */
export function unmountStack(): void {
  if (root !== null) act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  rested.length = 0;
  clearMountLog();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
}

/**
 * Draw a stack of panes, or draw the one already up again with other panes.
 * @param panes - What to stack.
 */
export function render(panes: readonly ChartStackPane[]): void {
  const drawn = root;
  if (drawn === null) throw new Error('No stack has been stood up to draw in');
  act(() =>
    drawn.render(
      <ChartStack
        panes={panes}
        onHeightChange={(id, height) => rested.push([id, height])}
      />,
    ),
  );
}

/**
 * Everything the stack has written, which for a pane of prose is its text.
 * @returns The text of the whole stack, run together.
 */
export function stackText(): string {
  return host?.textContent ?? '';
}

/**
 * The box each pane's content was drawn in.
 * @returns Every pane box drawn, top to bottom.
 */
export function paneBoxes(): HTMLElement[] {
  const drawn = host;
  if (drawn === null) throw new Error('No stack has been stood up to read');
  return [
    ...drawn.querySelectorAll<HTMLElement>(
      `[${CSS.escape(CHART_PANE_ATTRIBUTE)}]`,
    ),
  ];
}

/**
 * Which panes are drawn, and in what order.
 * @returns The identity of every pane drawn, top to bottom.
 */
export function paneIds(): Array<string | undefined> {
  return paneBoxes().map((box) => box.dataset.chartPane);
}

/**
 * The side of a split one pane was given.
 * @param index - Which pane, top to bottom.
 * @returns The element the split styles, which is the pane box's parent.
 */
export function splitSide(index: number): HTMLElement {
  const box = paneBoxes()[index];
  if (box?.parentElement == null) {
    throw new Error(`No pane is drawn at ${index} in the stack`);
  }
  return box.parentElement;
}

/**
 * Every splitter drawn, top to bottom.
 * @returns The elements a drag is started on.
 */
export function splitters(): HTMLElement[] {
  const drawn = host;
  if (drawn === null) throw new Error('No stack has been stood up to read');
  const found: HTMLElement[] = [];
  for (const element of drawn.querySelectorAll('div')) {
    if (
      element.textContent === SPLITTER_MARK &&
      element.childElementCount === 1
    ) {
      found.push(element);
    }
  }
  return found;
}

/**
 * Drag one splitter down the stack and let it go there.
 * @param index - Which splitter, top to bottom.
 * @param clientY - Where it is let go, in pixels from the top of the stack. The
 * split centres the splitter on the pointer, so the pane above is left half a
 * splitter shorter.
 */
export function dragSplitter(index: number, clientY: number): void {
  const splitter = splitters()[index];
  if (splitter?.parentElement == null) {
    throw new Error(`No splitter is drawn at ${index} in the stack`);
  }
  stand(splitter.parentElement, STACK_HEIGHT);
  stand(splitter, SPLITTER_HEIGHT);

  act(() => {
    splitter.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  });
  act(() => {
    window.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientY }),
    );
  });
  act(() => {
    window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
  });
}

/**
 * Every height a pane was left at, in the order the splitters were let go.
 * @returns What the stack reported through `onHeightChange`.
 */
export function restedHeights(): ReadonlyArray<[string, number]> {
  return rested;
}

/**
 * Give one element a height, since jsdom lays nothing out by itself.
 * @param element - What to stand up.
 * @param height - How tall it is, in pixels.
 */
function stand(element: Element, height: number): void {
  Object.defineProperty(element, 'clientHeight', {
    value: height,
    configurable: true,
  });
}

/** What the splitter of a vertical split is drawn as, and nothing else is. */
const SPLITTER_MARK = '⋯';

/** How tall the splitter is, from a stylesheet jsdom never applies. */
const SPLITTER_HEIGHT = 10;

/** What every pane was left at, as the stack reported it. */
const rested: Array<[string, number]> = [];

let host: HTMLDivElement | null = null;
let root: Root | null = null;

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    /* nothing is ever measured */
  }

  public unobserve(): void {
    /* nothing was ever measured */
  }

  public disconnect(): void {
    /* nothing to stop watching */
  }
}
