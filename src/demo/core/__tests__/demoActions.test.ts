// @vitest-environment jsdom
/**
 * A step's pointing, clicking and waiting, played through the demo's cursor:
 * at a hand's pace on the step a slide has lit, at once on the steps replayed
 * to reach it, and stopped where it is when the slide moves on.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createDemoActions } from '../demoActions.ts';
import type { DemoCursor } from '../demoCursor.ts';
import { createDemoCursor } from '../demoCursor.ts';

import type { Heard } from './page.ts';
import {
  POINTER_TYPES,
  build,
  installPage,
  listen,
  place,
  rejection,
  removePage,
} from './page.ts';

let byId: (id: string) => HTMLElement;
let cursor: DemoCursor;
let listened: Heard[];
const never = new AbortController().signal;

beforeEach(() => {
  vi.useFakeTimers();
  installPage();
  byId = build('<button id="go">Go</button><div id="canvas"></div>');
  place(byId('go'), { left: 10, top: 10, width: 100, height: 30 });
  place(byId('canvas'), { left: 200, top: 100, width: 300, height: 200 });
  cursor = createDemoCursor(document);
  listened = listen(POINTER_TYPES);
});

afterEach(() => {
  removePage();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function play(action: Promise<void>): Promise<void> {
  await vi.runAllTimersAsync();
  await action;
}

function sequence(target: string): string[] {
  return listened
    .filter((event) => event.target === target)
    .map((event) => `${event.type}:${event.detail}`);
}

test('a fast click jumps onto the middle of the control and clicks it once', async () => {
  const actions = createDemoActions({ cursor, signal: never, fast: true });

  await play(actions.click('#go'));

  expect(actions.fast).toBe(true);
  expect(listened.map((event) => [event.type, event.x, event.y])).toStrictEqual(
    [
      ['pointerover', 60, 25],
      ['mouseover', 60, 25],
      ['pointermove', 60, 25],
      ['mousemove', 60, 25],
      ['pointerdown', 60, 25],
      ['mousedown', 60, 25],
      ['pointerup', 60, 25],
      ['mouseup', 60, 25],
      ['click', 60, 25],
    ],
  );
  expect(cursor.position).toStrictEqual({ x: 60, y: 25 });
  expect(document.activeElement).toBe(byId('go'));
});

test('a slow click glides there, passing over what lies on the way', async () => {
  const actions = createDemoActions({ cursor, signal: never, fast: false });

  await play(actions.click('#go'));

  expect(sequence('go').filter((step) => !step.includes('move'))).toStrictEqual(
    [
      'pointerover:0',
      'mouseover:0',
      'pointerdown:1',
      'mousedown:1',
      'pointerup:1',
      'mouseup:1',
      'click:1',
    ],
  );
  // The straight line from the middle of the window to the button crosses
  // the canvas, which is entered and left on the way.
  expect(
    sequence('canvas').filter((step) => !step.includes('move')),
  ).toStrictEqual([
    'pointerover:0',
    'mouseover:0',
    'pointerout:0',
    'mouseout:0',
  ]);
  expect(cursor.position).toStrictEqual({ x: 60, y: 25 });
});

test('a slow press is ringed and shown pressed, a fast one only pressed', async () => {
  const seen: Array<[number, boolean]> = [];
  byId('go').addEventListener('pointerdown', () => {
    seen.push([
      document.querySelectorAll('.demo-cursor-ripple').length,
      document
        .querySelector('.demo-cursor')
        ?.classList.contains('demo-cursor--pressed') ?? false,
    ]);
  });

  await play(
    createDemoActions({ cursor, signal: never, fast: false }).click('#go'),
  );
  await play(
    createDemoActions({ cursor, signal: never, fast: true }).click('#go'),
  );

  expect(seen).toStrictEqual([
    [1, true],
    [0, true],
  ]);
  expect(document.querySelectorAll('.demo-cursor-ripple')).toHaveLength(0);
  expect(
    document
      .querySelector('.demo-cursor')
      ?.classList.contains('demo-cursor--pressed'),
  ).toBe(false);
});

test('a double click presses twice, the second press a double click', async () => {
  const actions = createDemoActions({ cursor, signal: never, fast: true });

  await play(actions.doubleClick('#canvas'));

  expect(
    sequence('canvas').filter((step) => /down|up|click/.test(step)),
  ).toStrictEqual([
    'pointerdown:1',
    'mousedown:1',
    'pointerup:1',
    'mouseup:1',
    'click:1',
    'pointerdown:2',
    'mousedown:2',
    'pointerup:2',
    'mouseup:2',
    'click:2',
    'dblclick:2',
  ]);
});

test('pointing moves the cursor onto a target without pressing it', async () => {
  const actions = createDemoActions({ cursor, signal: never, fast: true });

  await play(actions.point('#canvas'));

  expect(sequence('canvas')).toStrictEqual([
    'pointerover:0',
    'mouseover:0',
    'pointermove:0',
    'mousemove:0',
  ]);
  expect(cursor.position).toStrictEqual({ x: 350, y: 200 });
});

test('a fast step skips its pauses, and a slow one waits them out', async () => {
  let fastDone = false;
  void createDemoActions({ cursor, signal: never, fast: true })
    .wait(5000)
    .then(() => {
      fastDone = true;
    });
  await vi.advanceTimersByTimeAsync(0);

  expect(fastDone).toBe(true);

  let slowDone = false;
  const slow = createDemoActions({ cursor, signal: never, fast: false })
    .wait(500)
    .then(() => {
      slowDone = true;
    });
  await vi.advanceTimersByTimeAsync(499);

  expect(slowDone).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  await slow;

  expect(slowDone).toBe(true);
});

test('a pause stopped by the slide ends at once, its timer cleared', async () => {
  const controller = new AbortController();
  const actions = createDemoActions({
    cursor,
    signal: controller.signal,
    fast: false,
  });
  const stopped = rejection(actions.wait(1000));

  await vi.advanceTimersByTimeAsync(100);
  controller.abort(new Error('moved on'));

  await expect(stopped).resolves.toBe('moved on');
  expect(vi.getTimerCount()).toBe(0);
});

test('a click stopped between its press and its release never clicks', async () => {
  const controller = new AbortController();
  byId('go').addEventListener('pointerdown', () => {
    controller.abort(new Error('the slide moved on'));
  });
  const actions = createDemoActions({
    cursor,
    signal: controller.signal,
    fast: true,
  });

  const stopped = rejection(actions.click('#go'));
  await vi.runAllTimersAsync();

  await expect(stopped).resolves.toBe('the slide moved on');

  expect(
    sequence('go').filter((step) => /down|up|click/.test(step)),
  ).toStrictEqual(['pointerdown:1', 'mousedown:1']);
});
