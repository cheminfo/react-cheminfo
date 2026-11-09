// @vitest-environment jsdom
/**
 * A viewer's state taken off its handle, written down, and opened in another
 * viewer: the spectra with their bands, the window and the way up they were
 * read come back as they were. And the host's own actions sit in the header.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import type { IrEditorHandle } from '../../core/irEditorApi.ts';
import {
  irViewerRecord,
  readIrViewerRecord,
} from '../../core/irViewerRecord.ts';
import { loadIrSpectra } from '../../core/loadIrSpectra.ts';
import { toIrSpectrum } from '../../core/toIrSpectrum.ts';
import { IrEditor } from '../IrEditor.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  installProbeStubs();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 400),
  );
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

test('a state taken off one viewer opens another as it was', async () => {
  const { spectra } = await loadIrSpectra(
    readFileSync(
      join(import.meta.dirname, '../../core/__tests__/data/five-bands.jdx'),
    ),
    { fileName: 'five-bands.jdx' },
  );
  const loaded = spectra[0] ?? never();
  const first = createRef<IrEditorHandle>();
  act(() =>
    root.render(
      <IrEditor
        ref={first}
        data={[toIrSpectrum(loaded, { id: 'film' })]}
        mode="absorbance"
      />,
    ),
  );
  act(() => first.current?.setDomain({ x: [1000, 3000], y: [0, 1] }));
  const kept = first.current?.getState() ?? never();
  // A copy, sharing nothing with the viewer it was taken from.
  const record: unknown = structuredClone(irViewerRecord(kept));

  const second = createRef<IrEditorHandle>();
  act(() => root.render(<IrEditor key="second" ref={second} />));

  expect(second.current?.getState().data.spectra).toHaveLength(0);

  act(() => second.current?.loadState(readIrViewerRecord(record)));

  const opened = second.current?.getState();

  expect(opened?.data.spectra.map(({ id }) => id)).toStrictEqual(['film']);
  expect(opened?.data.spectra[0]?.bands).toStrictEqual(
    kept.data.spectra[0]?.bands,
  );
  expect(opened?.view.selectedId).toBe('film');
  expect(opened?.view.domain).toStrictEqual({ x: [1000, 3000], y: [0, 1] });
  expect(opened?.settings.mode).toBe('absorbance');
});

test('the host’s actions are drawn in the header, after the mark', () => {
  act(() =>
    root.render(
      <IrEditor
        actions={
          <button type="button" aria-label="Save as">
            Save as
          </button>
        }
      />,
    ),
  );

  const header = host
    .querySelector('[aria-label="Save as"]')
    ?.closest('[role="toolbar"]');

  expect(header?.querySelectorAll('button')).toHaveLength(2);
});

function never(): never {
  throw new Error('Expected a value');
}

class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing to let go of.
  }
}
