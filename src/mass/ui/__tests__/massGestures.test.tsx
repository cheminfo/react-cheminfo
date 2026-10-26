// @vitest-environment jsdom
/**
 * What the viewer does with files it is handed and with a click on its plot.
 *
 * The chart is laid out at 600 × 400, so the plot runs from x 60 to x 584: 524
 * user units for whatever window the test sets.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import { massFixture } from '../../core/__tests__/massFixtures.ts';
import type {
  MassEditorHandle,
  MassPlotClick,
} from '../../core/massEditorApi.ts';
import { MassEditor } from '../MassEditor.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  installProbeStubs();
  // The list scrolls its selected row into view, which jsdom does not lay out.
  Element.prototype.scrollIntoView = () => undefined;
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
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * A fixture as the browser would hand it over from a drop.
 * @param name - The fixture in the core tests' `data/`.
 * @returns The file.
 */
function fixtureFile(name: string): File {
  const bytes = readFileSync(
    join(import.meta.dirname, '../../core/__tests__/data', name),
  );
  return new File([bytes], name);
}

/**
 * The box the chart is drawn in, which is where files are dropped.
 * @returns The box.
 */
function chartBox(): HTMLElement {
  const chart = host.querySelector('svg[viewBox="0 0 600 400"]');
  const box = chart?.parentElement?.parentElement;
  if (box === null || box === undefined) throw new Error('No chart is drawn');
  return box;
}

/**
 * Press on the chart and let go where it was pressed.
 * @param x - Where, in user units across the SVG.
 */
function click(x: number): void {
  const chart = host.querySelector('svg[viewBox="0 0 600 400"]');
  if (chart === null) throw new Error('No chart is drawn');
  for (const type of ['pointerdown', 'pointerup'] as const) {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: x,
      clientY: 200,
      button: 0,
    }) as MouseEvent & { pointerId: number };
    event.pointerId = 1;
    act(() => {
      chart.dispatchEvent(event);
    });
  }
}

test('files read through the handle are added, and a refusal is said', async () => {
  const handle = createRef<MassEditorHandle>();
  act(() => root.render(<MassEditor ref={handle} />));

  const infrared = new File(
    [
      '##TITLE=film\n##DATA TYPE=INFRARED SPECTRUM\n##XUNITS=1/CM\n##PEAK TABLE=(XY..XY)\n1000,90 2000,80\n##END=',
    ],
    'film.jdx',
  );
  await act(() =>
    handle.current?.openFiles([fixtureFile('gcms-ntuples.jdx'), infrared]),
  );

  const spectra = handle.current?.getSpectra() ?? [];

  expect(spectra.map((spectrum) => spectrum.origin.scanIndex)).toStrictEqual([
    0, 1, 2,
  ]);
  expect(host.textContent).toContain('3 spectra drawn of 3');
  expect(host.textContent).toContain(
    'film.jdx was read as JCAMP-DX but holds no mass spectrum',
  );
});

test('a file dropped on the chart is drawn', async () => {
  const handle = createRef<MassEditorHandle>();
  act(() => root.render(<MassEditor ref={handle} />));

  const drop = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', {
    value: { files: [fixtureFile('aflatoxin-peaks.jdx')], types: ['Files'] },
  });
  act(() => {
    chartBox().dispatchEvent(drop);
  });
  // The read finishes on its own, after the event: React is let render it as it
  // would in a page, and the test waits for what it renders.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
  await vi.waitFor(() => {
    expect(handle.current?.getSpectra()).toHaveLength(1);
  });

  expect(host.textContent).toContain('Aflatoxin  (macfile.jdx)');
  expect(host.textContent).toContain('nominal mass');
});

test('a click reports the peak within reach, and nothing off one', async () => {
  const handle = createRef<MassEditorHandle>();
  const clicks: MassPlotClick[] = [];
  const spectra = await massFixture('aflatoxin-peaks.jdx');
  act(() =>
    root.render(
      <MassEditor
        ref={handle}
        data={spectra}
        onPlotClick={(event) => clicks.push(event)}
      />,
    ),
  );
  act(() => handle.current?.setDomain({ x: [40, 340], y: [0, 120] }));

  // m/z 330 lands at 60 + 290 / 300 × 524 = 566.5; its neighbour 331 is 1.75
  // pixels further on, and the click is answered by the nearer stick.
  click(566.5);
  // m/z 200 lands at 339.5, a long way from 215, the nearest peak.
  click(339.5);

  expect(clicks).toStrictEqual([
    {
      mz: expect.closeTo(329.98, 2),
      peakMz: 330,
      spectrumId: spectra[0]?.id,
    },
    {
      mz: expect.closeTo(200.02, 2),
      peakMz: null,
      spectrumId: spectra[0]?.id,
    },
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
