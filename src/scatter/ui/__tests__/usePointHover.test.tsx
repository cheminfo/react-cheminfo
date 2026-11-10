// @vitest-environment jsdom
/**
 * The card over a scatter: following the point under the pointer, pinned
 * where the pointer was or on a named point, and let go again.
 *
 * Three points, ten pixels apart on a row, each caught within four pixels.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ScreenPoints } from '../../core/screenPoints.ts';
import type { PointHoverApi, PointHoverOptions } from '../usePointHover.ts';
import { usePointHover } from '../usePointHover.ts';

const POINTS: ScreenPoints = {
  x: Float64Array.from([10, 20, 30]),
  y: Float64Array.from([5, 5, 5]),
};

let host: HTMLDivElement;
let root: Root;
const seen: PointHoverApi[] = [];
const pins: number[] = [];

function Probe(props: Partial<PointHoverOptions>) {
  const hover = usePointHover({
    points: POINTS,
    radius: 4,
    onPinChange: (index) => pins.push(index),
    ...props,
  });
  seen.push(hover);
  return null;
}

function latest(): PointHoverApi {
  return seen.at(-1) as PointHoverApi;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  seen.length = 0;
  pins.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(props: Partial<PointHoverOptions> = {}): void {
  act(() => root.render(<Probe {...props} />));
}

function run(action: (api: PointHoverApi) => void): void {
  act(() => {
    action(latest());
  });
}

test('the card follows the point under the pointer, placed where the pointer is', () => {
  mount();
  run((api) => api.moveTo(21, 6));

  expect([latest().index, latest().pinned]).toStrictEqual([1, false]);
  expect(latest().anchor).toStrictEqual({
    x: 21,
    y: 6,
    index: 1,
    pinned: false,
  });

  run((api) => api.leave());

  expect([latest().index, latest().anchor]).toStrictEqual([-1, null]);
});

test('pinning keeps the card where the pointer was while the pointer moves on', () => {
  mount();
  run((api) => api.moveTo(29, 5));
  run((api) => api.togglePin());
  run((api) => api.moveTo(11, 5));

  expect(latest().anchor).toStrictEqual({
    x: 29,
    y: 5,
    index: 2,
    pinned: true,
  });
  expect([latest().index, latest().hovered]).toStrictEqual([2, 0]);

  run((api) => api.togglePin());

  expect(latest().anchor).toStrictEqual({
    x: 11,
    y: 5,
    index: 0,
    pinned: false,
  });
  expect(pins).toStrictEqual([2, -1]);
});

test('with nothing under the pointer there is nothing to pin', () => {
  mount();
  run((api) => api.togglePin());
  run((api) => api.moveTo(50, 50));
  run((api) => api.togglePin());

  expect([latest().pinned, pins]).toStrictEqual([false, []]);
});

test('a figure whose card cannot be pinned ignores the request', () => {
  mount({ pinnable: false });
  run((api) => api.moveTo(10, 5));
  run((api) => api.togglePin());

  expect([latest().pinned, pins]).toStrictEqual([false, []]);
});

test('a point pinned by name is anchored on the point itself', () => {
  mount();
  run((api) => api.pin(1));
  run((api) => api.pin(7));

  expect(latest().anchor).toStrictEqual({
    x: 20,
    y: 5,
    index: 1,
    pinned: true,
  });
  expect(pins).toStrictEqual([1]);

  run((api) => api.unpin());
  run((api) => api.unpin());

  expect([latest().pinned, pins]).toStrictEqual([false, [1, -1]]);
});
