// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';

import type { ChatFrameLog } from '../chatFrame.ts';
import {
  frameAsChat,
  readChatFrameLog,
  readClipboardText,
  readClipboardTypes,
  readLastHeight,
  resetClipboard,
} from '../chatFrame.ts';

import { fakePage, frameIn } from './fakePage.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a card is framed three frames deep, in a page of the card's own origin", async () => {
  const fake = fakePage();

  const card = await frameAsChat(
    fake.page,
    'http://localhost:10639/molecule/12?embed=1&card=1',
  );

  expect(fake.visited).toStrictEqual(['http://localhost:10639/health']);
  expect(fake.located).toStrictEqual(['#proxy', '#view', '#card']);
  expect(card).toBe(fake.locator);
});

test("a relative address frames the card in a page of the test's own origin", async () => {
  const fake = fakePage();

  await frameAsChat(fake.page, '/?embed=1&card=1');

  expect(fake.visited).toStrictEqual(['/health']);
});

test('each frame is sandboxed as the chat sandboxes it, and the address survives two srcdoc', async () => {
  const fake = fakePage();
  const url = 'http://localhost:10713/compound/5?embed=1&card=infobox&q="a"';

  await frameAsChat(fake.page, url);
  const proxy = frameIn(fake.content, 'proxy');
  const view = frameIn(proxy.srcdoc, 'view');
  const card = frameIn(view.srcdoc, 'card');

  expect(proxy.getAttribute('sandbox')).toBe(
    'allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox',
  );
  expect(proxy.getAttribute('allow')).toBe('fullscreen; clipboard-write');
  expect(proxy.getAttribute('style')).toBe('width:958px;height:900px;border:0');
  expect(view.getAttribute('sandbox')).toBe(
    'allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox',
  );
  expect(view.getAttribute('allow')).toBe('fullscreen *; clipboard-write *');
  expect(card.getAttribute('src')).toBe(url);
  expect(card.getAttribute('allow')).toBe('fullscreen *; clipboard-write *');
});

test('the chat frame takes the width asked for', async () => {
  const fake = fakePage();

  await frameAsChat(fake.page, '/?embed=1&card=1', { width: 720 });

  expect(frameIn(fake.content, 'proxy').getAttribute('style')).toBe(
    'width:720px;height:900px;border:0',
  );
});

test('the log is read off the page it was recorded in', async () => {
  const log: ChatFrameLog = { heights: [412, 436], expanded: 1, messages: [] };
  vi.stubGlobal('chatFrameLog', log);

  await expect(readChatFrameLog(fakePage().page)).resolves.toBe(log);
  await expect(readLastHeight(fakePage().page)).resolves.toBe(436);
});

test('a card that reported nothing has no last height', async () => {
  vi.stubGlobal('chatFrameLog', { heights: [], expanded: 0, messages: [] });

  await expect(readLastHeight(fakePage().page)).resolves.toBeUndefined();
});

test('the clipboard is reset, read as text, and read as the types it holds', async () => {
  const written: string[] = [];
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: async (text: string) => {
        written.push(text);
      },
      readText: async () => 'C8H10N4O2',
      read: async () => [
        { types: ['text/plain', 'text/html'] },
        { types: ['image/png'] },
      ],
    },
  });
  const { page } = fakePage();

  await resetClipboard(page);

  expect(written).toStrictEqual(['(nothing yet)']);
  await expect(readClipboardText(page)).resolves.toBe('C8H10N4O2');
  await expect(readClipboardTypes(page)).resolves.toStrictEqual([
    'text/plain',
    'text/html',
    'image/png',
  ]);
});
