// @vitest-environment jsdom
/**
 * A chart's wheel, caught only once the pointer has rested on it.
 *
 * The surface is a real element hearing real events, and the dwell runs on
 * the test's clock. It sits at (100, 50), 200 pixels wide and 100 tall, so a
 * wheel at (150, 75) is a quarter of the way across and a quarter down.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { WheelZoomOptions } from '../useWheelZoom.ts';
import { useWheelZoom } from '../useWheelZoom.ts';

let host: HTMLDivElement;
let root: Root;
const zooms: number[][] = [];

type ProbeProps = Omit<WheelZoomOptions, 'onZoom'> & { tag?: number };

function Probe(props: ProbeProps) {
  const { tag = 0, ...options } = props;
  const { ref, armed } = useWheelZoom<HTMLDivElement>({
    ...options,
    onZoom: (alongX, alongY, factor) =>
      zooms.push([tag, alongX, alongY, factor]),
  });
  return <div ref={ref} data-armed={String(armed)} />;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  zooms.length = 0;
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

function mount(props: ProbeProps = {}): void {
  act(() => root.render(<Probe {...props} />));
  surface().getBoundingClientRect = () =>
    ({ left: 100, top: 50, width: 200, height: 100 }) as DOMRect;
}

function surface(): HTMLDivElement {
  return host.firstElementChild as HTMLDivElement;
}

function armed(): string | undefined {
  return surface().dataset.armed;
}

function send(type: string): void {
  act(() => {
    surface().dispatchEvent(new MouseEvent(type));
  });
}

function wait(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

// Turn the wheel at (150, 75), and say whether the page was refused its scroll.
function wheel(deltaY: number, buttons = 0): boolean {
  const event = new WheelEvent('wheel', {
    deltaY,
    buttons,
    clientX: 150,
    clientY: 75,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    surface().dispatchEvent(event);
  });
  return event.defaultPrevented;
}

test('the wheel scrolls the page until the pointer has rested half a second', () => {
  mount();
  send('pointerenter');
  wait(499);

  expect(armed()).toBe('false');

  wait(1);

  expect(armed()).toBe('true');
});

test('once armed, the wheel zooms about the point under the pointer', () => {
  mount();
  send('pointerenter');
  wait(500);

  expect(wheel(100)).toBe(true);
  expect(wheel(-100)).toBe(true);
  expect(zooms).toHaveLength(2);
  expect(zooms[0]?.slice(0, 3)).toStrictEqual([0, 0.25, 0.25]);
  expect(zooms[0]?.[3]).toBeCloseTo(Math.exp(0.15), 12);
  expect(zooms[1]?.[3]).toBeCloseTo(Math.exp(-0.15), 12);
});

test('a reader scrolling past pushes the dwell out with every turn', () => {
  mount();
  send('pointerenter');
  wait(300);

  expect(wheel(40)).toBe(false);

  wait(300);

  expect(armed()).toBe('false');
  expect(zooms).toStrictEqual([]);

  wait(200);

  expect(armed()).toBe('true');
});

test('a pointer already resting when the chart appears starts the dwell on a move', () => {
  mount();
  send('pointermove');
  wait(300);
  send('pointermove');
  wait(200);

  expect(armed()).toBe('true');
});

test('leaving disarms the wheel at once', () => {
  mount();
  send('pointerenter');
  wait(500);
  send('pointerleave');

  expect(armed()).toBe('false');
  expect(wheel(100)).toBe(false);
  expect(zooms).toStrictEqual([]);
});

test('a wheel with a button down belongs to the drag, not to the zoom', () => {
  mount();
  send('pointerenter');
  wait(500);

  expect(wheel(100, 1)).toBe(false);
  expect(armed()).toBe('true');
  expect(zooms).toStrictEqual([]);
});

test('a chart that does not zoom never catches the wheel', () => {
  mount({ enabled: false });
  send('pointerenter');
  wait(1000);

  expect(armed()).toBe('false');
  expect(wheel(100)).toBe(false);
});

test('the dwell and the speed are the caller’s to set', () => {
  mount({ delay: 100, speed: 0.01 });
  send('pointerenter');
  wait(100);
  wheel(-50);

  expect(zooms[0]?.[3]).toBeCloseTo(Math.exp(-0.5), 12);
});

test('a handler written inline is read when the wheel turns, not when it was attached', () => {
  mount({ tag: 1 });
  send('pointerenter');
  wait(500);
  mount({ tag: 2 });
  wheel(100);

  expect(zooms.map((zoom) => zoom[0])).toStrictEqual([2]);
  expect(armed()).toBe('true');
});
