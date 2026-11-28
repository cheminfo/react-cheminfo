// @vitest-environment jsdom
import type { Page } from '@playwright/test';
import { expect, test } from 'vitest';

import { frameInSandbox, readFrameOrigin } from '../sandboxFrame.ts';

import { fakePage } from './fakePage.ts';

/** A card's address, carrying the ampersands and the quote a link can carry. */
const CARD = 'http://localhost:10602/titration?embed=1&card=1&q="a"&lang=fr';

/**
 * The outer frame's only child frame: the sandboxed page holds one.
 * @param html - The outer frame's `srcdoc`.
 * @returns The card's frame.
 */
function cardFrameIn(html: string): HTMLIFrameElement {
  const frame = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector('iframe');
  if (!(frame instanceof HTMLIFrameElement)) throw new TypeError('no frame');
  return frame;
}

/**
 * What the two frames of a sandboxed page say, once each page is parsed.
 * @param html - The page holding the sandboxed frame.
 * @returns The outer frame's sandbox and style, and the card frame's address
 * and style.
 */
function framesOf(html: string) {
  const outer = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector('iframe');
  const inner = cardFrameIn(outer?.getAttribute('srcdoc') ?? '');
  return {
    sandbox: outer?.getAttribute('sandbox'),
    style: outer?.getAttribute('style'),
    src: inner.getAttribute('src'),
    cardStyle: inner.getAttribute('style'),
  };
}

test("a card is framed in a sandbox allowing its scripts alone, as a chat's plain view does", async () => {
  const fake = fakePage();

  const card = await frameInSandbox(fake.page, CARD);
  const outer = new DOMParser()
    .parseFromString(fake.content, 'text/html')
    .querySelector('iframe');
  const inner = cardFrameIn(outer?.getAttribute('srcdoc') ?? '');

  expect(card).toBe(fake.locator);
  expect(fake.located).toStrictEqual(['iframe', 'iframe']);
  expect(outer?.getAttribute('sandbox')).toBe('allow-scripts');
  expect(outer?.getAttribute('style')).toBe('width:980px;height:500px');
  expect(inner.getAttribute('src')).toBe(CARD);
  expect(inner.getAttribute('style')).toBe('width:958px;height:480px;border:0');
});

test("the frames read as the ones equilibrium's spec wrote by hand, ampersands included", async () => {
  const fake = fakePage();
  const url = 'http://localhost:10602/titration?embed=1&card=1';
  const written = `<iframe sandbox="allow-scripts" style="width:980px;height:500px" srcdoc="<iframe src=&quot;${url}&quot; style=&quot;width:958px;height:480px;border:0&quot;></iframe>"></iframe>`;

  await frameInSandbox(fake.page, url);

  expect(framesOf(fake.content)).toStrictEqual(framesOf(written));
  expect(framesOf(fake.content).src).toBe(url);
});

test('each frame takes the size asked for', async () => {
  const fake = fakePage();

  await frameInSandbox(fake.page, CARD, {
    width: 740,
    height: 600,
    cardWidth: 700,
    cardHeight: 560,
  });
  const outer = new DOMParser()
    .parseFromString(fake.content, 'text/html')
    .querySelector('iframe');

  expect(outer?.getAttribute('style')).toBe('width:740px;height:600px');
  expect(
    cardFrameIn(outer?.getAttribute('srcdoc') ?? '').getAttribute('style'),
  ).toBe('width:700px;height:560px;border:0');
});

test('the card height follows the frame, unless it is given', async () => {
  const fake = fakePage();

  await frameInSandbox(fake.page, CARD, { height: 700 });
  const outer = new DOMParser()
    .parseFromString(fake.content, 'text/html')
    .querySelector('iframe');

  expect(
    cardFrameIn(outer?.getAttribute('srcdoc') ?? '').getAttribute('style'),
  ).toBe('width:958px;height:680px;border:0');
});

test("the origin is read in the card's own frame, and is undefined before it loads", async () => {
  const card = {
    url: () => 'http://localhost:10602/titration?embed=1',
    evaluate: async () => 'null',
  };
  const page = {
    frames: () => [{ url: () => 'about:srcdoc' }, card],
  } as unknown as Page;

  await expect(readFrameOrigin(page, 'http://localhost:10602')).resolves.toBe(
    'null',
  );
  await expect(
    readFrameOrigin(page, 'http://localhost:10603'),
  ).resolves.toBeUndefined();
});
