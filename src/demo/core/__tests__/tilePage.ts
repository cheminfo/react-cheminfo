/**
 * The page the drag tests carry a flask across: a tile in a palette, a page
 * that may take it, and a sidebar beside the page.
 */

import { vi } from 'vitest';

import type { DemoCursor } from '../demoCursor.ts';
import { createDemoCursor } from '../demoCursor.ts';
import type { DemoDragOptions } from '../demoDrag.ts';
import { dragNative } from '../demoDrag.ts';
import type { DemoPoint } from '../demoEvents.ts';

import type { Heard } from './page.ts';
import {
  build,
  installDrag,
  installPage,
  listen,
  place,
  removePage,
} from './page.ts';

/** The events a drag sends, listened for on the whole page. */
export const DRAG_TYPES = [
  'pointerdown',
  'pointercancel',
  'dragstart',
  'drag',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'dragend',
] as const;

/** Where the tile is picked up: on its label. */
export const GRAB = { x: 30, y: 25 };

/** The tile page, laid out. */
export interface TilePage {
  /** An element of the page, by its id. */
  byId: (id: string) => HTMLElement;
  /** The demo's pointer. */
  cursor: DemoCursor;
  /** The drag events heard so far. */
  heard: Heard[];
  /** Carry the tile from {@link GRAB} to a point, at once unless told. */
  drag: (end: DemoPoint, options?: Partial<DemoDragOptions>) => Promise<void>;
}

/**
 * Lay the tile page out, listening for every drag event.
 * @returns The page.
 */
export function setUpTilePage(): TilePage {
  installPage();
  installDrag();
  const byId = build(
    `<div id="tile" draggable="true" style="color: rgb(200, 0, 0); margin: 7px">` +
      `<span id="label">Flask</span><svg id="icon"></svg>` +
      `<math><mi>x</mi></math></div>` +
      `<div id="page"></div><div id="sidebar"></div>`,
  );
  place(byId('tile'), { left: 10, top: 10, width: 80, height: 40 });
  place(byId('label'), { left: 15, top: 15, width: 40, height: 20 });
  place(byId('icon'), { left: 60, top: 15, width: 20, height: 20 });
  place(byId('page'), { left: 200, top: 0, width: 400, height: 400 });
  place(byId('sidebar'), { left: 650, top: 0, width: 100, height: 400 });
  const cursor = createDemoCursor(document);
  const signal = new AbortController().signal;
  return {
    byId,
    cursor,
    heard: listen(DRAG_TYPES),
    drag: (end, options = {}) =>
      dragNative({
        source: byId('tile'),
        start: GRAB,
        end,
        cursor,
        signal,
        fast: true,
        frame: () => Promise.resolve(),
        ...options,
      }),
  };
}

/** Take the tile page away, with every stub and fake clock. */
export function tearDownTilePage(): void {
  removePage();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
}

/**
 * What the demo draws under its pointer while it drags.
 * @returns The holder of the drawn copy, or `null` when none is drawn.
 */
export function ghost(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.demo-drag-ghost');
}

/**
 * Whether the demo's cursor is shown pressed.
 * @returns `true` while it is.
 */
export function cursorPressed(): boolean {
  return (
    document
      .querySelector('.demo-cursor')
      ?.classList.contains('demo-cursor--pressed') ?? false
  );
}

/**
 * Wait for the next animation frame.
 * @returns Settles at that frame.
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}
