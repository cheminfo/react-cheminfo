// @vitest-environment jsdom
/**
 * A draggable element carried the way the browser carries it: `dragstart` on
 * it, `dragenter` / `dragover` / `dragleave` on what passes under the pointer,
 * a `drop` only where a target took it, and a `dragend` — all sharing one
 * `DataTransfer`.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { draggableAt } from '../demoDrag.ts';

import { rejection } from './page.ts';
import type { TilePage } from './tilePage.ts';
import {
  DRAG_TYPES,
  GRAB,
  cursorPressed,
  ghost,
  setUpTilePage,
  tearDownTilePage,
} from './tilePage.ts';

let page: TilePage;

beforeEach(() => {
  page = setUpTilePage();
});

afterEach(tearDownTilePage);

function trail(): Array<[string, string, number, number, string | null]> {
  return page.heard.map((event) => [
    event.type,
    event.target,
    event.x,
    event.y,
    event.related,
  ]);
}

test('the draggable element at a point is the one holding what lies there', () => {
  expect(draggableAt(GRAB)).toBe(page.byId('tile'));
  expect(draggableAt({ x: 70, y: 25 })).toBe(page.byId('tile'));
  expect(draggableAt({ x: 300, y: 100 })).toBeNull();
  expect(draggableAt({ x: 900, y: 900 })).toBeNull();
});

test('a drop on a page that takes it reads what the drag started with', async () => {
  const transfers = new Set<DataTransfer | null>();
  const dropped: string[] = [];
  for (const type of DRAG_TYPES.slice(2)) {
    document.addEventListener(type, (event) => {
      transfers.add((event as DragEvent).dataTransfer);
    });
  }
  page.byId('tile').addEventListener('dragstart', (event) => {
    event.dataTransfer?.setData('text/plain', 'flask');
  });
  page.byId('page').addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  page.byId('page').addEventListener('drop', (event) => {
    dropped.push(event.dataTransfer?.getData('text/plain') ?? '');
  });
  const frame = vi.fn(() => Promise.resolve());

  await page.drag({ x: 400, y: 200 }, { frame });

  expect(trail()).toStrictEqual([
    ['pointerdown', 'label', 30, 25, null],
    ['dragstart', 'tile', 30, 25, null],
    ['pointercancel', 'tile', 0, 0, null],
    ['drag', 'tile', 215, 112.5, null],
    ['dragenter', 'page', 215, 112.5, null],
    ['dragover', 'page', 215, 112.5, null],
    ['drag', 'tile', 400, 200, null],
    ['dragover', 'page', 400, 200, null],
    ['drop', 'page', 400, 200, null],
    ['dragend', 'tile', 400, 200, null],
  ]);
  expect(dropped).toStrictEqual(['flask']);
  expect(transfers.size).toBe(1);
  expect(frame).toHaveBeenCalledTimes(2);
  expect(page.cursor.position).toStrictEqual({ x: 400, y: 200 });
  expect(ghost()).toBeNull();
});

test('a target that does not cancel its dragover is left rather than dropped on', async () => {
  await page.drag({ x: 700, y: 200 });

  expect(trail().slice(3)).toStrictEqual([
    ['drag', 'tile', 365, 112.5, null],
    ['dragenter', 'page', 365, 112.5, null],
    ['dragover', 'page', 365, 112.5, null],
    ['drag', 'tile', 700, 200, null],
    ['dragleave', 'page', 700, 200, 'sidebar'],
    ['dragenter', 'sidebar', 700, 200, 'page'],
    ['dragover', 'sidebar', 700, 200, null],
    ['dragleave', 'sidebar', 700, 200, null],
    ['dragend', 'tile', 700, 200, null],
  ]);
});

test('a drag let go over nothing leaves what it passed and drops nowhere', async () => {
  await page.drag({ x: 800, y: 300 });

  expect(trail().slice(3)).toStrictEqual([
    ['drag', 'tile', 415, 162.5, null],
    ['dragenter', 'page', 415, 162.5, null],
    ['dragover', 'page', 415, 162.5, null],
    ['drag', 'tile', 800, 300, null],
    ['dragleave', 'page', 800, 300, null],
    ['dragend', 'tile', 800, 300, null],
  ]);
});

test('a drag stopped by the slide takes its copy away and lets the cursor go', async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  let carried = 0;
  page.byId('tile').addEventListener('drag', () => {
    carried += 1;
    if (carried === 3) controller.abort(new Error('the slide moved on'));
  });

  const stopped = rejection(
    page.drag({ x: 430, y: 25 }, { fast: false, signal: controller.signal }),
  );
  await vi.runAllTimersAsync();

  await expect(stopped).resolves.toBe('the slide moved on');
  expect(carried).toBe(3);
  expect(ghost()).toBeNull();
  expect(page.heard.some((event) => /drop|dragend/.test(event.type))).toBe(
    false,
  );
  expect(cursorPressed()).toBe(false);
});
