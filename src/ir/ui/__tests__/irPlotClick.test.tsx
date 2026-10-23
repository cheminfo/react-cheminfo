// @vitest-environment jsdom
/**
 * What the viewer tells its host about a click on the plot: where on the
 * wavenumber axis it landed, and which spectrum was selected — and that the
 * end of a zoom drag is not a click.
 *
 * The gestures are the real DOM events on the chart's own SVG, and the chart is
 * laid out at 600 × 400, so the plot is 524 user units wide from x 60: a
 * quarter of the way across is x 191, three quarters x 453.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ChartPoint } from '../../../chart/core/svgPoint.ts';
import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import { calciteSpectrum as calcite } from '../../core/__tests__/ramanFixture.ts';
import type { IrEditorHandle, IrPlotClick } from '../../core/irEditorApi.ts';
import type { IrSpectrum } from '../../core/irSpectrum.ts';
import { loadIrSpectra } from '../../core/loadIrSpectra.ts';
import { toIrSpectrum } from '../../core/toIrSpectrum.ts';
import { IrEditor } from '../IrEditor.tsx';
import { RamanEditor } from '../RamanEditor.tsx';

let host: HTMLDivElement;
let root: Root;
const clicks: IrPlotClick[] = [];

beforeEach(() => {
  installProbeStubs();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  // jsdom lays nothing out, so the box the chart measures is given a size.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 400),
  );
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  clicks.length = 0;
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * The five-band film, read through the real reader, under a known id.
 * @returns The spectrum.
 */
async function film(): Promise<IrSpectrum> {
  const { spectra } = await loadIrSpectra(
    readFileSync(
      join(import.meta.dirname, '../../core/__tests__/data/five-bands.jdx'),
    ),
    { fileName: 'five-bands.jdx' },
  );
  const [loaded] = spectra;
  if (loaded === undefined) throw new Error('The fixture holds no spectrum');
  return toIrSpectrum(loaded, { id: 'film' });
}

/**
 * Press on the chart, move, and let go.
 * @param from - Where the press lands, in user units.
 * @param to - Where it is let go.
 */
function gesture(from: ChartPoint, to: ChartPoint): void {
  const chart = host.querySelector('svg[viewBox="0 0 600 400"]');
  if (chart === null) throw new Error('No chart is drawn');
  for (const [type, point] of [
    ['pointerdown', from],
    ['pointermove', to],
    ['pointerup', to],
  ] as const) {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: point.x,
      clientY: point.y,
      button: 0,
    }) as MouseEvent & { pointerId: number };
    event.pointerId = 1;
    act(() => {
      chart.dispatchEvent(event);
    });
  }
}

/**
 * Press on the chart and let go where it was pressed.
 * @param at - Where, in user units.
 */
function click(at: ChartPoint): void {
  gesture(at, at);
}

test('a click reports the wavenumber under it and the spectrum selected', async () => {
  const handle = createRef<IrEditorHandle>();
  const spectrum = await film();
  act(() =>
    root.render(
      <IrEditor
        ref={handle}
        data={[spectrum]}
        onPlotClick={(event) => clicks.push(event)}
      />,
    ),
  );
  act(() => handle.current?.setDomain({ x: [1000, 3000], y: [0, 100] }));

  click({ x: 191, y: 188 });
  act(() => handle.current?.selectSpectrum(null));
  click({ x: 453, y: 188 });

  // The infrared axis runs high to low, so a quarter across is 2500.
  expect(clicks).toStrictEqual([
    { wavenumber: expect.closeTo(2500, 9), spectrumId: 'film' },
    { wavenumber: expect.closeTo(1500, 9), spectrumId: null },
  ]);
});

test('a drag zooms and is not reported as a click', async () => {
  const handle = createRef<IrEditorHandle>();
  const spectrum = await film();
  act(() =>
    root.render(
      <IrEditor
        ref={handle}
        data={[spectrum]}
        onPlotClick={(event) => clicks.push(event)}
      />,
    ),
  );
  act(() => handle.current?.setDomain({ x: [1000, 3000], y: [0, 100] }));

  gesture({ x: 191, y: 100 }, { x: 453, y: 300 });

  expect(clicks).toStrictEqual([]);

  // The drag framed 2500 to 1500, so the same quarter of the plot now reads
  // 2250 — the gesture was a zoom, and only the click after it is reported.
  click({ x: 191, y: 188 });

  expect(clicks).toStrictEqual([
    { wavenumber: expect.closeTo(2250, 9), spectrumId: 'film' },
  ]);
});

test('a Raman click reports the shift, read low to high', () => {
  const handle = createRef<IrEditorHandle>();
  act(() =>
    root.render(
      <RamanEditor
        ref={handle}
        data={[calcite()]}
        onPlotClick={(event) => clicks.push(event)}
      />,
    ),
  );
  act(() => handle.current?.setDomain({ x: [1000, 3000], y: [0, 6000] }));

  click({ x: 191, y: 188 });

  expect(clicks).toStrictEqual([
    { wavenumber: expect.closeTo(1500, 9), spectrumId: 'calcite' },
  ]);
});

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
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
