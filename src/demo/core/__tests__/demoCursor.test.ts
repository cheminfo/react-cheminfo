// @vitest-environment jsdom
/**
 * The pointer a demo draws over the tool: hidden until it first moves, gliding
 * at a hand's pace, marking a press and a click, and carrying the number of
 * the line the slide has lit.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DemoCursor } from '../demoCursor.ts';
import { createDemoCursor } from '../demoCursor.ts';
import type { DemoPoint } from '../demoEvents.ts';

import { rejection } from './page.ts';

let cursor: DemoCursor;
const never = new AbortController().signal;

beforeEach(() => {
  vi.useFakeTimers();
  cursor = createDemoCursor(document);
});

afterEach(() => {
  cursor.remove();
  document.body.replaceChildren();
  vi.useRealTimers();
});

function drawn(): HTMLElement {
  const element = document.querySelector<HTMLElement>('.demo-cursor');
  if (element === null) throw new Error('the cursor is not on the page');
  return element;
}

function eased(share: number): number {
  return share < 0.5 ? 4 * share ** 3 : 1 - (-2 * share + 2) ** 3 / 2;
}

/**
 * Glide the cursor and record every point it passes, frame by frame.
 * @param to - Where to.
 * @returns The points, and when the glide ended, in fake milliseconds.
 */
async function glideTo(
  to: DemoPoint,
): Promise<{ frames: DemoPoint[]; ended: number }> {
  const frames: DemoPoint[] = [];
  let ended = -1;
  const done = cursor
    .glide(to, never, (point) => {
      frames.push(point);
    })
    .then(() => {
      ended = performance.now();
    });
  await vi.runAllTimersAsync();
  await done;
  return { frames, ended };
}

test('the cursor is put on the page hidden, in the middle of the window, with no number', () => {
  const element = drawn();

  expect(element.className).toBe('demo-cursor');
  expect(element.getAttribute('aria-hidden')).toBe('true');
  expect(element.style.transform).toBe('');
  expect(element.querySelector('svg.demo-cursor-arrow path')).not.toBeNull();
  expect(element.querySelector('.demo-cursor-step')?.textContent).toBe('');
  expect(cursor.position).toStrictEqual({ x: 512, y: 384 });
});

test('a cursor in a document with no window starts in the middle of 800 × 600', () => {
  const other = document.implementation.createHTMLDocument('');

  expect(createDemoCursor(other).position).toStrictEqual({ x: 400, y: 300 });
  expect(other.body.querySelectorAll('.demo-cursor')).toHaveLength(1);
});

test('a jump shows the cursor at the point at once', () => {
  cursor.jump({ x: 10, y: 20 });

  expect(cursor.position).toStrictEqual({ x: 10, y: 20 });
  expect(drawn().style.transform).toBe('translate(10px, 20px)');
  expect(drawn().className).toBe('demo-cursor demo-cursor--shown');
});

test('a press is shown until it is released', () => {
  cursor.press(true);

  expect(drawn().classList.contains('demo-cursor--pressed')).toBe(true);

  cursor.press(false);

  expect(drawn().classList.contains('demo-cursor--pressed')).toBe(false);
});

test('the cursor carries the number of a step, or none', () => {
  const badge = drawn().querySelector('.demo-cursor-step');

  cursor.label(3);

  expect(badge?.textContent).toBe('3');
  expect(drawn().classList.contains('demo-cursor--labelled')).toBe(true);

  cursor.label(null);

  expect(badge?.textContent).toBe('');
  expect(drawn().classList.contains('demo-cursor--labelled')).toBe(false);
});

test('a click is ringed at the tip for as long as the stylesheet animates it', () => {
  cursor.jump({ x: 40, y: 60 });
  cursor.ripple();

  const ring = document.querySelector<HTMLElement>('.demo-cursor-ripple');

  expect(ring?.style.transform).toBe('translate(40px, 60px)');
  expect(ring?.parentElement).toBe(document.body);

  vi.advanceTimersByTime(599);

  expect(ring?.isConnected).toBe(true);

  vi.advanceTimersByTime(1);

  expect(ring?.isConnected).toBe(false);
});

test('removing the cursor takes it off the page', () => {
  cursor.remove();

  expect(document.querySelector('.demo-cursor')).toBeNull();
});

test('a glide eases from where the cursor is to the point, in time to its length', async () => {
  cursor.jump({ x: 0, y: 0 });

  // 500 px at 1.1 ms a pixel: 550 ms, so the frame at 560 ms is the last.
  const { frames, ended } = await glideTo({ x: 300, y: 400 });

  expect(frames).toHaveLength(35);
  expect(ended).toBe(560);

  const share = eased(16 / 550);

  expect(frames[0]?.x).toBeCloseTo(300 * share, 10);
  expect(frames[0]?.y).toBeCloseTo(400 * share, 10);

  const middle = eased(272 / 550);

  expect(frames[16]?.x).toBeCloseTo(300 * middle, 10);
  expect(frames.at(-1)).toStrictEqual({ x: 300, y: 400 });
  expect(cursor.position).toStrictEqual({ x: 300, y: 400 });
  expect(drawn().style.transform).toBe('translate(300px, 400px)');
});

test('a short glide still takes 320 ms, and a long one no more than 900 ms', async () => {
  cursor.jump({ x: 0, y: 0 });
  const short = await glideTo({ x: 10, y: 0 });

  expect(short.frames).toHaveLength(20);
  expect(short.ended).toBe(320);

  const long = await glideTo({ x: 2010, y: 0 });

  expect(long.frames).toHaveLength(57);
  expect(long.ended - short.ended).toBe(912);
  expect(long.frames.at(-1)).toStrictEqual({ x: 2010, y: 0 });
});

test('a glide stopped by the slide stays where it was', async () => {
  cursor.jump({ x: 0, y: 0 });
  const controller = new AbortController();
  const frames: DemoPoint[] = [];
  const stopped = rejection(
    cursor.glide({ x: 1000, y: 0 }, controller.signal, (point) => {
      frames.push(point);
    }),
  );

  await vi.advanceTimersByTimeAsync(48);
  controller.abort(new Error('the slide moved on'));
  await vi.advanceTimersByTimeAsync(100);

  await expect(stopped).resolves.toBe('the slide moved on');

  expect(frames).toHaveLength(3);
  expect(cursor.position).toStrictEqual(frames[2]);
  expect(cursor.position.x).toBeCloseTo(1000 * eased(48 / 900), 10);
});
