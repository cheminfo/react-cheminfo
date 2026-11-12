// @vitest-environment jsdom
/**
 * The crosshair of a band chart, followed with a real pointer.
 *
 * Three slots of 146 pixels each run from x 10, so their middles are at 83,
 * 229 and 375; the plot runs from y 10 to 228. The pointer target is laid
 * over exactly that rectangle unless a test shrinks it, so a client point is
 * a point of the plot.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ChartSeries, ChartTrackEvent } from '../TrackedLineChart.tsx';
import { TrackedLineChart } from '../TrackedLineChart.tsx';

const SERIES: ChartSeries[] = [
  { id: 'pc1', label: 'PC1', values: [1, -1, 1], color: '#e69f00' },
  { id: 'pc2', label: 'PC2', values: [0.5, Number.NaN, 2], color: '#56b4e9' },
];

let host: HTMLDivElement;
let root: Root;
const tracked: Array<ChartTrackEvent | null> = [];
const selected: number[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  tracked.length = 0;
  selected.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(trackedIndex?: number | null, shrink = 1): void {
  act(() =>
    root.render(
      <TrackedLineChart
        categories={['a', 'b', 'c']}
        series={SERIES}
        width={460}
        height={260}
        y={{ showTicks: false }}
        trackedIndex={trackedIndex}
        onTrack={(event) => tracked.push(event)}
        onSelect={(index) => selected.push(index)}
      />,
    ),
  );
  target().getBoundingClientRect = () =>
    ({
      left: 10,
      top: 10,
      width: 438 / shrink,
      height: 218 / shrink,
    }) as DOMRect;
}

function target(): SVGRectElement {
  return host.querySelector('rect[role="button"]') as SVGRectElement;
}

function send(type: string, x = 0, y = 0): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    relatedTarget: null,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    target().dispatchEvent(event);
  });
}

function press(key: string): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target().dispatchEvent(event);
  });
  return event.defaultPrevented;
}

function crosshair(): string | null {
  const path = host.querySelector('path[style*="stroke-dasharray"]');
  return path?.getAttribute('d') ?? null;
}

test('a pointer over a slot reports it, with every series’ value there', () => {
  mount();
  send('pointermove', 229, 100);

  expect(tracked).toStrictEqual([
    {
      index: 1,
      label: 'b',
      x: 229,
      y: 100,
      values: [
        { id: 'pc1', label: 'PC1', value: -1, color: '#e69f00' },
        { id: 'pc2', label: 'PC2', value: Number.NaN, color: '#56b4e9' },
      ],
    },
  ]);
  expect(crosshair()).toBe('M229 10V228');
  expect(target().getAttribute('aria-label')).toBe('Measurement b');
});

test('a series with no value at the slot carries no marker there', () => {
  mount();
  send('pointermove', 229, 100);

  expect(host.querySelectorAll('circle')).toHaveLength(1);

  send('pointermove', 375, 100);

  expect(host.querySelectorAll('circle')).toHaveLength(2);
});

test('moving within one slot reports nothing new', () => {
  mount();
  send('pointermove', 83, 50);
  send('pointermove', 120, 60);

  expect(tracked.map((event) => event?.index)).toStrictEqual([0]);
});

test('a finger landing on the plot tracks the slot it landed in', () => {
  mount();
  send('pointerdown', 400, 30);

  expect(tracked.map((event) => [event?.index, event?.y])).toStrictEqual([
    [2, 30],
  ]);
});

test('a chart drawn smaller than its own units still finds the slot under the pointer', () => {
  mount(undefined, 2);
  send('pointermove', 10 + 219 / 2, 10 + 45);

  expect(tracked.map((event) => [event?.index, event?.y])).toStrictEqual([
    [1, 100],
  ]);
});

test('leaving says once that nothing is tracked', () => {
  mount();
  send('pointerout');
  send('pointermove', 83, 50);
  send('pointerout');
  send('pointerout');

  expect(tracked.map((event) => event?.index ?? null)).toStrictEqual([0, null]);
  expect(crosshair()).toBeNull();
});

test('a click pins the slot under the pointer, and pins nothing before it arrives', () => {
  mount();
  send('click');
  send('pointermove', 375, 50);
  send('click');

  expect(selected).toStrictEqual([2]);
});

test('Enter or Space pins the tracked slot from the keyboard', () => {
  mount(1);

  expect(press('Enter')).toBe(true);
  expect(press(' ')).toBe(true);
  expect(press('a')).toBe(false);
  expect(selected).toStrictEqual([1, 1]);
});

test('with nothing tracked, Enter is still the chart’s and pins nothing', () => {
  mount(null);

  expect(press('Enter')).toBe(true);
  expect(selected).toStrictEqual([]);
  expect(target().getAttribute('aria-label')).toBe('Measurements');
});
