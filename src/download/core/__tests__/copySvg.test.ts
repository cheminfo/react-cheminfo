import { afterEach, expect, test, vi } from 'vitest';

import { copySvg } from '../copySvg.ts';

const MARKUP = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a clipboard taking SVG pictures gets the drawing and its text', async () => {
  const { items, texts } = stubClipboard({ svg: true });

  await expect(copySvg(MARKUP)).resolves.toBe(true);
  expect(items).toHaveLength(1);
  expect(Object.keys(items[0] ?? {})).toStrictEqual([
    'image/svg+xml',
    'text/plain',
  ]);
  await expect(items[0]?.['image/svg+xml']?.text()).resolves.toBe(MARKUP);
  await expect(items[0]?.['text/plain']?.text()).resolves.toBe(MARKUP);
  expect(texts).toStrictEqual([]);
});

test('a clipboard taking no SVG picture gets the text alone', async () => {
  const { items, texts } = stubClipboard({ svg: false });

  await expect(copySvg(MARKUP)).resolves.toBe(true);
  expect(items).toStrictEqual([]);
  expect(texts).toStrictEqual([MARKUP]);
});

test('a refused picture still leaves the text', async () => {
  const { texts } = stubClipboard({ svg: true, refuseItems: true });

  await expect(copySvg(MARKUP)).resolves.toBe(true);
  expect(texts).toStrictEqual([MARKUP]);
});

interface ClipboardStubOptions {
  /** Whether `ClipboardItem.supports` names the SVG type. */
  svg: boolean;
  /** Whether every item write is refused. */
  refuseItems?: boolean;
}

/**
 * A clipboard that keeps what it is handed, item by item and text by text.
 * @param options - What it takes.
 * @returns The items and the texts it took.
 */
function stubClipboard(options: ClipboardStubOptions) {
  const { svg, refuseItems = false } = options;
  const items: Array<Record<string, Blob>> = [];
  const texts: string[] = [];
  class FakeClipboardItem {
    public static supports(type: string): boolean {
      return svg && type === 'image/svg+xml';
    }

    public readonly record: Record<string, Blob>;

    public constructor(record: Record<string, Blob>) {
      this.record = record;
    }
  }
  vi.stubGlobal('ClipboardItem', FakeClipboardItem);
  vi.stubGlobal('navigator', {
    clipboard: {
      write: async (written: FakeClipboardItem[]) => {
        if (refuseItems) throw new Error('NotAllowedError');
        for (const item of written) items.push(item.record);
      },
      writeText: async (text: string) => {
        texts.push(text);
      },
    },
  });
  return { items, texts };
}
