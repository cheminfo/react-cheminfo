// @vitest-environment jsdom
/**
 * Spectra brought into the mass viewer from disk: chosen in its file picker,
 * or held over its chart before a drop.
 *
 * The files are the core tests' fixtures, read and peak picked by the real
 * readers; the picker is the viewer's own hidden input, given its files as a
 * browser would. jsdom has no `DataTransfer`, so a drag carries a plain
 * object with the types and the files a browser reports.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { MassEditorHandle } from '../../core/massEditorApi.ts';
import { MassEditor } from '../MassEditor.tsx';

import { iconsLoaded, stubViewerLayout } from './massViewerStubs.ts';

let host: HTMLDivElement;
let root: Root;
let handle: ReturnType<typeof createRef<MassEditorHandle>>;

beforeEach(async () => {
  stubViewerLayout();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  handle = createRef<MassEditorHandle>();
  await act(async () => {
    root.render(<MassEditor ref={handle} />);
    await iconsLoaded();
  });
});

afterEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixtureFile(name: string): File {
  const bytes = readFileSync(
    join(import.meta.dirname, '../../core/__tests__/data', name),
  );
  return new File([bytes], name);
}

function picker(): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>(
    'input[aria-label="Open spectra"]',
  );
  if (input === null) throw new Error('no file picker');
  return input;
}

function choose(files: File[]): void {
  const input = picker();
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  act(() => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function chartBox(): HTMLElement {
  const chart = host.querySelector('svg[viewBox="0 0 600 400"]');
  const box = chart?.parentElement?.parentElement;
  if (box === null || box === undefined) throw new Error('No chart is drawn');
  return box;
}

function drag(type: string, types: string[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: { types, files: [], dropEffect: 'none' },
  });
  act(() => {
    chartBox().dispatchEvent(event);
  });
  return event;
}

test('the files chosen in the picker are read and drawn, and the picker emptied', async () => {
  choose([
    fixtureFile('caffeine-peaks.txt'),
    fixtureFile('aflatoxin-peaks.jdx'),
  ]);
  // The files are read after the event, as in a page.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
  await vi.waitFor(() => {
    expect(handle.current?.getSpectra()).toHaveLength(2);
  });

  expect(handle.current?.getSpectra().map((one) => one.name)).toStrictEqual([
    'caffeine-peaks.txt',
    'Aflatoxin  (macfile.jdx)',
  ]);
  expect(picker().value).toBe('');
});

test('a picker closed without a choice changes nothing', () => {
  choose([]);

  expect(handle.current?.getSpectra()).toStrictEqual([]);
});

test('files held over the chart are let through and outlined, and leaving puts it back', () => {
  const idle = chartBox().getAttribute('style');
  const over = drag('dragover', ['Files']);

  expect(over.defaultPrevented).toBe(true);
  expect((over as DragEvent).dataTransfer?.dropEffect).toBe('copy');
  expect(chartBox().getAttribute('style')).not.toBe(idle);

  drag('dragover', ['Files']);
  drag('dragleave', ['Files']);

  expect(chartBox().getAttribute('style')).toBe(idle);
});

test('text held over the chart is not taken for a file', () => {
  const over = drag('dragover', ['text/plain']);

  expect(over.defaultPrevented).toBe(false);
});

test('a drop carrying no file reads nothing', () => {
  drag('drop', ['text/plain']);

  expect(handle.current?.getSpectra()).toStrictEqual([]);
});
