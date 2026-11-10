/**
 * The editor as a page holds it, and the events a hand sends it.
 *
 * The editor is controlled, so the harness keeps the scale in state the way a
 * site does and records every scale handed up: a drag that moved an anchor
 * twice is two records, and a test reads the last one. It is shared because
 * the strip and the row under it are tested in two files, and a second copy
 * of a harness this exact is a second copy that drifts.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { ColorScale } from '../../core/interpolate.ts';

import { EditorProbe } from './EditorProbe.tsx';

/** Blue, green and red, with green off-centre so a press lands between two. */
export const SCALE: ColorScale = {
  interpolation: 'rgb',
  stops: [
    { position: 0, color: '#0000ff' },
    { position: 0.4, color: '#00ff00' },
    { position: 1, color: '#ff0000' },
  ],
};

/** Every scale the editor handed up, in order. */
export const changes: ColorScale[] = [];

let host: HTMLDivElement | null = null;
let root: Root | null = null;

/**
 * Draw the editor on a scale, with its strip 200 pixels wide at the page's
 * left edge so a client x of 50 is a quarter of the way along.
 * @param initial - The scale it opens on.
 */
export function mountEditor(initial: ColorScale = SCALE): void {
  changes.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root?.render(
      <EditorProbe initial={initial} onChange={(next) => changes.push(next)} />,
    ),
  );
  const strip = track();
  strip.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 28 }) as DOMRect;
  strip.setPointerCapture = () => undefined;
}

/** Take the editor off the page. */
export function unmountEditor(): void {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
}

/**
 * The element of the page matching a selector.
 * @param selector - What to look for.
 * @returns The element.
 */
export function find(selector: string): HTMLElement {
  return host?.querySelector(selector) as HTMLElement;
}

/**
 * An anchor on the strip.
 * @param index - Its rank, from the low end.
 * @returns Its handle.
 */
export function anchor(index: number): HTMLElement {
  return find(`[data-anchor="${String(index)}"]`);
}

/**
 * The strip the anchors stand on.
 * @returns The element that hears a press.
 */
export function track(): HTMLElement {
  return anchor(0).parentElement as HTMLElement;
}

/**
 * Send a pointer event, the way a mouse does.
 * @param target - Where it happens.
 * @param type - Which event.
 * @param clientX - Where across the page.
 * @param button - Which button, the left one when left unsaid.
 */
export function pointer(
  target: Element,
  type: string,
  clientX = 0,
  button = 0,
): void {
  const event = new MouseEvent(type, { bubbles: true, clientX, button });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    target.dispatchEvent(event);
  });
}

/**
 * Press a key.
 * @param target - What has the focus.
 * @param key - The `event.key`.
 * @param init - Any modifier held with it.
 * @returns Whether the page was refused the key's default.
 */
export function press(
  target: EventTarget,
  key: string,
  init: KeyboardEventInit = {},
): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

/**
 * The positions of the anchors of the last scale handed up.
 * @returns One position per anchor, from the low end.
 */
export function lastPositions(): number[] {
  const positions: number[] = [];
  for (const stop of changes.at(-1)?.stops ?? []) positions.push(stop.position);
  return positions;
}

/**
 * The colour box of the anchor shown below the strip.
 * @returns The `type="color"` input.
 */
export function colourBox(): HTMLInputElement {
  return find('input[type="color"]') as HTMLInputElement;
}
