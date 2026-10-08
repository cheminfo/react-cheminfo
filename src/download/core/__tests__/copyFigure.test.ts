import { afterEach, expect, test, vi } from 'vitest';

import { copyFigure } from '../copyFigure.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a painted picture taken by the clipboard is copied', async () => {
  const written = stubClipboard();
  const png = Promise.resolve(new Blob(['png'], { type: 'image/png' }));

  await expect(copyFigure(png)).resolves.toBe('copied');
  expect(written).toStrictEqual([{ 'image/png': png }]);
});

test('a clipboard that takes no picture says so', async () => {
  vi.stubGlobal('navigator', {});
  const png = Promise.resolve(new Blob(['png'], { type: 'image/png' }));

  await expect(copyFigure(png)).resolves.toBe('copyUnsupported');
});

test('a picture that could not be painted reports the painting error', async () => {
  stubClipboard();
  const png = Promise.reject(new Error('The canvas is tainted.'));

  await expect(copyFigure(png)).rejects.toThrow('The canvas is tainted.');
});

/**
 * A clipboard that reads every picture it is handed, as a browser does.
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
