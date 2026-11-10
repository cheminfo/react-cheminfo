// @vitest-environment jsdom
/**
 * The three things the figure panel does — save, copy, send — wired to a
 * figure on the page or one its page writes. The painting, the browser's save,
 * the clipboard and the share sheet are stood in for.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { figureBox } from '../../core/__tests__/pageLayout.ts';
import type { PaintRecord } from '../../core/__tests__/paintStubs.ts';
import { stubPainting, stubSaves } from '../../core/__tests__/paintStubs.ts';
import { readClipboardFigure } from '../../core/figureClipboard.ts';
import { figureSvg } from '../../core/figureSvg.ts';
import { SVG_NAMESPACE } from '../../core/svgNamespace.ts';
import type { FigureActionsOptions } from '../useFigureActions.ts';
import { useFigureActions } from '../useFigureActions.ts';

let host: HTMLDivElement;
let root: Root;
let record: PaintRecord;
let saves: Array<{ name: string; href: string }>;
let clipboard: Array<Record<string, Promise<Blob>>>;
let shared: File[];

const WRITTEN = {
  markup: `<svg xmlns="${SVG_NAMESPACE}" width="80" height="40"><g/></svg>`,
  width: 80,
  height: 40,
};

const OPTIONS: FigureActionsOptions = {
  targetId: 'plot',
  format: 'svg',
  scale: 2,
  fileName: 'curve',
  redrawAt: null,
  redraw: () => Promise.reject(new Error('nothing is drawn again')),
};

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  record = stubPainting();
  saves = stubSaves();
  clipboard = [];
  shared = [];
  class StandInClipboardItem {
    public readonly record: Record<string, Promise<Blob>>;

    public constructor(record: Record<string, Promise<Blob>>) {
      this.record = record;
    }
  }
  vi.stubGlobal('ClipboardItem', StandInClipboardItem);
  vi.stubGlobal('navigator', {
    // A browser reads every rendering it is handed, and refuses the item when
    // one of them fails.
    clipboard: {
      write: async ([item]: StandInClipboardItem[]) => {
        if (item === undefined) return;
        await Promise.all(Object.values(item.record));
        clipboard.push(item.record);
      },
    },
    canShare: () => true,
    share: (data: ShareData) => {
      shared.push(...(data.files ?? []));
      return Promise.resolve();
    },
  });
  host = document.createElement('div');
  host.append(figureBox('plot', 100, 50), figureBox('copy', 300, 200));
  const section = document.createElement('section');
  host.append(section);
  document.body.append(host);
  root = createRoot(section);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('save writes the figure read off its box, in the format picked', async () => {
  await press('save', {});

  expect(saves).toStrictEqual([{ name: 'curve.svg', href: 'blob:stub/1' }]);
  await expect(record.blobs[0]?.text()).resolves.toMatch(
    /<svg [^>]*width="200" height="100" viewBox="0 0 100 50"/u,
  );
  expect(field('failure')).toBe('none');
});

test('save at another size writes the copy drawn off the page', async () => {
  const asked: unknown[] = [];
  await press('save', {
    redrawAt: { width: 300, height: 200 },
    redraw: async (targetId, size, write) => {
      asked.push(targetId, size);
      await write(document.querySelector('#copy') ?? host);
    },
  });

  expect(asked).toStrictEqual(['plot', { width: 300, height: 200 }]);
  await expect(record.blobs[0]?.text()).resolves.toMatch(
    /<svg [^>]*width="600" height="400" viewBox="0 0 300 200"/u,
  );
});

test('save of a figure its page writes saves what it wrote', async () => {
  await press('save', { writeFigure: async () => WRITTEN });

  expect(saves).toStrictEqual([{ name: 'curve.svg', href: 'blob:stub/1' }]);
  await expect(record.blobs[0]?.text()).resolves.toBe(WRITTEN.markup);
});

test('with no box to read the figure off, every action says so', async () => {
  await press('save', { targetId: undefined });

  expect(field('failure')).toBe('There is no figure to save.');

  await press('copy', { targetId: undefined });

  expect(field('failure')).toBe('There is no figure to save.');

  await press('send', { targetId: undefined });

  expect(field('failure')).toBe('There is no figure to save.');

  expect(saves).toStrictEqual([]);
  expect(shared).toStrictEqual([]);
});

test('copy puts the PNG at the multiple picked beside the figure read off the page', async () => {
  await press('copy', {});

  expect(field('notice')).toBe('copied');
  expect(record.calls.at(-1)?.canvas).toBe('200×100');
  expect(clipboard).toHaveLength(1);
  expect(Object.keys(clipboard[0] ?? {})).toStrictEqual([
    'image/png',
    'text/html',
  ]);

  const html = await clipboard[0]?.['text/html'];
  const box = document.querySelector('#plot') ?? host;

  expect(readClipboardFigure((await html?.text()) ?? '')).toBe(
    figureSvg(box).markup,
  );
});

test('copy of a figure its page writes paints what it wrote', async () => {
  await press('copy', { writeFigure: async () => WRITTEN, scale: 3 });

  expect(field('notice')).toBe('copied');
  expect(record.calls.at(-1)?.canvas).toBe('240×120');

  const html = await clipboard[0]?.['text/html'];

  expect(readClipboardFigure((await html?.text()) ?? '')).toBe(WRITTEN.markup);
});

test('send hands the share sheet the file save would write', async () => {
  await press('send', {});

  expect(field('notice')).toBe('sent');
  expect(shared.map((file) => file.name)).toStrictEqual(['curve.svg']);
});

test('send of a figure its page writes hands on the file in the format picked', async () => {
  await press('send', { writeFigure: async () => WRITTEN, format: 'png' });

  expect(field('notice')).toBe('sent');
  expect(shared.map((file) => [file.name, file.type])).toStrictEqual([
    ['curve.png', 'image/png'],
  ]);
  expect(record.calls.at(-1)?.canvas).toBe('160×80');
});

/**
 * The panel's three buttons and what they came to.
 * @param props - What the actions work from.
 * @returns The buttons.
 */
function Harness(props: FigureActionsOptions): ReactElement {
  const { save, copy, send, notice, failure } = useFigureActions(props);
  return (
    <>
      <button type="button" data-action="save" onClick={save} />
      <button type="button" data-action="copy" onClick={copy} />
      <button type="button" data-action="send" onClick={send} />
      <output data-field="notice">{notice ?? 'none'}</output>
      <output data-field="failure">{failure ?? 'none'}</output>
    </>
  );
}

/**
 * Render the actions, press one, and let what it started come to rest.
 * @param action - The button pressed.
 * @param options - What differs from {@link OPTIONS}.
 */
async function press(
  action: string,
  options: Partial<FigureActionsOptions>,
): Promise<void> {
  act(() => {
    root.render(<Harness {...OPTIONS} {...options} />);
  });
  await act(async () => {
    host
      .querySelector<HTMLButtonElement>(`[data-action="${CSS.escape(action)}"]`)
      ?.click();
    await turns(10);
  });
}

/**
 * Let the event loop turn, so each step of a save — painting, encoding,
 * writing — gets to run.
 * @param count - How many turns.
 */
async function turns(count: number): Promise<void> {
  if (count === 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  await turns(count - 1);
}

function field(name: string): string | null {
  return (
    host.querySelector(`[data-field="${CSS.escape(name)}"]`)?.textContent ??
    null
  );
}
