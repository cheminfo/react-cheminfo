import { afterEach, expect, test, vi } from 'vitest';

import { fakeBrowser } from '../../../playwright/__tests__/fakeBrowser.ts';
import { copiedFrame, shareDialog, sharedLink } from '../shareDialog.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const LINK = '.share-dialog >> .share-linkbar a';
const COPY_IFRAME = `.share-dialog >> role=button ${JSON.stringify({ name: 'Copy the iframe', exact: true })}`;

/**
 * A clipboard the page writes to and reads from, which a click fills a moment
 * later, as the dialog's copy does.
 * @param snippet - What the copy writes.
 * @returns What the clipboard held, in order.
 */
function clipboard(snippet: string) {
  const held = { text: '(an earlier copy)', writes: [] as string[] };
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: async (text: string) => {
        held.writes.push(text);
        held.text = text;
      },
      readText: async () => held.text,
    },
  });
  const copy = () => {
    setTimeout(() => {
      held.text = snippet;
    }, 50);
  };
  return { held, copy };
}

test('the link is where "Open in a new tab" points, read as often as asked', async () => {
  const { page, calls } = fakeBrowser({
    attributes: { [LINK]: { href: 'http://localhost/?embed=1&hide=tabs' } },
  });

  const link = sharedLink(shareDialog(page));

  await expect(link()).resolves.toBe('http://localhost/?embed=1&hide=tabs');
  await expect(link()).resolves.toBe('http://localhost/?embed=1&hide=tabs');
  expect(calls).toStrictEqual([
    ['getAttribute', LINK, 'href'],
    ['getAttribute', LINK, 'href'],
  ]);
});

test('a link not ready to hand out reads null', async () => {
  const { page } = fakeBrowser();

  await expect(sharedLink(page)()).resolves.toBeNull();
});

test('the iframe is read off a clipboard emptied before the copy', async () => {
  const { page, calls } = fakeBrowser();
  const { held, copy } = clipboard('<iframe src="http://localhost/?embed=1">');

  const frame = copiedFrame(page, shareDialog(page));
  copy();

  await expect(frame).resolves.toBe('<iframe src="http://localhost/?embed=1">');
  expect(held.writes).toStrictEqual(['']);
  expect(calls).toStrictEqual([['click', COPY_IFRAME]]);
});

test('an iframe that never reaches the clipboard fails, and says so', async () => {
  const { page } = fakeBrowser();
  clipboard('');

  await expect(
    copiedFrame(page, shareDialog(page), { timeout: 0 }),
  ).rejects.toThrow('the iframe never reached the clipboard');
});
