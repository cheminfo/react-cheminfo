// @vitest-environment jsdom
/**
 * Where a demo points: an element's middle, a share of its box, a point, or
 * whatever a function answers — waited for, since a step often points at what
 * the step before it made.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DemoTarget } from '../demoTargets.ts';
import { locate, pointIn } from '../demoTargets.ts';

import {
  build,
  installPage,
  place,
  rejection,
  removePage,
  scrolled,
} from './page.ts';

let byId: (id: string) => HTMLElement;
const never = new AbortController().signal;

/**
 * Ask a target built by `pointIn` — a function — where it is.
 * @param target - The target.
 * @returns Its answer.
 */
function answer(target: DemoTarget): unknown {
  return (target as () => unknown)();
}

beforeEach(() => {
  installPage();
  byId = build('<div id="canvas"></div><button id="go">Go</button>');
  place(byId('canvas'), { left: 100, top: 50, width: 200, height: 40 });
  place(byId('go'), { left: 10, top: 10, width: 60, height: 20 });
});

afterEach(() => {
  removePage();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a point inside a box is a share of its width and height', () => {
  expect(answer(pointIn(byId('canvas'), 0.25, 0.5))).toStrictEqual({
    x: 150,
    y: 70,
  });
  expect(answer(pointIn('#canvas', 1, 0))).toStrictEqual({ x: 300, y: 50 });
  expect(answer(pointIn(() => byId('go'), 0.5, 1))).toStrictEqual({
    x: 40,
    y: 30,
  });
});

test('a point inside a box is nothing while the box is missing or empty', () => {
  const hidden = document.createElement('div');
  document.body.append(hidden);

  expect(answer(pointIn('#missing', 0.5, 0.5))).toBeNull();
  expect(answer(pointIn(hidden, 0.5, 0.5))).toBeNull();
  expect(answer(pointIn(() => undefined, 0.5, 0.5))).toBeNull();
  expect(answer(pointIn(() => null, 0.5, 0.5))).toBeNull();
});

test('an element is pointed at in its middle, scrolled into view first', async () => {
  await expect(locate(byId('canvas'), never)).resolves.toStrictEqual({
    x: 200,
    y: 70,
  });
  expect(scrolled).toStrictEqual([
    [byId('canvas'), { block: 'nearest', inline: 'nearest' }],
  ]);
});

test('a selector, a point and a function are located alike', async () => {
  await expect(locate('#go', never)).resolves.toStrictEqual({ x: 40, y: 20 });
  await expect(locate({ x: 7, y: 9 }, never)).resolves.toStrictEqual({
    x: 7,
    y: 9,
  });
  await expect(locate(() => byId('go'), never)).resolves.toStrictEqual({
    x: 40,
    y: 20,
  });
  await expect(locate(pointIn('#canvas', 0, 1), never)).resolves.toStrictEqual({
    x: 100,
    y: 90,
  });
  expect(scrolled.map(([element]) => element.id)).toStrictEqual(['go', 'go']);
});

test('a target that is not there yet is waited for, frame by frame', async () => {
  vi.useFakeTimers();
  let found: unknown = null;
  const located = locate('#later', never).then((point) => {
    found = point;
  });

  await vi.advanceTimersByTimeAsync(100);

  expect(found).toBeNull();

  const later = document.createElement('div');
  later.id = 'later';
  document.body.append(later);
  await vi.advanceTimersByTimeAsync(32);

  expect(found).toBeNull();

  place(later, { left: 0, top: 200, width: 10, height: 10 });
  await vi.advanceTimersByTimeAsync(16);
  await located;

  expect(found).toStrictEqual({ x: 5, y: 205 });
});

test('a target that never comes is given up on, saying what was looked for', async () => {
  vi.useFakeTimers();
  const detached = document.createElement('div');
  const bySelector = rejection(locate('#missing', never));
  const byFunction = rejection(locate(() => null, never, 200));
  const byElement = rejection(locate(detached, never, 200));

  await vi.advanceTimersByTimeAsync(250);

  await expect(byFunction).resolves.toBe(
    'The demo found nothing at the place a step looks for.',
  );
  await expect(byElement).resolves.toBe(
    'The demo found nothing at an element no longer on the page.',
  );

  await vi.advanceTimersByTimeAsync(3800);

  await expect(bySelector).resolves.toBe(
    'The demo found nothing at "#missing".',
  );
});

test('the default wait lasts four seconds', async () => {
  vi.useFakeTimers();
  let failed = false;
  const located = locate('#missing', never).catch(() => {
    failed = true;
  });

  await vi.advanceTimersByTimeAsync(3990);

  expect(failed).toBe(false);

  await vi.advanceTimersByTimeAsync(30);
  await located;

  expect(failed).toBe(true);
});

test('a wait stops as soon as the slide moves on', async () => {
  vi.useFakeTimers();
  const before = new AbortController();
  before.abort(new Error('the slide moved'));

  await expect(locate('#go', before.signal)).rejects.toThrow('the slide moved');

  const during = new AbortController();
  const stopped = rejection(locate('#missing', during.signal));
  await vi.advanceTimersByTimeAsync(48);
  during.abort(new Error('moved on'));
  await vi.advanceTimersByTimeAsync(16);

  await expect(stopped).resolves.toBe('moved on');
});
