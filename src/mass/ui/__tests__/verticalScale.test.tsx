// @vitest-environment jsdom
/**
 * Two spectra on one axis, one of them drawn at half its height. The chart is
 * drawn at 600 × 400.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import {
  chartPixel,
  chartRoundPixel,
  chartScale,
} from '../../../chart/core/chartScale.ts';
import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import { formatIntensity } from '../../core/massFormat.ts';
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

test('a scaled spectrum is drawn at its scaled height on the shared axis', () => {
  render();
  const plot = plotRect({ width: 600, height: 400 });
  // The base peak of the measured spectrum, 100, sets the axis to 120.
  const yScale = chartScale(0, 120, plot.bottom, plot.top);

  expect(stickTop('#0000ff')).toBe(chartRoundPixel(chartPixel(yScale, 40)));
  expect(stickTop('#ff0000')).toBe(chartRoundPixel(chartPixel(yScale, 100)));
});

test('its labels still write the measured intensity', () => {
  render();
  const text = host.querySelector('svg')?.textContent ?? '';

  expect(text).toContain('300.5000');
  expect(text).toContain(`300.5000${formatIntensity(80, 4)}`);
  expect(text).not.toContain(formatIntensity(40, 4));
});

function render() {
  act(() =>
    root.render(
      <MassChart
        spectra={[measured, scaled]}
        labelledId="scaled"
        mzDecimals={4}
        width={600}
        height={400}
      />,
    ),
  );
}

/**
 * Where the stick of a spectrum ends, read off its path.
 * @param color - The colour the spectrum is drawn in.
 * @returns The pixel its single stick reaches up to.
 */
function stickTop(color: string): number {
  const d = host
    .querySelector(`path[stroke="${CSS.escape(color)}"]`)
    ?.getAttribute('d');
  return Number(d?.split('V', 2)[1]);
}

const measured: MassSpectrum = {
  id: 'measured',
  name: 'measured',
  color: '#ff0000',
  profile: null,
  centroid: {
    x: Float64Array.from([200.25]),
    y: Float64Array.from([100]),
    charge: new Int16Array(1),
  },
  meta: null,
  origin: { format: 'text' },
  showProfile: false,
  showCentroid: true,
};

const scaled: MassSpectrum = {
  ...measured,
  id: 'scaled',
  name: 'scaled',
  color: '#0000ff',
  centroid: {
    x: Float64Array.from([300.5]),
    y: Float64Array.from([80]),
    charge: new Int16Array(1),
  },
  verticalScale: 0.5,
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
