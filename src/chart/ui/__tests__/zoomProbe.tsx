/**
 * The probe every gesture test drives, and the two browser behaviours jsdom
 * lacks.
 *
 * A chart of nothing but an SVG, so that a drag, a wheel turn and a click are
 * the real DOM events reaching the real handlers rather than a hook called by
 * hand. It is shared because the gestures split across two files — what a drag
 * does to the window, and what a release reports back — and a second copy of a
 * harness this exact is a second copy that drifts.
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { plotRect } from '../../core/chartGeometry.ts';
import type { ChartPoint, ScreenMatrix } from '../../core/svgPoint.ts';
import type { ChartZoom } from '../useChartZoom.ts';

import type { ProbeProps } from './probeChart.tsx';
import { ProbeChart } from './probeChart.tsx';

/** The plot every probe is laid out in: 524 user units wide from x 60, 356 tall from y 10. */
export const plot = plotRect({ width: 600, height: 400 });

/** What a test hands `mount`: the probe's props bar the two the harness supplies. */
export type MountProps = Omit<ProbeProps, 'plot' | 'onZoom'>;

/**
 * Remember what the hook returned, for the live binding a test reads.
 * @param value - What the hook returned on this commit.
 */
function setZoom(value: ChartZoom): void {
  zoom = value;
}

/**
 * What the last commit of the probe was showing.
 *
 * A live binding rather than a getter, so a test reads `zoom?.domain` here
 * exactly as it would with the probe declared beside it — an ES export follows
 * the reassignment the layout effect makes, and a test that had to call
 * through a function would read differently in the two files that share this.
 */
export let zoom: ChartZoom | null = null;

const roots: Array<ReturnType<typeof createRoot>> = [];

/**
 * Stand in for the two things jsdom does not implement.
 *
 * Called from each test file's own `beforeEach` rather than registered here, so
 * a reader of either file can see what its gestures rest on without opening
 * this one.
 */
export function installProbeStubs(): void {
  // A drag captures the pointer, which jsdom does not implement; the gesture is
  // otherwise the real one, and this is the whole of what has to be stood in for.
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.hasPointerCapture = () => false;
  // How the SVG's user units lie over the screen, which is what turns a client
  // point into a user unit. `svgPointAt` does that arithmetic itself rather than
  // through a `DOMPoint` — which is exactly what lets an identity matrix stand in
  // here — so one to one at the origin makes the two the same number.
  (
    SVGSVGElement.prototype as unknown as { getScreenCTM: () => ScreenMatrix }
  ).getScreenCTM = () => IDENTITY;
}

/** A matrix that changes nothing, so a client point is a user unit. */
const IDENTITY: ScreenMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
  inverse: () => IDENTITY,
};

/**
 * Unmount every probe the test mounted and forget what it was showing.
 */
export function resetProbes(): void {
  zoom = null;
  for (const root of roots) act(() => root.unmount());
  roots.length = 0;
}

/**
 * Mount the hook and hand back a way to drag across it.
 * @param props - What the chart holds.
 * @returns How to drag.
 */
export function mount(props: MountProps) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() =>
    root.render(<ProbeChart {...props} plot={plot} onZoom={setZoom} />),
  );

  return {
    /**
     * Hand the chart other props, as a host re-rendering it does.
     * @param next - What it holds now.
     */
    rerender: (next: MountProps) => {
      act(() =>
        root.render(<ProbeChart {...next} plot={plot} onZoom={setZoom} />),
      );
    },
    /**
     * Drag from one point of the plot to another and let go.
     * @param from - Where the press lands, in user units.
     * @param to - Where it is released.
     */
    drag: (from: ChartPoint, to: ChartPoint) => {
      const svg = container.querySelector('svg') as SVGSVGElement;
      act(() => {
        svg.dispatchEvent(
          pointerEvent('pointerdown', from.x, from.y, { button: 0 }),
        );
      });
      act(() => {
        svg.dispatchEvent(pointerEvent('pointermove', to.x, to.y));
      });
      act(() => {
        svg.dispatchEvent(pointerEvent('pointerup', to.x, to.y));
      });
    },
    /**
     * Press on the plot and keep the button down, so the drag being made can be
     * read off `selection` while the hand is still moving — which is the only
     * way to test what the preview rectangle promises.
     * @param from - Where the press lands, in user units.
     */
    press: (from: ChartPoint) => {
      const svg = container.querySelector('svg') as SVGSVGElement;
      act(() => {
        svg.dispatchEvent(
          pointerEvent('pointerdown', from.x, from.y, { button: 0 }),
        );
      });
    },
    /**
     * Move the pointer with the button still down.
     * @param to - Where it has got to, in user units.
     */
    move: (to: ChartPoint) => {
      const svg = container.querySelector('svg') as SVGSVGElement;
      act(() => {
        svg.dispatchEvent(pointerEvent('pointermove', to.x, to.y));
      });
    },
    /**
     * Press a key on the chart, which first takes the caret as a click on it
     * would.
     * @param key - The `event.key` to send.
     * @param modifiers - Any modifier held with it.
     * @param modifiers.ctrlKey - Whether control was held.
     * @param modifiers.altKey - Whether alt was held.
     * @returns Whether the chart took the key, which is how a chart that answers
     * it is told apart from one that leaves it to the page.
     */
    pressKey: (
      key: string,
      modifiers: { ctrlKey?: boolean; altKey?: boolean } = {},
    ): boolean => {
      const svg = container.querySelector('svg') as SVGSVGElement;
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...modifiers,
      });
      act(() => {
        svg.dispatchEvent(event);
      });
      return event.defaultPrevented;
    },
    /**
     * Turn the wheel over the chart.
     * @param deltaY - How far it travelled, positive away from the reader.
     * @returns Whether the chart refused the page its scroll, which is how a
     * chart that answers the wheel is told apart from one that leaves it alone.
     */
    wheel: (deltaY: number): boolean => {
      const svg = container.querySelector('svg') as SVGSVGElement;
      const event = new WheelEvent('wheel', {
        deltaY,
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        svg.dispatchEvent(event);
      });
      return event.defaultPrevented;
    },
  };
}

/**
 * One pointer event at a place on the page.
 * @param type - Which event.
 * @param x - Where it is, in client coordinates.
 * @param y - Where it is vertically.
 * @param extra - Anything else the handler reads: which button was pressed.
 * @param extra.button - Which button it was, the left one when left unsaid.
 * @returns The event, ready to dispatch.
 */
function pointerEvent(
  type: string,
  x: number,
  y: number,
  extra: { button?: number } = {},
): Event {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: extra.button ?? 0,
  }) as MouseEvent & { pointerId: number };
  event.pointerId = 1;
  return event;
}
