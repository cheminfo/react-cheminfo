// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act, useCallback, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { PlotRect } from '../../core/chartGeometry.ts';
import type { ChartPoint, ScreenMatrix } from '../../core/svgPoint.ts';
import { useChartPointer } from '../useChartPointer.ts';

const plot: PlotRect = {
  left: 0,
  top: 0,
  width: 200,
  height: 200,
  right: 200,
  bottom: 200,
};

/** What `onReadout` was told, in order. */
const reported: Array<number | null> = [];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  (
    SVGSVGElement.prototype as unknown as { getScreenCTM: () => ScreenMatrix }
  ).getScreenCTM = () => IDENTITY;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  reported.length = 0;
  vi.unstubAllGlobals();
});

test('a zoom made without moving the pointer is read under it at once', () => {
  act(() => root.render(<Probe scale={1} />));
  const svg = host.querySelector('svg') as SVGSVGElement;

  act(() => {
    svg.dispatchEvent(pointerMove(100, 50));
  });

  expect(readout()).toBe('100');

  // The wheel, a key or the end of a drag: the scales change and the hand
  // stays where it was.
  act(() => root.render(<Probe scale={3} />));

  expect(readout()).toBe('300');
  // What the chart reports is still told only on a move.
  expect(reported).toStrictEqual([100]);
});

test('a pointer off the plot stays off it whatever the scales do', () => {
  act(() => root.render(<Probe scale={1} />));
  act(() => root.render(<Probe scale={2} />));

  expect(readout()).toBe('away');
});

/**
 * What the probe last rendered as its readout.
 * @returns The text it wrote.
 */
function readout(): string {
  return host.querySelector('output')?.textContent ?? '';
}

/**
 * A chart whose reading is the pointer's x times a scale, which stands in for
 * the zoom: a new scale is a new window over the same place on the plot.
 * @param props - Component props.
 * @param props.scale - What one user unit reads as.
 * @returns The probe.
 */
function Probe(props: { scale: number }): ReactElement {
  const { scale } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const read = useCallback((point: ChartPoint) => point.x * scale, [scale]);

  const pointer = useChartPointer<number>({
    svgRef,
    plot,
    read,
    sameReadout: (current, next) => current === next,
    onReadout: (value) => reported.push(value),
  });

  return (
    <div>
      <svg ref={svgRef} width={200} height={200} />
      <output>
        {pointer.readout === null ? 'away' : String(pointer.readout)}
      </output>
    </div>
  );
}

/**
 * One pointer move, as jsdom gives no matrix and no pointer of its own.
 * @param x - Where it lands, in the SVG's user units.
 * @param y - Likewise.
 * @returns The event, ready to dispatch.
 */
function pointerMove(x: number, y: number): Event {
  const event = new MouseEvent('pointermove', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
}

/** One user unit to one screen pixel, so a client point is a user unit. */
const IDENTITY: ScreenMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
  inverse: () => IDENTITY,
};
