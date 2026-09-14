import { afterEach, expect, test, vi } from 'vitest';

import { writeBlobToClipboard } from '../writeBlobToClipboard.ts';
import { writeToClipboard } from '../writeToClipboard.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('an image goes on as one item, under its own type', async () => {
  const clipboard = stubClipboard('accept');
  const png = new Blob(['png bytes'], { type: 'image/png' });

  await expect(writeBlobToClipboard(png)).resolves.toBe(true);
  expect(clipboard.items).toHaveLength(1);
  expect(Object.keys(clipboard.items[0] ?? {})).toStrictEqual(['image/png']);
  expect(clipboard.items[0]?.['image/png']).toBe(png);
});

test('the promise of an image is handed over unresolved, as image/png unless told', async () => {
  const clipboard = stubClipboard('accept');
  const pending = Promise.resolve(new Blob(['svg'], { type: 'image/svg+xml' }));

  await expect(writeBlobToClipboard(pending)).resolves.toBe(true);
  expect(clipboard.items[0]?.['image/png']).toBe(pending);

  await expect(
    writeBlobToClipboard(pending, { type: 'image/svg+xml' }),
  ).resolves.toBe(true);
  expect(Object.keys(clipboard.items[1] ?? {})).toStrictEqual([
    'image/svg+xml',
  ]);
});

test('a blob with no type of its own is written as image/png', async () => {
  const clipboard = stubClipboard('accept');

  await expect(writeBlobToClipboard(new Blob(['raw']))).resolves.toBe(true);
  expect(Object.keys(clipboard.items[0] ?? {})).toStrictEqual(['image/png']);
});

test('a refused write, or an image that could not be made, is false rather than an exception', async () => {
  stubClipboard('refuse');

  await expect(
    writeBlobToClipboard(new Blob(['png'], { type: 'image/png' })),
  ).resolves.toBe(false);

  stubClipboard('accept-after-reading');

  await expect(
    writeBlobToClipboard(Promise.reject(new Error('the canvas is tainted'))),
  ).resolves.toBe(false);
});

test('a browser with no ClipboardItem, or no clipboard, cannot take an image', async () => {
  vi.stubGlobal('navigator', { clipboard: { write: () => Promise.resolve() } });
  vi.stubGlobal('ClipboardItem', undefined);

  await expect(writeBlobToClipboard(new Blob(['png']))).resolves.toBe(false);

  vi.stubGlobal('navigator', {});

  await expect(writeBlobToClipboard(new Blob(['png']))).resolves.toBe(false);
});

test('text with its HTML goes on as one item carrying both renderings', async () => {
  const clipboard = stubClipboard('accept');

  await expect(
    writeToClipboard({ text: 'Patiny L.', html: '<i>Patiny</i> L.' }),
  ).resolves.toBe(true);

  const item = clipboard.items[0] ?? {};

  expect(Object.keys(item)).toStrictEqual(['text/html', 'text/plain']);
  await expect(readBlob(item['text/html'])).resolves.toBe('<i>Patiny</i> L.');
  await expect(readBlob(item['text/plain'])).resolves.toBe('Patiny L.');
  expect(clipboard.texts).toStrictEqual([]);
});

test('text without HTML, or HTML the clipboard refuses, is written as plain text', async () => {
  const clipboard = stubClipboard('refuse');

  await expect(writeToClipboard({ text: 'CCO' })).resolves.toBe(true);
  await expect(
    writeToClipboard({ text: 'Patiny L.', html: '<i>Patiny</i> L.' }),
  ).resolves.toBe(true);
  expect(clipboard.items).toHaveLength(0);
  expect(clipboard.texts).toStrictEqual(['CCO', 'Patiny L.']);
});

interface ClipboardStub {
  /** Every item the clipboard was asked to hold, as the record it was built from. */
  items: Array<Record<string, Blob | Promise<Blob>>>;
  /** Every plain text written. */
  texts: string[];
}

type ClipboardBehaviour = 'accept' | 'refuse' | 'accept-after-reading';

function stubClipboard(behaviour: ClipboardBehaviour): ClipboardStub {
  const stub: ClipboardStub = { items: [], texts: [] };

  class FakeClipboardItem {
    public readonly record: Record<string, Blob | Promise<Blob>>;

    public constructor(record: Record<string, Blob | Promise<Blob>>) {
      this.record = record;
    }
  }

  vi.stubGlobal('ClipboardItem', FakeClipboardItem);
  vi.stubGlobal('navigator', {
    clipboard: {
      write: async (items: FakeClipboardItem[]) => {
        if (behaviour === 'refuse') throw new Error('NotAllowedError');
        const reads: Array<Promise<Blob>> = [];
        for (const item of items) {
          for (const value of Object.values(item.record)) {
            reads.push(Promise.resolve(value));
          }
        }
        if (behaviour === 'accept-after-reading') await Promise.all(reads);
        for (const item of items) {
          stub.items.push(item.record);
        }
      },
      writeText: (text: string) => {
        stub.texts.push(text);
        return Promise.resolve();
      },
    },
  });

  return stub;
}

async function readBlob(value: Blob | Promise<Blob> | undefined) {
  const blob = await value;
  return blob?.text();
}
