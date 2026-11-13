// @vitest-environment jsdom
/**
 * Ctrl+C copying the page's figure: the SVG saying where it came from, and a
 * PNG painted from it — unless text is selected, or the page has nothing to
 * copy. The painting and the clipboard are stood in for.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { hideClipboardNotice } from '../../../clipboard/core/showClipboardNotice.ts';
import { rasterSvgMarkup } from '../../../molecule3d/core/exportImage.ts';
import type { PaintRecord } from '../../core/__tests__/paintStubs.ts';
import { stubPainting } from '../../core/__tests__/paintStubs.ts';
import type { PageFigureWriter } from '../../core/copyPageFigure.ts';
import { readClipboardFigure } from '../../core/figureClipboard.ts';
import { readFigureSource } from '../../core/figureSource.ts';
import { setPageFigureSource } from '../../core/pageFigureSource.ts';
import { SVG_NAMESPACE } from '../../core/svgNamespace.ts';
import { useFigureCopyShortcut } from '../useFigureCopyShortcut.ts';

const FIGURE = `<svg xmlns="${SVG_NAMESPACE}" width="80" height="40"><g/></svg>`;

let root: Root;
let section: HTMLElement;
let record: PaintRecord;
let clipboard: Array<Record<string, Promise<Blob>>>;
let stopSource: () => void;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  record = stubPainting();
  clipboard = [];
  class StandInClipboardItem {
    public readonly record: Record<string, Promise<Blob>>;

    public constructor(item: Record<string, Promise<Blob>>) {
      this.record = item;
    }
  }
  vi.stubGlobal('ClipboardItem', StandInClipboardItem);
  vi.stubGlobal('navigator', {
    clipboard: {
      write: async ([item]: StandInClipboardItem[]) => {
        if (item === undefined) return;
        await Promise.all(Object.values(item.record));
        clipboard.push(item.record);
      },
    },
  });
  stopSource = setPageFigureSource(() => ({
    site: 'tex',
    href: 'https://tex.cheminfo.org/?tex=x',
  }));
  section = document.createElement('section');
  document.body.append(section);
  root = createRoot(section);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  section.remove();
  stopSource();
  hideClipboardNotice();
  document.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('Ctrl+C copies the figure, saying where it came from, beside its PNG', async () => {
  mount(async () => FIGURE);

  await expect(pressCopy()).resolves.toBe(true);

  await settle();

  expect(clipboard).toHaveLength(1);
  expect(Object.keys(clipboard[0] ?? {})).toStrictEqual([
    'image/png',
    'text/html',
  ]);
  expect(record.calls.at(-1)?.canvas).toBe('160×80');

  const html = await clipboard[0]?.['text/html'];
  const figure = readClipboardFigure((await html?.text()) ?? '') ?? '';

  expect(readFigureSource(figure)).toStrictEqual({
    site: 'tex',
    href: 'https://tex.cheminfo.org/?tex=x',
  });
  expect(notice()).toStrictEqual({
    text: 'Figure copied: pasted into draw or write, it opens here again.',
    role: 'status',
  });
});

test('a figure that is a picture is painted at the pixels it holds', async () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  mount(async () => rasterSvgMarkup(png, { width: 300, height: 200 }));

  await pressCopy();
  await settle();

  expect(record.calls.at(-1)?.canvas).toBe('300×200');
});

test('text selected in a field is copied as text', async () => {
  mount(async () => FIGURE);
  const field = document.createElement('input');
  field.value = 'C6H12O6';
  section.append(field);
  field.focus();
  field.setSelectionRange(0, 3);

  await expect(pressCopy()).resolves.toBe(false);

  await settle();

  expect(clipboard).toStrictEqual([]);
  expect(notice()).toBeUndefined();
});

test('text selected on the page is copied as text', async () => {
  mount(async () => FIGURE);
  const paragraph = document.createElement('p');
  paragraph.textContent = 'A sentence to quote.';
  section.append(paragraph);
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  document.getSelection()?.addRange(range);

  await expect(pressCopy()).resolves.toBe(false);

  await settle();

  expect(clipboard).toStrictEqual([]);
});

test('a page with no figure to give leaves the key to the browser', async () => {
  mount(null);

  await expect(pressCopy()).resolves.toBe(false);
});

test('a page whose figure is not drawn yet copies nothing, and says nothing', async () => {
  mount(async () => undefined);

  await expect(pressCopy()).resolves.toBe(true);

  await settle();

  expect(clipboard).toStrictEqual([]);
  expect(notice()).toBeUndefined();
});

test('a figure that cannot be drawn says why', async () => {
  mount(() => Promise.reject(new Error('MathJax drew no picture.')));

  await pressCopy();
  await settle();

  expect(clipboard).toStrictEqual([]);
  expect(notice()).toStrictEqual({
    text: 'MathJax drew no picture.',
    role: 'alert',
  });
});

function mount(write: PageFigureWriter | null): void {
  act(() => {
    root.render(<Probe write={write} />);
  });
}

function Probe(props: { write: PageFigureWriter | null }): ReactElement {
  useFigureCopyShortcut(props.write);
  return <span />;
}

/**
 * Fire the copy the browser fires on Ctrl+C.
 * @returns Whether the page took the copy over.
 */
async function pressCopy(): Promise<boolean> {
  const event = new Event('copy', { bubbles: true, cancelable: true });
  (document.activeElement ?? document.body).dispatchEvent(event);
  return event.defaultPrevented;
}

async function settle(): Promise<void> {
  for (let turn = 0; turn < 20; turn++) {
    // eslint-disable-next-line no-await-in-loop -- each turn lets one more promise of the copy resolve
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}

function notice(): { text: string; role: string } | undefined {
  const element = document.querySelector('.clipboard-notice');
  if (element === null) return undefined;
  return {
    text: element.textContent,
    role: element.getAttribute('role') ?? '',
  };
}
