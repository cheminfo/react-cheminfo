// @vitest-environment jsdom
/**
 * The pointer and mouse events a demo hands the tool: entering and leaving
 * what lies under the cursor, a press that moves the focus as a real one does,
 * and a release that clicks — twice over for a double click.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  DEMO_POINTER_ID,
  movePointer,
  pressPointer,
  releasePointer,
} from '../demoEvents.ts';

import type { Heard } from './page.ts';
import {
  POINTER_TYPES,
  build,
  installPage,
  listen,
  place,
  removePage,
} from './page.ts';

let byId: (id: string) => HTMLElement;
let heard: Heard[];

const ON_BUTTON = { x: 20, y: 20 };
const ON_CANVAS = { x: 250, y: 150 };
const NOWHERE = { x: 900, y: 900 };

beforeEach(() => {
  installPage();
  byId = build(
    `<div id="panel"><button id="go"><span id="label">Go</span></button>` +
      `<div id="canvas"></div><div id="tile" tabindex="0"></div></div>`,
  );
  place(byId('panel'), { left: 0, top: 0, width: 400, height: 300 });
  place(byId('go'), { left: 10, top: 10, width: 100, height: 30 });
  place(byId('label'), { left: 40, top: 15, width: 30, height: 20 });
  place(byId('canvas'), { left: 200, top: 100, width: 150, height: 150 });
  place(byId('tile'), { left: 10, top: 200, width: 40, height: 40 });
  heard = listen(POINTER_TYPES);
});

afterEach(() => {
  removePage();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function event(
  type: string,
  target: string,
  point: { x: number; y: number },
  buttons: number,
  detail = 0,
  related: string | null = null,
): Heard {
  return { type, target, x: point.x, y: point.y, detail, buttons, related };
}

test('a pointer coming onto an element enters it, then moves over it', () => {
  expect(movePointer(ON_BUTTON, false, null)).toBe(byId('go'));

  expect(heard).toStrictEqual([
    event('pointerover', 'go', ON_BUTTON, 0),
    event('mouseover', 'go', ON_BUTTON, 0),
    event('pointermove', 'go', ON_BUTTON, 0),
    event('mousemove', 'go', ON_BUTTON, 0),
  ]);
});

test('a pointer moving within one element only moves', () => {
  const next = { x: 30, y: 25 };

  expect(movePointer(next, false, byId('go'))).toBe(byId('go'));

  expect(heard).toStrictEqual([
    event('pointermove', 'go', next, 0),
    event('mousemove', 'go', next, 0),
  ]);
});

test('a pointer moving to another element leaves the first for it, button held', () => {
  expect(movePointer(ON_CANVAS, true, byId('go'))).toBe(byId('canvas'));

  expect(heard).toStrictEqual([
    event('pointerout', 'go', ON_CANVAS, 1, 0, 'canvas'),
    event('mouseout', 'go', ON_CANVAS, 1, 0, 'canvas'),
    event('pointerover', 'canvas', ON_CANVAS, 1, 0, 'go'),
    event('mouseover', 'canvas', ON_CANVAS, 1, 0, 'go'),
    event('pointermove', 'canvas', ON_CANVAS, 1),
    event('mousemove', 'canvas', ON_CANVAS, 1),
  ]);
});

test('a pointer moving off the page leaves what it was on, and is over nothing', () => {
  expect(movePointer(NOWHERE, false, byId('canvas'))).toBeNull();

  expect(heard).toStrictEqual([
    event('pointerout', 'canvas', NOWHERE, 0),
    event('mouseout', 'canvas', NOWHERE, 0),
  ]);
});

test('the events come from the demo pointer, as a mouse would send them', () => {
  const received: Event[] = [];
  byId('canvas').addEventListener('pointermove', (moved) => {
    received.push(moved);
  });
  byId('canvas').addEventListener('mousemove', (moved) => {
    received.push(moved);
  });

  movePointer(ON_CANVAS, true, byId('canvas'));

  const [pointer, mouse] = received as [PointerEvent, MouseEvent];

  expect(pointer).toBeInstanceOf(PointerEvent);
  expect(mouse).toBeInstanceOf(MouseEvent);
  expect(mouse).not.toBeInstanceOf(PointerEvent);
  expect({
    pointerId: pointer.pointerId,
    pointerType: pointer.pointerType,
    isPrimary: pointer.isPrimary,
    bubbles: pointer.bubbles,
    cancelable: pointer.cancelable,
    composed: pointer.composed,
    button: pointer.button,
    buttons: pointer.buttons,
    screen: [pointer.screenX, pointer.screenY],
    client: [mouse.clientX, mouse.clientY],
  }).toStrictEqual({
    pointerId: DEMO_POINTER_ID,
    pointerType: 'mouse',
    isPrimary: true,
    bubbles: true,
    cancelable: true,
    composed: true,
    button: 0,
    buttons: 1,
    screen: [250, 150],
    client: [250, 150],
  });
});

test('a press lands on what lies under the pointer, counted, button held', () => {
  pressPointer({ x: 50, y: 20 }, 2);

  expect(heard).toStrictEqual([
    event('pointerdown', 'label', { x: 50, y: 20 }, 1, 2),
    event('mousedown', 'label', { x: 50, y: 20 }, 1, 2),
  ]);
});

test('a press moves the focus to the control pressed, as a real one does', () => {
  pressPointer({ x: 50, y: 20 }, 1);

  expect(document.activeElement).toBe(byId('go'));

  pressPointer({ x: 20, y: 210 }, 1);

  expect(document.activeElement).toBe(byId('tile'));

  pressPointer(ON_CANVAS, 1);

  expect(document.activeElement).toBe(byId('tile'));
});

test('a press or a release over nothing sends nothing', () => {
  pressPointer(NOWHERE, 1);
  releasePointer(NOWHERE, 1, true);

  expect(heard).toStrictEqual([]);
});

test('a release where the press was clicks', () => {
  releasePointer(ON_CANVAS, 1, true);

  expect(heard).toStrictEqual([
    event('pointerup', 'canvas', ON_CANVAS, 0, 1),
    event('mouseup', 'canvas', ON_CANVAS, 0, 1),
    event('click', 'canvas', ON_CANVAS, 0, 1),
  ]);
});

test('the second release of a run clicks, then double-clicks', () => {
  releasePointer(ON_CANVAS, 2, true);

  expect(heard).toStrictEqual([
    event('pointerup', 'canvas', ON_CANVAS, 0, 2),
    event('mouseup', 'canvas', ON_CANVAS, 0, 2),
    event('click', 'canvas', ON_CANVAS, 0, 2),
    event('dblclick', 'canvas', ON_CANVAS, 0, 2),
  ]);
});

test('a release that ends a drag does not click', () => {
  releasePointer(ON_CANVAS, 1, false);

  expect(heard).toStrictEqual([
    event('pointerup', 'canvas', ON_CANVAS, 0, 1),
    event('mouseup', 'canvas', ON_CANVAS, 0, 1),
  ]);
});
