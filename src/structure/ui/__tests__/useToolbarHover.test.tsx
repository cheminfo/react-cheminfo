// @vitest-environment jsdom
/**
 * Which toolbar button the pointer rests on, and when its tooltip shows.
 *
 * The editor draws its toolbar into a canvas inside a shadow root, so the
 * probe builds exactly that and moves a real pointer over it. jsdom lays
 * nothing out: the canvas is given the height openchemlib draws it at — one
 * CSS pixel per drawn pixel — and both boxes a position, which is all the
 * hook measures.
 */

import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ToolbarHover } from '../useToolbarHover.ts';
import { useToolbarHover } from '../useToolbarHover.ts';

// Seventeen 21-pixel rows inside a 2-pixel border.
const DRAWN_HEIGHT = 361;

let host: HTMLDivElement;
let root: Root;
let toolbar: HTMLCanvasElement;
const seen: Array<ToolbarHover | null> = [];

function Probe() {
  const container = useRef<HTMLDivElement>(null);
  seen.push(useToolbarHover(container));
  return <div ref={container} data-testid="editor" />;
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  seen.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Probe />));

  const container = host.querySelector<HTMLElement>('[data-testid="editor"]');
  if (container === null) throw new Error('the probe drew no container');
  placeAt(container, 100, 200);
  const editor = document.createElement('div');
  const shadow = editor.attachShadow({ mode: 'open' });
  toolbar = document.createElement('canvas');
  Object.defineProperty(toolbar, 'offsetHeight', { value: DRAWN_HEIGHT });
  placeAt(toolbar, 110, 220);
  shadow.append(toolbar);
  // The editor arrives after the hook is listening, as the lazy one does.
  await act(async () => {
    container.append(editor);
  });
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function placeAt(element: Element, left: number, top: number): void {
  element.getBoundingClientRect = () =>
    ({ left, top, right: left, bottom: top, width: 0, height: 0 }) as DOMRect;
}

function latest(): ToolbarHover | null {
  return seen.at(-1) ?? null;
}

// jsdom reads `offsetX` off `clientX`, so a client point is a toolbar point.
function pointer(type: string, x = 0, y = 0, pointerType = 'mouse'): void {
  const event = new MouseEvent(type, { clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  act(() => {
    toolbar.dispatchEvent(event);
  });
}

function wait(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

const FIRST: ToolbarHover = {
  button: 0,
  box: { left: 12, top: 22, width: 21, height: 21 },
  open: true,
};

const SECOND: ToolbarHover = {
  button: 1,
  box: { left: 12, top: 43, width: 21, height: 21 },
  open: true,
};

test('nothing is hovered before the pointer reaches the toolbar', () => {
  expect(latest()).toBeNull();
});

test('the first button waits for the pointer to rest before it opens', () => {
  pointer('pointermove', 10, 10);
  wait(249);

  expect(latest()).toBeNull();

  wait(1);

  expect(latest()).toStrictEqual(FIRST);
});

test('once a tooltip shows, the next button follows at once', () => {
  pointer('pointermove', 10, 10);
  wait(250);
  pointer('pointermove', 10, 30);

  expect(latest()).toStrictEqual(SECOND);
});

test('a button of the second column is placed beside the first', () => {
  pointer('pointermove', 30, 10);
  wait(250);

  expect(latest()).toStrictEqual({
    button: 17,
    box: { left: 33, top: 22, width: 21, height: 21 },
    open: true,
  });
});

test('moving within one button changes nothing', () => {
  pointer('pointermove', 10, 10);
  wait(250);
  const renders = seen.length;
  pointer('pointermove', 15, 20);

  expect(seen).toHaveLength(renders);
  expect(latest()).toStrictEqual(FIRST);
});

test('off the buttons the tooltip closes, keeping its text to fade with', () => {
  pointer('pointermove', 10, 10);
  wait(250);
  pointer('pointermove', 60, 10);

  expect(latest()).toStrictEqual({ ...FIRST, open: false });
});

test('crossing the toolbar without resting opens nothing', () => {
  pointer('pointermove', 10, 10);
  wait(100);
  pointer('pointermove', 10, 30);
  wait(100);
  pointer('pointermove', 60, 30);
  wait(500);

  expect(latest()).toBeNull();
});

test('pressing a button hides its tooltip until the pointer moves on', () => {
  pointer('pointermove', 10, 10);
  wait(250);
  pointer('pointerdown', 10, 10);

  expect(latest()).toStrictEqual({ ...FIRST, open: false });

  pointer('pointermove', 12, 14);
  wait(500);

  expect(latest()).toStrictEqual({ ...FIRST, open: false });

  pointer('pointermove', 10, 30);

  expect(latest()?.open).toBe(false);

  wait(250);

  expect(latest()).toStrictEqual(SECOND);
});

test('leaving the toolbar closes the tooltip, and the next one waits again', () => {
  pointer('pointermove', 10, 10);
  wait(250);
  pointer('pointerleave');

  expect(latest()).toStrictEqual({ ...FIRST, open: false });

  pointer('pointermove', 10, 30);
  wait(249);

  expect(latest()?.open).toBe(false);

  wait(1);

  expect(latest()).toStrictEqual(SECOND);
});

test('a finger opens nothing, since a tooltip would cover the canvas', () => {
  pointer('pointermove', 10, 10, 'touch');
  wait(500);

  expect(latest()).toBeNull();
});

test('a tooltip still waiting is dropped when the editor goes away', () => {
  pointer('pointermove', 10, 10);
  const renders = seen.length;
  act(() => root.unmount());
  vi.advanceTimersByTime(500);
  root = createRoot(host);

  expect(seen).toHaveLength(renders);
  expect(vi.getTimerCount()).toBe(0);
});
