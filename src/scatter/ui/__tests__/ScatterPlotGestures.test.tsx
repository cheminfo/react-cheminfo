// @vitest-environment jsdom
/**
 * A scatter worked by hand: zoomed by a wheel that has rested, reset by a
 * double click on nothing, a sample opened by a double click on its dot, and
 * the marks laid over the cloud that are not samples.
 *
 * The surface taking the pointer is laid over exactly the plot, read off its
 * own attributes, so a dot's centre is where the pointer is aimed.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ChartViewport } from '../../../chart/core/chartViewport.ts';
import { ScatterPlot } from '../ScatterPlot.tsx';
import type { ScatterPlotProps } from '../scatterPlotProps.ts';

const PLOT = {
  x: [1, 2, 3],
  y: [1, 3, 2],
  width: 400,
  height: 300,
  xAxis: { domain: [0, 4] },
  yAxis: { domain: [0, 4] },
  groupOf: [0, 0, 1],
  groups: [
    { id: 'a', label: 'A', color: '#111111' },
    { id: 'b', label: 'B', color: '#333333' },
  ],
} as const satisfies ScatterPlotProps;

let host: HTMLDivElement;
let root: Root;
const viewports: Array<ChartViewport | null> = [];
const opened: number[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  viewports.length = 0;
  opened.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function mount(props: Partial<ScatterPlotProps> = {}): void {
  act(() =>
    root.render(
      <ScatterPlot
        {...PLOT}
        wheelZoom
        onViewportChange={(next) => viewports.push(next)}
        onPointDoubleClick={(point) => opened.push(point.index)}
        {...props}
      />,
    ),
  );
  const target = surface();
  const read = (name: string) => Number(target.getAttribute(name));
  target.getBoundingClientRect = () =>
    ({
      left: read('x'),
      top: read('y'),
      width: read('width'),
      height: read('height'),
    }) as DOMRect;
}

function surface(): SVGRectElement {
  return host.querySelector('rect[tabindex="0"]') as SVGRectElement;
}

function dot(color: string): [number, number] {
  const circle = host.querySelector(
    `[data-layer="points"] [fill="${CSS.escape(color)}"]`,
  );
  return [
    Number(circle?.getAttribute('cx')),
    Number(circle?.getAttribute('cy')),
  ];
}

function doubleClick(x: number, y: number): void {
  act(() => {
    surface().dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, clientX: x, clientY: y }),
    );
  });
}

function zoomIn(): void {
  act(() => {
    surface().dispatchEvent(new MouseEvent('pointerenter'));
  });
  act(() => {
    vi.advanceTimersByTime(500);
  });
  const box = surface().getBoundingClientRect();
  act(() => {
    surface().dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: -240,
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

test('a wheel turned after a rest zooms in about the pointer', () => {
  mount();
  zoomIn();

  // The frame narrows by e^-0.36 about the middle of both axes.
  const half = 2 * Math.exp(-0.36);
  const [frame] = viewports;

  expect(viewports).toHaveLength(1);
  expect(frame?.x[0]).toBeCloseTo(2 - half, 9);
  expect(frame?.x[1]).toBeCloseTo(2 + half, 9);
  expect(frame?.y[0]).toBeCloseTo(2 - half, 9);
  expect(frame?.y[1]).toBeCloseTo(2 + half, 9);
});

test('a double click on nothing puts a zoomed frame back around everything', () => {
  mount();
  zoomIn();
  doubleClick(0, 0);
  doubleClick(0, 0);

  expect(viewports.at(-1)).toBeNull();
  expect(viewports).toHaveLength(2);
  expect(opened).toStrictEqual([]);
});

test('a double click on a dot opens that sample', () => {
  mount();
  const [x, y] = dot('#333333');
  doubleClick(x, y);

  expect(opened).toStrictEqual([2]);
});

test('a plot with nothing to open treats a double click on a dot as a reset', () => {
  mount({ onPointDoubleClick: undefined, viewport: { x: [1, 3], y: [1, 3] } });
  const [x, y] = dot('#333333');
  doubleClick(x, y);

  expect(viewports).toStrictEqual([null]);
});

test('Escape lets a card pinned by a tap go', () => {
  const pins: number[] = [];
  mount({ onPinChange: (index) => pins.push(index) });
  const [x, y] = dot('#333333');
  for (const type of ['pointerdown', 'pointerup']) {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: x,
      clientY: y,
    });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    act(() => {
      surface().dispatchEvent(event);
    });
  }
  act(() => {
    surface().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  });

  expect(pins).toStrictEqual([2, -1]);
});

test('a cross stands on each group’s average, and a caller’s marker where it says', () => {
  mount({
    showGroupMeans: true,
    markers: [{ label: 'Centre', x: 2, y: 2, color: '#0072b2', shape: 'dot' }],
  });
  const marks = [
    ...host.querySelectorAll<SVGElement>('[data-layer="marks"] [data-mark]'),
  ];

  expect(marks.map((mark) => mark.dataset.mark)).toStrictEqual([
    'Group average',
    'Group average',
    'Centre',
  ]);
  expect(
    marks.map((mark) => [
      mark.getAttribute('fill'),
      mark.getAttribute('stroke'),
    ]),
  ).toStrictEqual([
    ['none', '#111111'],
    ['none', '#333333'],
    ['#0072b2', 'none'],
  ]);
});
