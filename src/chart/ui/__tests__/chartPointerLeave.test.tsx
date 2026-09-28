// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { PlotRect } from '../../core/chartGeometry.ts';
import type { ScreenMatrix } from '../../core/svgPoint.ts';
import { useChartPointer } from '../useChartPointer.ts';

const plot: PlotRect = {
  left: 0,
  top: 0,
  width: 200,
  height: 200,
  right: 200,
  bottom: 200,
};

/** What each writer said, in the order it said it. */
const said: string[] = [];

const roots: Array<ReturnType<typeof createRoot>> = [];

beforeEach(() => {
  (
    SVGSVGElement.prototype as unknown as { getScreenCTM: () => ScreenMatrix }
  ).getScreenCTM = () => IDENTITY;
});

afterEach(() => {
  said.length = 0;
  for (const root of roots) act(() => root.unmount());
  roots.length = 0;
});

test('the chart says the pointer is gone before whatever it moved onto speaks', () => {
  const { svg, row } = mount();

  svg.dispatchEvent(pointerEvent('pointermove', 100, 100));

  expect(said).toStrictEqual(['chart reads 100']);

  // The sequence a browser fires when the pointer moves off the SVG onto an
  // element laid over it: React synthesises the row's `pointerenter` from the
  // `pointerout`, so a chart listening for `pointerleave` would speak last and
  // wipe what the row had just said.
  act(() => {
    svg.dispatchEvent(boundaryEvent('pointerout', row));
    svg.dispatchEvent(boundaryEvent('pointerleave', row, false));
    row.dispatchEvent(boundaryEvent('pointerover', svg));
  });

  expect(said).toStrictEqual([
    'chart reads 100',
    'chart reads nothing',
    'row entered',
  ]);
});

test('the pointer moving onto a mark inside the chart has not left it', () => {
  const { svg, trace } = mount();

  svg.dispatchEvent(pointerEvent('pointermove', 100, 100));

  // `pointerout` fires on the way *into* a child too, and there the reading
  // must stand — the pointer is over the trace, which is the chart itself.
  act(() => {
    svg.dispatchEvent(boundaryEvent('pointerout', trace));
  });

  expect(said).toStrictEqual(['chart reads 100']);
});

test('the pointer leaving the window altogether is still the pointer leaving', () => {
  const { svg } = mount();

  svg.dispatchEvent(pointerEvent('pointermove', 100, 100));

  act(() => {
    svg.dispatchEvent(boundaryEvent('pointerout', null));
  });

  expect(said).toStrictEqual(['chart reads 100', 'chart reads nothing']);
});

/** The chart, the control laid over it, and a mark inside it. */
interface Mounted {
  /** The chart the hook is following the pointer on. */
  svg: SVGSVGElement;
  /** A row of a legend, outside the SVG and over it. */
  row: HTMLDivElement;
  /** A mark inside the SVG, which the pointer moves onto without leaving. */
  trace: SVGRectElement;
}

/**
 * A chart with a control laid over it, both wired to the same record.
 * @returns The elements the events are dispatched on.
 */
function mount(): Mounted {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  act(() => root.render(<Probe />));

  return {
    svg: host.querySelector('svg') as SVGSVGElement,
    row: host.querySelector('#row') as HTMLDivElement,
    trace: host.querySelector('#trace') as SVGRectElement,
  };
}

/**
 * A chart and one row of a legend over it, both writing to `said`.
 * @returns The probe.
 */
function Probe(): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useChartPointer<number>({
    svgRef,
    plot,
    read: (point) => point.x,
    sameReadout: (current, next) => current === next,
    onReadout: (readout) =>
      said.push(
        readout === null ? 'chart reads nothing' : `chart reads ${readout}`,
      ),
  });

  return (
    <div>
      <svg ref={svgRef} width={200} height={200}>
        <rect id="trace" width={10} height={10} />
      </svg>
      <div id="row" onPointerEnter={() => said.push('row entered')} />
    </div>
  );
}

/**
 * One pointer move, as jsdom gives no matrix and no pointer of its own.
 * @param type - Which event it is.
 * @param x - Where it lands, in the SVG's user units.
 * @param y - Likewise.
 * @returns The event, ready to dispatch.
 */
function pointerEvent(type: string, x: number, y: number): Event {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
}

/**
 * One crossing of a boundary, which is a move that names what it moved to.
 * @param type - Which event it is.
 * @param related - What the pointer moved to, `null` when it left the window.
 * @param bubbles - Whether it bubbles, as `pointerleave` does not.
 * @returns The event, ready to dispatch.
 */
function boundaryEvent(
  type: string,
  related: Element | null,
  bubbles = true,
): Event {
  const event = new MouseEvent(type, { bubbles, relatedTarget: related });
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
