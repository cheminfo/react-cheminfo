// @vitest-environment jsdom
/**
 * A click on the label of a peak, as a host that only takes the labelled m/z
 * sees it. The chart is drawn at 600 × 400.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import type { MassSpectrum } from '../../core/massSpectrum.ts';
import { MassChart } from '../MassChart.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  installProbeStubs();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

test('a click on a label reports its peak, and is no click on the plot', () => {
  const onPeakLabelClick = vi.fn();
  const onPlotClick = vi.fn();
  act(() =>
    root.render(
      <MassChart
        spectra={[spectrum]}
        width={600}
        height={400}
        onPeakLabelClick={onPeakLabelClick}
        onPlotClick={onPlotClick}
      />,
    ),
  );

  const stacks = host.querySelectorAll('rect[fill="transparent"]');

  expect(stacks).toHaveLength(2);

  const stack = stacks[1] as SVGRectElement;

  expect(stack.style.cursor).toBe('pointer');

  for (const type of ['pointerdown', 'pointerup', 'click'] as const) {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: Number(stack.getAttribute('x')) + 2,
      clientY: Number(stack.getAttribute('y')) + 2,
      button: 0,
    }) as MouseEvent & { pointerId: number };
    event.pointerId = 1;
    act(() => {
      stack.dispatchEvent(event);
    });
  }

  expect(onPeakLabelClick).toHaveBeenCalledOnce();
  expect(onPeakLabelClick.mock.calls[0]?.[0]).toMatchObject({
    key: 'a:1',
    mz: 300.5,
    intensity: 60,
  });
  expect(onPlotClick).not.toHaveBeenCalled();
});

test('without a host asking, the labels answer no click', () => {
  act(() =>
    root.render(<MassChart spectra={[spectrum]} width={600} height={400} />),
  );

  expect(host.querySelectorAll('rect[fill="transparent"]')).toHaveLength(0);
});

const spectrum: MassSpectrum = {
  id: 'a',
  name: 'a',
  color: '#000000',
  profile: null,
  centroid: {
    x: Float64Array.from([200.25, 300.5]),
    y: Float64Array.from([100, 60]),
    charge: new Int16Array(2),
  },
  meta: null,
  origin: { format: 'text' },
  showProfile: false,
  showCentroid: true,
};

/** jsdom lays nothing out, so nothing is ever resized. */
class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
