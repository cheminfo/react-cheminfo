// @vitest-environment jsdom
/**
 * Which peak of a stick chart the pointer is on, followed with a real mouse.
 *
 * The pointer target is laid over exactly the plot it covers, read off its own
 * attributes, so a client point is a point of the plot: the left edge is the
 * lightest peak's side of the axis and the right edge the heaviest's.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ChartTrackEvent } from '../TrackedLineChart.tsx';
import { TrackedStickChart } from '../TrackedStickChart.tsx';

const POSITIONS = [206.1176, 252.0398, 725.5566, 881.7559];
const NAMES = POSITIONS.map((mass) => `${mass} m/z`);

let host: HTMLDivElement;
let root: Root;
const tracked: Array<ChartTrackEvent | null> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  tracked.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(trackedIndex?: number | null): void {
  act(() =>
    root.render(
      <TrackedStickChart
        positions={POSITIONS}
        categories={NAMES}
        series={[
          {
            id: 'pc1',
            label: 'PC1',
            values: [0.4, -0.2, 0.1, 0.3],
            color: '#e69f00',
          },
          {
            id: 'off',
            label: 'Off',
            values: [1, 1, 1, 1],
            color: '#000',
            visible: false,
          },
        ]}
        width={600}
        height={160}
        xLabel="m/z"
        trackedIndex={trackedIndex}
        onTrack={(event) => tracked.push(event)}
      />,
    ),
  );
  const surface = target();
  surface.getBoundingClientRect = () =>
    ({
      left: plot().left,
      top: plot().top,
      width: plot().width,
      height: plot().height,
    }) as DOMRect;
}

function target(): SVGRectElement {
  return host.querySelector('rect[aria-label="m/z"]') as SVGRectElement;
}

function plot() {
  const surface = target();
  const read = (name: string) => Number(surface.getAttribute(name));
  return {
    left: read('x'),
    top: read('y'),
    width: read('width'),
    height: read('height'),
  };
}

function send(type: string, x = 0, y = 0): void {
  act(() => {
    target().dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        clientX: x,
        clientY: y,
        relatedTarget: null,
      }),
    );
  });
}

function rule(): string | null {
  return (
    host.querySelector('[data-chart-rule="tracked"]')?.getAttribute('d') ?? null
  );
}

test('the pointer reports the peak nearest to it, with the visible series’ value', () => {
  mount();
  const { left, top, width } = plot();
  send('mousemove', left + width, top + 12);

  const [event] = tracked;

  expect(tracked).toHaveLength(1);
  expect(event?.index).toBe(3);
  expect(event?.label).toBe('881.7559 m/z');
  expect(event?.y).toBe(top + 12);
  expect(event?.values).toStrictEqual([
    { id: 'pc1', label: 'PC1', value: 0.3, color: '#e69f00' },
  ]);
  expect(rule()).toBe(
    `M${String(event?.x)} ${String(top)}V${String(top + plot().height)}`,
  );
});

test('the lightest peak is the one at the left edge', () => {
  mount();
  const { left, top } = plot();
  send('mousemove', left, top);

  expect(tracked.map((event) => event?.label)).toStrictEqual(['206.1176 m/z']);
});

test('leaving clears the rule and says nothing is tracked', () => {
  mount();
  const { left, top } = plot();
  send('mousemove', left, top);
  send('mouseout');

  expect(tracked.at(-1)).toBeNull();
  expect(rule()).toBeNull();
});

test('a chart told what is tracked keeps the rule where it was told', () => {
  mount(1);
  const before = rule();
  const { left, width, top } = plot();
  send('mousemove', left + width, top);
  send('mouseout');

  expect(tracked.map((event) => event?.index ?? null)).toStrictEqual([3, null]);
  expect(rule()).toBe(before);
  expect(before).toMatch(/^M[\d.]+ [\d.]+V[\d.]+$/);
});
