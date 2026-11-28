import { afterEach, expect, test, vi } from 'vitest';

import { fakeBrowser } from '../../../playwright/__tests__/fakeBrowser.ts';
import { copyByClick } from '../copyByClick.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const VALUE = 'title=Copy the SMILES (CCO)';
const TICKED = `${VALUE} >> xpath=self::*[@data-copy="copied"]`;

/**
 * A clipboard the page reads, written by the click a moment later.
 * @param text - What the click copies.
 * @returns What it held, and the writes the helper made.
 */
function clipboard(text: string) {
  const held = { text: '(an earlier copy)', writes: [] as string[] };
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: async (written: string) => {
        held.writes.push(written);
        held.text = written;
      },
      readText: async () => held.text,
    },
  });
  return {
    held,
    copy: () => {
      setTimeout(() => {
        held.text = text;
      }, 50);
    },
  };
}

test('a value is clicked, its tick waited for, and the clipboard read', async () => {
  const { page, calls } = fakeBrowser();
  const { held } = clipboard('');
  held.text = 'CCO';

  await expect(copyByClick(page.locator(VALUE))).resolves.toBe('CCO');
  expect(calls).toStrictEqual([
    ['click', VALUE],
    ['waitFor', TICKED, { state: 'attached' }],
  ]);
  expect(held.writes).toStrictEqual([]);
});

test('waiting on the clipboard empties it first and reads it until it holds the copy', async () => {
  const { page, calls } = fakeBrowser();
  const { held, copy } = clipboard('C8H10N4O2');

  const copied = copyByClick(page.locator(VALUE), { until: 'clipboard' });
  copy();

  await expect(copied).resolves.toBe('C8H10N4O2');
  expect(held.writes).toStrictEqual(['']);
  expect(calls).toStrictEqual([['click', VALUE]]);
});

test('a click that copies nothing fails, and says so', async () => {
  const { page } = fakeBrowser();
  clipboard('');

  await expect(
    copyByClick(page.locator(VALUE), { until: 'clipboard', timeout: 0 }),
  ).rejects.toThrow('the click put nothing on the clipboard');
});
