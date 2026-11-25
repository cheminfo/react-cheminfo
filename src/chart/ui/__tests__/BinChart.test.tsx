// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { BinChartProps } from '../BinChart.tsx';
import { BinChart } from '../BinChart.tsx';

import { installProbeStubs } from './zoomProbe.tsx';

const SERIES = {
  edges: Float64Array.from([0, 10, 20, 30, 40]),
  counts: Uint32Array.from([5, 0, 100, 1]),
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  installProbeStubs();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function draw(props: Partial<BinChartProps>): SVGSVGElement {
  act(() =>
    root.render(
      <BinChart
        series={SERIES}
        width={400}
        height={200}
        x={{ label: 'Intensity' }}
        {...props}
      />,
    ),
  );
  return host.querySelector('svg') as SVGSVGElement;
}

/**
 * Where a value of the horizontal axis lands.
 * @param svg - The chart's SVG.
 * @param value - The value.
 * @returns Its pixel, across the SVG.
 */
function pixelOf(svg: SVGSVGElement, value: number): number {
  const plot = svg.querySelector('clipPath rect') as SVGRectElement;
  const left = Number(plot.getAttribute('x'));
  const width = Number(plot.getAttribute('width'));
  return left + (value / 40) * width;
}

function pointer(
  svg: SVGSVGElement,
  type: string,
  x: number,
  init: MouseEventInit = {},
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: 100,
    button: 0,
    ...init,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    svg.dispatchEvent(event);
  });
}

test('the card of the bin under the pointer says what the host writes of it', () => {
  const svg = draw({
    readout: (bin) => ({
      title: `bin ${bin}`,
      rows: [{ label: 'Count', value: String(SERIES.counts[bin]) }],
    }),
  });
  pointer(svg, 'pointermove', pixelOf(svg, 25));

  expect(
    host.querySelector('[data-testid="bin-chart-card"]')?.textContent,
  ).toBe('bin 2Count100');
});

test('a drag across the plot zooms to the range swept, never narrower than the narrowest', () => {
  const windows: Array<[number, number]> = [];
  const svg = draw({
    narrowest: 4,
    onWindowChange: (window) => windows.push(window),
  });
  pointer(svg, 'pointerdown', pixelOf(svg, 10));
  pointer(svg, 'pointermove', pixelOf(svg, 20));
  pointer(svg, 'pointerup', pixelOf(svg, 20));
  pointer(svg, 'pointerdown', pixelOf(svg, 20));
  pointer(svg, 'pointermove', pixelOf(svg, 21));
  pointer(svg, 'pointerup', pixelOf(svg, 21));

  expect(
    windows.map(([from, to]) => [Math.round(from), Math.round(to)]),
  ).toStrictEqual([
    [10, 20],
    [19, 23],
  ]);
});

test('a chart that selects reports the range dragged and keeps its window', () => {
  const ranges: Array<[number, number]> = [];
  const windows: Array<[number, number]> = [];
  const svg = draw({
    onSelectRange: (range) => ranges.push(range),
    onWindowChange: (window) => windows.push(window),
  });
  pointer(svg, 'pointerdown', pixelOf(svg, 30));
  pointer(svg, 'pointermove', pixelOf(svg, 10));
  pointer(svg, 'pointerup', pixelOf(svg, 10));

  expect([
    ranges.map(([from, to]) => [Math.round(from), Math.round(to)]),
    windows,
  ]).toStrictEqual([[[10, 30]], []]);
});

test('a double click shows the whole range, and Ctrl with the wheel zooms about the pointer', () => {
  const windows: Array<[number, number]> = [];
  const svg = draw({
    window: [10, 30],
    onWindowChange: (window) => windows.push(window),
  });
  act(() => {
    svg.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  });
  const wheel = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: pixelOf(svg, 20),
    deltaY: -100,
    ctrlKey: true,
  });
  act(() => {
    svg.dispatchEvent(wheel);
  });
  const plain = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    deltaY: -100,
  });
  act(() => {
    svg.dispatchEvent(plain);
  });

  expect(windows[0]).toStrictEqual([0, 40]);
  expect(windows).toHaveLength(2);
  expect([wheel.defaultPrevented, plain.defaultPrevented]).toStrictEqual([
    true,
    false,
  ]);

  const [from, to] = windows[1] ?? [0, 0];

  expect([
    Math.round((from + to) * 100) / 200,
    Math.round((to - from) * 1000) / 1000,
  ]).toStrictEqual([
    20,
    Math.round(20 * Math.exp(-100 * 0.0015) * 1000) / 1000,
  ]);
});

test('a chart that picks a value reports it under the pointer all along a drag, kept inside the window, then the let-go', () => {
  const picked: Array<number | 'end'> = [];
  const windows: Array<[number, number]> = [];
  const svg = draw({
    onPickValue: (value) => picked.push(Math.round(value)),
    onPickEnd: () => picked.push('end'),
    onWindowChange: (window) => windows.push(window),
  });
  pointer(svg, 'pointerdown', pixelOf(svg, 10));
  pointer(svg, 'pointermove', pixelOf(svg, 25));
  pointer(svg, 'pointermove', pixelOf(svg, 60));
  pointer(svg, 'pointerup', pixelOf(svg, 60));

  expect([picked, windows, svg.getAttribute('cursor')]).toStrictEqual([
    [10, 25, 40, 'end'],
    [],
    'ew-resize',
  ]);
});

test('a chart that picks a value takes a press on the axis’s numbers under its plot; one that zooms does not', () => {
  const picked: number[] = [];
  const zoomed: Array<[number, number]> = [];
  const picking = draw({
    onPickValue: (value) => picked.push(Math.round(value)),
  });
  const axis = { clientY: 195 };
  pointer(picking, 'pointerdown', pixelOf(picking, 30), axis);
  pointer(picking, 'pointerup', pixelOf(picking, 30), axis);
  const zooming = draw({ onWindowChange: (window) => zoomed.push(window) });
  pointer(zooming, 'pointerdown', pixelOf(zooming, 10), axis);
  pointer(zooming, 'pointermove', pixelOf(zooming, 30), axis);
  pointer(zooming, 'pointerup', pixelOf(zooming, 30), axis);

  expect([picked, zoomed]).toStrictEqual([[30], []]);
});
