import { afterEach, expect, test, vi } from 'vitest';

import { copyFigure } from '../copyFigure.ts';
import { readClipboardFigure } from '../figureClipboard.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const FIGURE = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

test('a painted picture goes on beside the figure it was drawn as', async () => {
  const written = stubClipboard();
  const png = Promise.resolve(new Blob(['png'], { type: 'image/png' }));

  await expect(copyFigure(png, Promise.resolve(FIGURE))).resolves.toBe(
    'copied',
  );
  expect(written).toHaveLength(1);
  expect(Object.keys(written[0] ?? {})).toStrictEqual([
    'image/png',
    'text/html',
  ]);
  expect(written[0]?.['image/png']).toBe(png);

  const html = await written[0]?.['text/html'];

  expect(readClipboardFigure((await html?.text()) ?? '')).toBe(FIGURE);
});

test('a clipboard that takes no picture says so', async () => {
  vi.stubGlobal('navigator', {});
  const png = Promise.resolve(new Blob(['png'], { type: 'image/png' }));

  await expect(copyFigure(png, Promise.resolve(FIGURE))).resolves.toBe(
    'copyUnsupported',
  );
});

test('a picture that could not be painted reports the painting error', async () => {
  stubClipboard();
  const png = Promise.reject(new Error('The canvas is tainted.'));

  await expect(copyFigure(png, Promise.resolve(FIGURE))).rejects.toThrow(
    'The canvas is tainted.',
  );
});

test('a figure that could not be written reports its error', async () => {
  stubClipboard();
  const png = Promise.resolve(new Blob(['png'], { type: 'image/png' }));
  const figure = Promise.reject(new Error('There is no picture to copy yet.'));

  await expect(copyFigure(png, figure)).rejects.toThrow(
    'There is no picture to copy yet.',
  );
});

/**
 * A clipboard that reads every rendering it is handed, as a browser does, and
 * refuses the item when one of them fails.
 * @returns What it was given, item by item.
 */
function stubClipboard(): Array<Record<string, Promise<Blob>>> {
  const written: Array<Record<string, Promise<Blob>>> = [];
  class FakeClipboardItem {
    public readonly record: Record<string, Promise<Blob>>;

    public constructor(record: Record<string, Promise<Blob>>) {
      this.record = record;
    }
  }
  vi.stubGlobal('ClipboardItem', FakeClipboardItem);
  vi.stubGlobal('navigator', {
    clipboard: {
      write: async (items: FakeClipboardItem[]) => {
        await Promise.all(items.flatMap((item) => Object.values(item.record)));
        for (const item of items) written.push(item.record);
      },
    },
  });
  return written;
}
