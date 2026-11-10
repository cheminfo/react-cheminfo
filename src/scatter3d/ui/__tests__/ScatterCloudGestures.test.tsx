// @vitest-environment jsdom
/**
 * A cloud worked by hand: turned by a drag, zoomed by a wheel that has
 * rested, and its dots tapped, double-clicked, pointed at and lassoed.
 *
 * Three samples, each its own group in its own ink, so the dot of a sample is
 * found on the page by its fill. The surface over the cloud sits at the page's
 * corner, so a dot's centre is where the pointer is aimed.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { ScatterCloud } from '../ScatterCloud.tsx';
import type { ScatterCloudProps } from '../scatterCloudProps.ts';

const CLOUD = {
  x: [0, 1, 0.2],
  y: [0, 0.4, 1],
  z: [0, 1, 0.5],
  width: 400,
  height: 300,
  xLabel: 'X',
  yLabel: 'Y',
  zLabel: 'Z',
  groupOf: [0, 1, 2],
  groups: [
    { id: 'a', label: 'A', color: '#111111' },
    { id: 'b', label: 'B', color: '#222222' },
    { id: 'c', label: 'C', color: '#333333' },
  ],
} as const satisfies ScatterCloudProps;

let host: HTMLDivElement;
let root: Root;
const reports: unknown[][] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // No frame clock: every move is worked at once, which is what the gesture
  // does where there is none.
  vi.stubGlobal('requestAnimationFrame', undefined);
  reports.length = 0;
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

function mount(props: Partial<ScatterCloudProps> = {}): void {
  act(() =>
    root.render(
      <ScatterCloud
        {...CLOUD}
        onCameraChange={(camera) => reports.push(['camera', camera])}
        onZoomChange={(zoom) => reports.push(['zoom', zoom])}
        onSelectionChange={(change) => reports.push(['select', change])}
        onHoverChange={(index) => reports.push(['hover', index])}
        onPointDoubleClick={(point) => reports.push(['open', point.index])}
        {...props}
      />,
    ),
  );
  surface().getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 400, height: 300 }) as DOMRect;
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

function send(type: string, x = 0, y = 0): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    relatedTarget: null,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  act(() => {
    surface().dispatchEvent(event);
  });
}

function tap(x: number, y: number): void {
  send('pointerdown', x, y);
  send('pointerup', x, y);
}

function kinds(kind: string): unknown[] {
  return reports
    .filter((report) => report[0] === kind)
    .map((report) => report[1]);
}

test('a tap on a dot selects that sample, and a tap on nothing clears it', () => {
  mount();
  const [x, y] = dot('#333333');
  tap(x, y);
  tap(2, 2);

  expect(kinds('select')).toStrictEqual([
    { indices: [2], mode: 'replace', source: 'point' },
    { indices: [], mode: 'replace', source: 'clear' },
  ]);
});

test('a drag turns the box, each frame from where the last one left it', () => {
  mount();
  const before = dot('#111111');
  send('pointerdown', 100, 100);
  send('pointermove', 150, 100);
  send('pointermove', 150, 120);
  send('pointerup', 150, 120);

  const cameras = kinds('camera') as Array<{ yaw: number; pitch: number }>;

  expect(cameras).toHaveLength(2);
  expect(cameras[0]?.yaw).toBeCloseTo(1.1, 12);
  expect(cameras[1]?.yaw).toBeCloseTo(1.1, 12);
  expect(cameras[1]?.pitch).toBeCloseTo(0.7, 12);
  expect(dot('#111111')).not.toStrictEqual(before);
  expect(kinds('select')).toStrictEqual([]);
});

test('a cloud whose camera is the caller’s reports the turn and waits to be told', () => {
  mount({ camera: { yaw: 0.6, pitch: 0.5 } });
  const before = dot('#111111');
  send('pointerdown', 100, 100);
  send('pointermove', 150, 100);
  send('pointerup', 150, 100);

  expect(kinds('camera')).toHaveLength(1);
  expect(dot('#111111')).toStrictEqual(before);
});

test('a wheel turned after a rest stands back from the box', () => {
  vi.useFakeTimers();
  mount();
  send('pointerenter');
  act(() => {
    vi.advanceTimersByTime(500);
  });
  act(() => {
    surface().dispatchEvent(
      new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }),
    );
  });

  const zooms = kinds('zoom') as number[];

  expect(zooms).toHaveLength(1);
  expect(zooms[0]).toBeCloseTo(1 / Math.exp(0.15), 12);
});

test('a double click on a dot opens that sample, and on nothing opens nothing', () => {
  mount();
  const [x, y] = dot('#222222');
  send('dblclick', x, y);
  send('dblclick', 2, 2);

  expect(kinds('open')).toStrictEqual([1]);
});

test('a cloud with nothing to open ignores a double click', () => {
  mount({ onPointDoubleClick: undefined });
  const [x, y] = dot('#222222');
  send('dblclick', x, y);

  expect(kinds('open')).toStrictEqual([]);
});

test('the pointer resting on a dot names its sample, and leaving names none', () => {
  mount();
  const [x, y] = dot('#111111');
  send('pointermove', x, y);
  send('pointerout', x, y);

  expect(kinds('hover')).toStrictEqual([0, -1]);
});

test('in select mode a drag is a lasso, and a ring round every dot takes them all', () => {
  mount({ gesture: 'select' });
  const corners = [
    [1, 1],
    [399, 1],
    [399, 299],
    [1, 299],
  ];
  send('pointerdown', 0, 0);
  for (const [x, y] of corners) send('pointermove', x, y);
  send('pointerup', 1, 299);

  expect(kinds('select')).toStrictEqual([
    { indices: [0, 1, 2], mode: 'replace', source: 'lasso' },
  ]);
  expect(kinds('camera')).toStrictEqual([]);
});
