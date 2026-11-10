// @vitest-environment jsdom
/**
 * The body of the export dialog: every notation of a structure, the picture of
 * it, and the ways each of them leaves the page.
 *
 * What a button saves or copies is read back off the file and the clipboard,
 * since a panel that showed one SMILES and saved another would look right in
 * any render. The browser's download, clipboard and image decoding are stood
 * in for; the structure is read and written by OpenChemLib itself.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { StructureExportPanelProps } from '../StructureExportPanel.tsx';
import { StructureExportPanel } from '../StructureExportPanel.tsx';

import type { SavedFile } from './savedFiles.ts';
import { settle, watchSavedFiles } from './savedFiles.ts';

let host: HTMLDivElement;
let root: Root;
let saved: () => SavedFile[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  saved = watchSavedFiles();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  Reflect.deleteProperty(navigator, 'clipboard');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function render(props: StructureExportPanelProps): void {
  act(() => root.render(<StructureExportPanel {...props} />));
}

function press(text: string): void {
  const button = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === text,
  );
  if (button === undefined) throw new Error(`no button reads ${text}`);
  act(() => {
    button.click();
  });
}

async function pressAndSettle(text: string): Promise<void> {
  press(text);
  await act(settle);
}

function notation(label: string): HTMLElement {
  const row = [...host.querySelectorAll('.structure-export__notation')].find(
    (candidate) =>
      candidate.querySelector('.copyable-value__label')?.textContent === label,
  );
  if (!(row instanceof HTMLElement)) throw new Error(`no ${label} row`);
  return row;
}

function valueOf(label: string): string {
  return (
    notation(label).querySelector('.copyable-value__value')?.firstChild
      ?.textContent ?? ''
  );
}

function pixels(): string {
  return host.querySelector('.structure-export__pixels')?.textContent ?? '';
}

function notice(): string | null {
  return host.querySelector('.structure-export__notice')?.textContent ?? null;
}

test('the notations a chemist reaches for come first, the identifiers folded away', () => {
  render({ smiles: 'OCC' });

  expect(valueOf('SMILES')).toBe('CCO');
  expect(valueOf('Molfile V2000')).toContain('V2000');
  expect(valueOf('Molfile V3000')).toContain('V3000');
  expect(host.textContent).not.toContain('eMHAIh@');

  press('Canonical identifiers');

  expect(valueOf('idCode')).toBe('eMHAIh@');
  expect(host.textContent).toContain('Hover a name for what it does.');
});

test('a molfile is saved under the structure’s name and its dialect', async () => {
  render({ smiles: 'CCO', name: 'ethanol' });

  const button = notation('Molfile V2000').querySelector('button');
  act(() => {
    button?.click();
  });

  expect(saved().map(({ name, type }) => [name, type])).toStrictEqual([
    ['ethanol-v2000.mol', 'chemical/x-mdl-molfile;charset=utf-8'],
  ]);
  await expect(saved()[0]?.text).resolves.toBe(valueOf('Molfile V2000'));
});

test('a notation the caller wrote is shown and saved as it is', async () => {
  const molfile = 'kept by the drawing program\n  M  END\n';
  render({ smiles: 'CCO', notations: { molfileV2000: molfile } });

  expect(valueOf('Molfile V2000')).toBe(molfile);

  act(() => {
    notation('Molfile V2000').querySelector('button')?.click();
  });

  expect(saved()[0]?.name).toBe('structure-v2000.mol');
  await expect(saved()[0]?.text).resolves.toBe(molfile);
});

test('the picture saved is the very SVG previewed', async () => {
  render({ smiles: 'CCO', name: 'ethanol' });

  await pressAndSettle('Save SVG');

  const preview = host.querySelector('img')?.getAttribute('src') ?? '';
  const prefix = 'data:image/svg+xml;charset=utf-8,';

  expect(preview.startsWith(prefix)).toBe(true);
  expect(saved().map(({ name, type }) => [name, type])).toStrictEqual([
    ['ethanol.svg', 'image/svg+xml;charset=utf-8'],
  ]);
  await expect(saved()[0]?.text).resolves.toBe(
    decodeURIComponent(preview.slice(prefix.length)),
  );
  expect(notice()).toBeNull();
});

test('the resolution is offered as a multiple, and its pixels are written under it', () => {
  render({ smiles: 'CCO' });

  expect(pixels()).toBe('361 × 160 pixels');

  press('4×');

  expect(pixels()).toBe('722 × 320 pixels');

  press('1×');

  expect(pixels()).toBe('180 × 80 pixels');
});

test('Copy SVG puts the markup on the clipboard, and says so', async () => {
  const writeText = vi.fn<(text: string) => Promise<void>>(
    async () => undefined,
  );
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render({ smiles: 'CCO' });

  await pressAndSettle('Copy SVG');

  expect(writeText).toHaveBeenCalledOnce();
  expect(writeText.mock.calls[0]?.[0]).toMatch(/^<svg[\s>]/);
  expect(notice()).toBe('Copied the SVG to the clipboard.');
});

test('a copy the browser refuses is said to have failed', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error('denied')) },
  });
  render({ smiles: 'CCO' });

  await pressAndSettle('Copy SVG');

  expect(notice()).toBe('Copy failed');
});

test('a picture the browser cannot paint is said rather than lost', async () => {
  // jsdom decodes no image and paints no canvas: the image is let load, and
  // the canvas answers as a browser without a 2D context does.
  vi.stubGlobal('Image', LoadingImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  render({ smiles: 'CCO' });

  await pressAndSettle('Save PNG');

  expect(saved()).toStrictEqual([]);
  expect(notice()).toBe('This browser cannot paint the figure into an image.');

  press('3×');

  expect(notice()).toBeNull();
});

test('an empty structure, or one with no atom, says nothing is drawn', () => {
  render({ smiles: '' });

  expect(host.textContent).toBe('Nothing is drawn yet.');

  render({ idCode: 'd@' });

  expect(host.textContent).toBe('Nothing is drawn yet.');
});

test('a structure OpenChemLib cannot read says why', () => {
  render({ smiles: 'C1CC' });

  expect(host.textContent).toBe('Dangling ring closure: 1');
});

/** An image that loads whatever it is given, as jsdom's never does. */
class LoadingImage extends EventTarget {
  public set src(_url: string) {
    queueMicrotask(() => this.dispatchEvent(new Event('load')));
  }
}
