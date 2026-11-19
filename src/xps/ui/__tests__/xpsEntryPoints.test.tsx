// @vitest-environment jsdom
/**
 * The ways in a guide's buttons reuse through the viewer's handle: its own file
 * picker, and its own paste, both read by the reader a drop goes through.
 *
 * The files are the core tests' fixtures; the clipboard is stubbed with what a
 * browser hands a page that is allowed to read it.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  iconsLoaded,
  stubViewerLayout,
} from '../../../mass/ui/__tests__/massViewerStubs.ts';
import type { XpsEditorHandle } from '../../core/xpsEditorApi.ts';
import { XpsEditor } from '../XpsEditor.tsx';

let host: HTMLDivElement;
let root: Root;
let handle: ReturnType<typeof createRef<XpsEditorHandle>>;

beforeEach(async () => {
  stubViewerLayout();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  handle = createRef<XpsEditorHandle>();
  await act(async () => {
    root.render(<XpsEditor ref={handle} storageKey={null} />);
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

function viewer(): XpsEditorHandle {
  if (handle.current === null) throw new Error('the viewer has no handle');
  return handle.current;
}

function picker(): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>(
    'input[data-testid="xps-editor-file"]',
  );
  if (input === null) throw new Error('no file picker');
  return input;
}

/**
 * Wait for the reader, which reads a file or a paste asynchronously, until it
 * has done what is expected: a busy machine outlasts any fixed wait.
 * @param check - The expectation, retried until it holds.
 */
async function settled(check: () => void): Promise<void> {
  // The reader finishes after the event, as in a page, so React commits on its
  // own while the expectation is retried.
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
  await vi.waitFor(check, { timeout: 10_000 });
}

function spectrumNames(): string[] {
  return viewer()
    .getState()
    .data.spectra.map((spectrum) => spectrum.name);
}

test("openFiles opens the viewer's own picker, which offers the formats it reads", () => {
  const click = vi
    .spyOn(HTMLInputElement.prototype, 'click')
    .mockImplementation(() => undefined);

  viewer().openFiles();

  expect(click).toHaveBeenCalledOnce();
  expect(click.mock.contexts[0]).toBe(picker());
  expect(picker().type).toBe('file');
  expect(picker().multiple).toBe(true);
  expect(picker().accept).toBe(
    '.vms,.vamas,.npl,.jdx,.dx,.jcamp,.txt,.csv,.tsv,.xy',
  );
});

test('a file chosen in the picker is read as a drop is', async () => {
  const bytes = readFileSync(
    join(import.meta.dirname, '../../core/__tests__/data/pegCASA.vms'),
  );
  const input = picker();
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: [new File([bytes], 'pegCASA.vms')],
  });
  act(() => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await settled(() => {
    expect(viewer().getState().data.spectra).toHaveLength(4);
  });

  expect(viewer().getState().data.spectra).toHaveLength(4);
  expect(input.value).toBe('');
});

test('paste reads the clipboard as a paste into the viewer is read', async () => {
  vi.stubGlobal('navigator', {
    clipboard: {
      readText: () => Promise.resolve('282.16 178\n282.21 180\n282.26 190\n'),
    },
  });

  await act(() => viewer().paste());
  await settled(() => {
    expect(spectrumNames()).toStrictEqual(['Pasted spectrum']);
  });

  expect(spectrumNames()).toStrictEqual(['Pasted spectrum']);
});

test('paste says in the status bar what the clipboard does not hold', async () => {
  vi.stubGlobal('navigator', {
    clipboard: { readText: () => Promise.resolve('ethanol') },
  });

  await act(() => viewer().paste());
  await settled(() => {
    expect(viewer().getState().view.error).toMatch(/not a spectrum/);
  });

  expect(spectrumNames()).toStrictEqual([]);
  expect(viewer().getState().view.error).toMatch(/not a spectrum/);
});

test('paste rejects when the browser refuses the clipboard', async () => {
  vi.stubGlobal('navigator', {
    clipboard: {
      readText: () =>
        Promise.reject(new DOMException('Read permission denied.')),
    },
  });

  await expect(viewer().paste()).rejects.toThrow('Read permission denied.');

  vi.stubGlobal('navigator', {});

  await expect(viewer().paste()).rejects.toThrow(
    'This browser lets no page read the clipboard.',
  );
});
