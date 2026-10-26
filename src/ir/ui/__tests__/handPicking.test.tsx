// @vitest-environment jsdom
/**
 * Picking bands by hand, through the real DOM events on the chart's own SVG:
 * the tool is chosen, a click on the chart takes the band it lands on away or
 * adds the one under it, a row's cross takes its band away, and the host hears
 * of each through `onChange` rather than as a click.
 *
 * The chart is laid out at 600 × 400 and framed on 3000 to 1000 cm⁻¹, so the
 * plot is 524 user units wide from x 60 and 1720 cm⁻¹ is at x 395.36; a band's
 * hit radius of 8 units is then 30.5 cm⁻¹.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import type { IrEditorHandle, IrPlotClick } from '../../core/irEditorApi.ts';
import type { IrSpectrum } from '../../core/irSpectrum.ts';
import { loadIrSpectra } from '../../core/loadIrSpectra.ts';
import { toIrSpectrum } from '../../core/toIrSpectrum.ts';
import { IrEditor } from '../IrEditor.tsx';

let host: HTMLDivElement;
let root: Root;
const clicks: IrPlotClick[] = [];
const reported: IrSpectrum[][] = [];

beforeEach(() => {
  installProbeStubs();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 400),
  );
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  clicks.length = 0;
  reported.length = 0;
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
 * Open the film in a viewer framed on 3000 to 1000 cm⁻¹.
 * @returns Nothing; the viewer is in `host`.
 */
async function openFilm(): Promise<void> {
  const handle = createRef<IrEditorHandle>();
  const spectrum = await film();
  act(() =>
    root.render(
      <IrEditor
        ref={handle}
        data={[spectrum]}
        onChange={(spectra) => reported.push(spectra)}
        onPlotClick={(event) => clicks.push(event)}
      />,
    ),
  );
  act(() => handle.current?.setDomain({ x: [1000, 3000], y: [0, 100] }));
}

/**
 * Press a button, found by its accessible name.
 * @param label - Its `aria-label`.
 */
function press(label: string): void {
  const button = host.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(label)}"]`,
  );
  if (button === null) throw new Error(`No button is called ${label}`);
  act(() => button.click());
}

/**
 * Press on the chart at a wavenumber and let go where it was pressed.
 * @param wavenumber - Where, in cm⁻¹, on the 3000 to 1000 frame.
 */
function clickAt(wavenumber: number): void {
  const chart = host.querySelector('svg[viewBox="0 0 600 400"]');
  if (chart === null) throw new Error('No chart is drawn');
  const x = 60 + ((3000 - wavenumber) / 2000) * 524;
  for (const type of ['pointerdown', 'pointermove', 'pointerup']) {
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: x,
      clientY: 188,
      button: 0,
    }) as MouseEvent & { pointerId: number };
    event.pointerId = 1;
    act(() => {
      chart.dispatchEvent(event);
    });
  }
}

/**
 * Where the film's bands sit, as the viewer last reported them.
 * @returns The wavenumbers, and whether they were picked by hand.
 */
function lastReport(): { bands: number[] | undefined; byHand: unknown } {
  const spectrum = reported.at(-1)?.[0];
  return {
    bands: spectrum?.bands?.map((band) => band.wavenumber),
    byHand: spectrum?.bandsByHand,
  };
}

test('while picking by hand, a click on a band takes it away and a click beside it adds it back', async () => {
  await openFilm();
  press('Pick bands by hand (k)');

  clickAt(1720);

  expect(lastReport()).toStrictEqual({
    bands: [1048, 1600, 2948, 3328],
    byHand: true,
  });

  clickAt(1720);

  expect(lastReport()).toStrictEqual({
    bands: [1048, 1600, 1708, 2948, 3328],
    byHand: true,
  });
  expect(clicks).toStrictEqual([]);
});

test("a row's cross takes its band away, and the bands can be found automatically again", async () => {
  await openFilm();

  press('Take away the band at 1048 cm⁻¹');

  expect(lastReport()).toStrictEqual({
    bands: [1600, 1708, 2948, 3328],
    byHand: true,
  });

  press('Find the bands automatically again');

  expect(lastReport()).toStrictEqual({
    bands: [1048, 1600, 1708, 2948, 3328],
    byHand: false,
  });
});

test('back on the read tool, a click is the host’s again', async () => {
  await openFilm();
  press('Pick bands by hand (k)');
  press('Pick bands by hand (k)');

  clickAt(1720);

  expect(clicks).toStrictEqual([
    { wavenumber: expect.closeTo(1720, 9), spectrumId: 'film' },
  ]);
  expect(reported).toStrictEqual([]);
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
