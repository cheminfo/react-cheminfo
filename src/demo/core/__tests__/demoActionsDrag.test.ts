// @vitest-environment jsdom
/**
 * A step's drag: a canvas is pressed and dragged with the pointer, button held
 * and never clicked, and a draggable tile is carried the way the browser
 * carries it.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DemoActions } from '../demoActions.ts';
import { createDemoActions } from '../demoActions.ts';
import type { DemoCursor } from '../demoCursor.ts';
import { createDemoCursor } from '../demoCursor.ts';
import { pointIn } from '../demoTargets.ts';

import type { Heard } from './page.ts';
import {
  POINTER_TYPES,
  build,
  installDrag,
  installPage,
  listen,
  place,
  removePage,
} from './page.ts';

let byId: (id: string) => HTMLElement;
let cursor: DemoCursor;
const never = new AbortController().signal;

beforeEach(() => {
  vi.useFakeTimers();
  installPage();
  installDrag();
  byId = build(
    '<div id="canvas"></div><div id="tile" draggable="true">Flask</div>',
  );
  place(byId('canvas'), { left: 200, top: 100, width: 300, height: 200 });
  place(byId('tile'), { left: 600, top: 10, width: 80, height: 40 });
  cursor = createDemoCursor(document);
});

afterEach(() => {
  removePage();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function actions(fast: boolean): DemoActions {
  return createDemoActions({ cursor, signal: never, fast });
}

async function play(action: Promise<void>): Promise<void> {
  await vi.runAllTimersAsync();
  await action;
}

test('a fast drag on a canvas presses, moves with the button held, and lets go without a click', async () => {
  const heard = listen(POINTER_TYPES);

  await play(
    actions(true).drag(
      pointIn('#canvas', 0.1, 0.1),
      pointIn('#canvas', 0.9, 0.9),
    ),
  );

  expect(
    heard.map((event) => [event.type, event.x, event.y, event.buttons]),
  ).toStrictEqual([
    ['pointerover', 230, 120, 0],
    ['mouseover', 230, 120, 0],
    ['pointermove', 230, 120, 0],
    ['mousemove', 230, 120, 0],
    ['pointerdown', 230, 120, 1],
    ['mousedown', 230, 120, 1],
    ['pointermove', 350, 200, 1],
    ['mousemove', 350, 200, 1],
    ['pointermove', 470, 280, 1],
    ['mousemove', 470, 280, 1],
    ['pointerup', 470, 280, 0],
    ['mouseup', 470, 280, 0],
  ]);
  expect(cursor.position).toStrictEqual({ x: 470, y: 280 });
});

test('a slow drag holds the button down all the way to where it lets go', async () => {
  const heard = listen(POINTER_TYPES);

  await play(actions(false).drag('#canvas', pointIn('#canvas', 0.9, 0.5)));

  const down = heard.findIndex((event) => event.type === 'pointerdown');
  const up = heard.findIndex((event) => event.type === 'pointerup');
  const held: Heard[] = heard.slice(down + 2, up);

  // 120 px is a 320 ms glide: twenty frames, each a pointer and a mouse move.
  expect(held).toHaveLength(40);
  expect(held.every((event) => event.buttons === 1)).toBe(true);
  expect(held.at(-1)).toStrictEqual({
    type: 'mousemove',
    target: 'canvas',
    x: 470,
    y: 200,
    detail: 0,
    buttons: 1,
    related: null,
  });
  expect(heard.at(-1)?.type).toBe('mouseup');
  expect(heard.some((event) => event.type === 'click')).toBe(false);
});

test('a drag from a draggable tile carries it, and the page reads what it wrote', async () => {
  const dropped: string[] = [];
  byId('tile').addEventListener('dragstart', (event) => {
    event.dataTransfer?.setData('text/plain', 'flask');
  });
  byId('canvas').addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  byId('canvas').addEventListener('drop', (event) => {
    dropped.push(event.dataTransfer?.getData('text/plain') ?? '');
  });

  await play(actions(true).drag('#tile', '#canvas'));

  expect(dropped).toStrictEqual(['flask']);
  expect(cursor.position).toStrictEqual({ x: 350, y: 200 });
});
