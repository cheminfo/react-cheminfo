// @vitest-environment jsdom
/**
 * Turning a cloud with the pointer, and the taps a turn lets through.
 *
 * The rectangle hearing the pointer sits at (10, 20) on the page, and the
 * frame clock is the test's own, so a turn is seen to wait for the next frame
 * and the moves of one frame to be added into one turn.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { FrameClock } from '../../../scatter/ui/__tests__/frameClock.ts';
import { installFrameClock } from '../../../scatter/ui/__tests__/frameClock.ts';
import type { OrbitCamera } from '../../core/orbitCamera.ts';
import type { OrbitDrag, OrbitDragOptions } from '../useOrbitDrag.ts';
import { useOrbitDrag } from '../useOrbitDrag.ts';

const CAMERA: OrbitCamera = { yaw: 0.6, pitch: 0.5 };

let host: HTMLDivElement;
let root: Root;
const seen: OrbitDrag[] = [];
let clock: FrameClock;
const reports: unknown[][] = [];

type ProbeProps = Omit<OrbitDragOptions, 'onOrbit'>;

function Probe(props: ProbeProps) {
  const drag = useOrbitDrag({
    onOrbit: (turn) => {
      const camera = turn(CAMERA);
      reports.push(['turn', camera.yaw, camera.pitch]);
    },
    onTap: (x, y, mode) => reports.push(['tap', x, y, mode]),
    onMove: (x, y) => reports.push(['move', x, y]),
    onLeave: () => reports.push(['leave']),
    ...props,
  });
  seen.push(drag);
  return (
    <svg>
      <rect {...drag.surface} />
    </svg>
  );
}

function latest(): OrbitDrag {
  return seen.at(-1) as OrbitDrag;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  seen.length = 0;
  clock = installFrameClock();
  reports.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(props: ProbeProps = {}): void {
  act(() => root.render(<Probe {...props} />));
  surface().getBoundingClientRect = () =>
    ({ left: 10, top: 20, width: 400, height: 300 }) as DOMRect;
}

function surface(): SVGRectElement {
  return host.querySelector('rect') as SVGRectElement;
}

function pointer(
  kind: string,
  x: number,
  y: number,
  init: { type?: string; shiftKey?: boolean } = {},
): void {
  const { type = 'mouse', shiftKey = false } = init;
  const event = new MouseEvent(kind, {
    bubbles: true,
    clientX: x,
    clientY: y,
    shiftKey,
    relatedTarget: null,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'pointerType', { value: type });
  act(() => {
    surface().dispatchEvent(event);
  });
}

test('a drag turns the box by the distance moved, once a frame', () => {
  mount();
  pointer('pointerdown', 10, 20);

  expect(latest().turning).toBe(true);
  expect(surface().style.cursor).toBe('grabbing');

  pointer('pointermove', 30, 20);
  pointer('pointermove', 40, 30);

  expect(reports).toStrictEqual([]);

  clock.tick();
  pointer('pointerup', 40, 30);

  expect(reports).toHaveLength(1);
  expect(reports[0]?.[0]).toBe('turn');
  expect(reports[0]?.[1]).toBeCloseTo(0.9, 12);
  expect(reports[0]?.[2]).toBeCloseTo(0.6, 12);
  expect(latest().turning).toBe(false);
  expect(surface().style.cursor).toBe('grab');
});

test('a press that goes nowhere much is a tap where it was let go', () => {
  mount();
  pointer('pointerdown', 50, 60);
  pointer('pointermove', 52, 61);
  pointer('pointerup', 52, 61);
  clock.tick();

  expect(reports).toStrictEqual([['tap', 42, 41, 'replace']]);
});

test('Shift on a tap adds the sample to the selection', () => {
  mount();
  pointer('pointerdown', 50, 60);
  pointer('pointerup', 50, 60, { shiftKey: true });

  expect(reports).toStrictEqual([['tap', 40, 40, 'add']]);
});

test('a pointer moving with no press raises the card under it', () => {
  mount();
  pointer('pointermove', 50, 60);
  pointer('pointermove', 70, 80);
  clock.tick();

  expect(reports).toStrictEqual([['move', 60, 60]]);
});

test('leaving with no drag tells the card, and drops the move waiting for its frame', () => {
  mount();
  pointer('pointermove', 50, 60);
  pointer('pointerout', 50, 60);
  clock.tick();

  expect(reports).toStrictEqual([['leave']]);
});

test('a drag the browser takes away is no tap', () => {
  mount();
  pointer('pointerdown', 50, 60);
  pointer('pointercancel', 50, 60);

  expect(latest().turning).toBe(false);
  expect(reports).toStrictEqual([]);
});

test('with turning off, a drag turns nothing and a tap still gets through', () => {
  mount({ enabled: false });

  expect(surface().style.cursor).toBe('default');

  pointer('pointerdown', 50, 60);
  pointer('pointermove', 150, 160);

  expect(clock.booked()).toBe(0);

  pointer('pointerup', 150, 160);
  pointer('pointerdown', 50, 60);
  pointer('pointerup', 50, 60);

  expect(reports).toStrictEqual([['tap', 40, 40, 'replace']]);
});

test('a finger always turns the box, since turning is its one gesture', () => {
  mount();
  pointer('pointerdown', 50, 60, { type: 'touch' });

  expect(latest().turning).toBe(true);
  expect(surface().style.touchAction).toBe('none');
});
