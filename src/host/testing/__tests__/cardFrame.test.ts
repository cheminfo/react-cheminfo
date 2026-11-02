// @vitest-environment jsdom
import { runInNewContext } from 'node:vm';

import { afterEach, expect, test, vi } from 'vitest';

import { frameAsCard, readOpenedAddress } from '../cardFrame.ts';

import { fakePage, frameIn } from './fakePage.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Run the script of a page on its own, as the page would, with a stand-in for
 * the frame it sizes.
 * @param html - The page.
 * @returns The page's globals, its frame, and a way to post it a message.
 */
function run(html: string) {
  const script = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector('script')?.textContent;
  if (!script) throw new Error('the page has no script');
  const frame = { style: { height: '120px' } };
  const listeners: Array<(event: { data: unknown }) => void> = [];
  const page: Record<string, unknown> = {
    addEventListener: (
      type: string,
      listener: (event: { data: unknown }) => void,
    ) => {
      if (type === 'message') listeners.push(listener);
    },
    document: {
      getElementById: (id: string) => (id === 'card' ? frame : null),
    },
  };
  runInNewContext(script, page);
  return {
    page,
    frame,
    post: (data: unknown) => {
      for (const listener of listeners) listener({ data });
    },
  };
}

test('a card is framed once, as wide as a chat, where the page stands', async () => {
  const fake = fakePage();
  const url = 'http://localhost:10606/?smiles=CCO&embed=1&card=1&q="a"';

  const card = await frameAsCard(fake.page, url);
  const frame = frameIn(fake.content, 'card');

  expect(fake.visited).toStrictEqual([]);
  expect(fake.located).toStrictEqual(['#card']);
  expect(card).toBe(fake.locator);
  expect(frame.getAttribute('src')).toBe(url);
  expect(frame.hasAttribute('allow')).toBe(false);
  expect(frame.getAttribute('style')).toBe(
    'display:block;width:958px;height:120px;border:0',
  );
});

test('the frame takes the width, the delegation and the host page asked for', async () => {
  const fake = fakePage();

  await frameAsCard(fake.page, '/?embed=1&card=1', {
    width: 700,
    allow: 'fullscreen; clipboard-write',
    host: '/404.html',
  });
  const frame = frameIn(fake.content, 'card');

  expect(fake.visited).toStrictEqual(['/404.html']);
  expect(frame.getAttribute('allow')).toBe('fullscreen; clipboard-write');
  expect(frame.getAttribute('style')).toBe(
    'display:block;width:700px;height:120px;border:0',
  );
});

test('the page records every message, and takes each height for the frame', async () => {
  const fake = fakePage();
  await frameAsCard(fake.page, '/?embed=1&card=1');
  const { page, frame, post } = run(fake.content);

  post({ type: 'cheminfo:embed-height', height: 240 });
  post({ type: 'cheminfo:embed-expand' });
  post('ready');
  post({ type: 'cheminfo:embed-height', height: 312 });

  // Copied out of the script's realm, as Playwright's `evaluate` hands it over.
  expect(structuredClone(page.chatFrameLog)).toStrictEqual({
    heights: [240, 312],
    expanded: 1,
    messages: [
      { type: 'cheminfo:embed-height', height: 240 },
      { type: 'cheminfo:embed-expand' },
      'ready',
      { type: 'cheminfo:embed-height', height: 312 },
    ],
  });
  expect(frame.style.height).toBe('312px');
});

test('the address a page was opened at is read off its navigation', async () => {
  vi.stubGlobal('performance', {
    getEntriesByType: (type: string) =>
      type === 'navigation'
        ? [{ name: 'http://localhost:10606/?mf=C6H6' }]
        : [],
  });

  await expect(readOpenedAddress(fakePage().page)).resolves.toBe(
    'http://localhost:10606/?mf=C6H6',
  );
});
