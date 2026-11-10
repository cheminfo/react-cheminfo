// @vitest-environment jsdom
/**
 * What a drag draws: dispatched events draw nothing, so the demo draws a faint
 * copy of the tile under its pointer, held where it was grabbed and keeping
 * the tile's look — or the image the page handed to `setDragImage`.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { TilePage } from './tilePage.ts';
import {
  GRAB,
  cursorPressed,
  ghost,
  nextFrame,
  setUpTilePage,
  tearDownTilePage,
} from './tilePage.ts';

let page: TilePage;

beforeEach(() => {
  page = setUpTilePage();
});

afterEach(tearDownTilePage);

test('a slow drag draws a copy of the tile under the pointer, held where it was grabbed', async () => {
  vi.useFakeTimers();
  const seen: Array<[string, string, boolean]> = [];
  page.byId('tile').addEventListener('drag', (event) => {
    seen.push([
      ghost()?.style.transform ?? '',
      `translate(${event.clientX - 20}px, ${event.clientY - 15}px)`,
      cursorPressed(),
    ]);
  });
  page.cursor.jump(GRAB);
  // 400 px to the right is a 440 ms glide, so 28 frames of 16 ms.
  const done = page.drag({ x: 430, y: 25 }, { fast: false, frame: nextFrame });
  const holder = ghost();

  expect(holder?.getAttribute('aria-hidden')).toBe('true');
  expect([holder?.style.width, holder?.style.height]).toStrictEqual([
    '80px',
    '40px',
  ]);
  expect(holder?.style.transform).toBe('translate(10px, 10px)');

  await vi.runAllTimersAsync();
  await done;

  expect(seen).toHaveLength(28);

  for (const [drawn, expected, pressed] of seen) {
    expect([drawn, pressed]).toStrictEqual([expected, true]);
  }

  expect(seen.at(-1)?.[0]).toBe('translate(410px, 10px)');
  expect(ghost()).toBeNull();
  expect(cursorPressed()).toBe(false);
});

test('the copy keeps the look the tile has on the page, without its margin', async () => {
  const copies: Array<HTMLElement | null> = [];
  page.byId('tile').addEventListener('drag', () => {
    copies.push(ghost()?.querySelector<HTMLElement>('[draggable]') ?? null);
  });

  await page.drag({ x: 400, y: 200 });
  const [copy, again] = copies;

  expect(again).toBe(copy);

  expect(copy?.style.getPropertyValue('color')).toBe('rgb(200, 0, 0)');
  expect(copy?.style.getPropertyValue('margin')).toBe('0px');
  expect(copy?.textContent).toBe('Flaskx');
  expect(copy?.querySelector('svg')?.style.getPropertyValue('display')).toBe(
    'inline',
  );
  // A MathML element is neither HTML nor SVG, and has no style to keep.
  expect(copy?.querySelector('math')?.hasAttribute('style')).toBe(false);
});

test('an image the page hands to setDragImage is drawn instead of the tile', async () => {
  const image = document.createElement('img');
  image.className = 'flask-image';
  page.byId('tile').addEventListener('dragstart', (event) => {
    event.dataTransfer?.setDragImage(image, 12, 8);
  });
  const drawn: string[] = [];
  page.byId('tile').addEventListener('drag', () => {
    const holder = ghost();
    drawn.push(
      [
        holder?.className,
        holder?.style.transform,
        holder?.children.length,
        holder?.firstElementChild?.className,
      ].join(' | '),
    );
  });

  await page.drag({ x: 400, y: 200 });

  expect(drawn).toStrictEqual([
    'demo-drag-ghost demo-drag-ghost--image | translate(203px, 104.5px) | 1 | flask-image',
    'demo-drag-ghost demo-drag-ghost--image | translate(388px, 192px) | 1 | flask-image',
  ]);
  expect(image.isConnected).toBe(false);
  expect(ghost()).toBeNull();
});
