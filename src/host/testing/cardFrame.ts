/**
 * A page framing a site's card the way a page of its own does, for the site's
 * end-to-end tests: one frame, as wide as a chat's answer, taking every height
 * the card reports. What the card tells the page goes into the same log as a
 * chat's, read by `readChatFrameLog`. The chat's own nesting, its sandboxes
 * included, is `frameAsChat`.
 */

import type { FrameLocator, Page } from '@playwright/test';

import { escapeAttribute } from '../../share/core/escape.ts';

import { FRAME_LOG_SCRIPT } from './chatFrame.ts';

/** How {@link frameAsCard} frames a card. */
export interface CardFrameOptions {
  /**
   * The width of the frame, in pixels.
   * @default 958 - a chat's answer, less its border
   */
  width?: number;
  /**
   * What the frame delegates to the card, e.g. `fullscreen; clipboard-write`.
   * @default '' - nothing
   */
  allow?: string;
  /**
   * The address the page is opened on before it frames the card, so it has
   * an origin: a page of the site's own when a test reads the clipboard,
   * which `about:blank` has none of.
   * @default undefined - the page stays where it is
   */
  host?: string;
}

/**
 * Frame a card as a page of its own does, in a page recording what the card
 * tells it.
 * @param page - The page to turn into the host.
 * @param url - The card's address.
 * @param options - See {@link CardFrameOptions}.
 * @returns The card's frame.
 */
export async function frameAsCard(
  page: Page,
  url: string,
  options: CardFrameOptions = {},
): Promise<FrameLocator> {
  const { width = 958, allow = '', host } = options;
  if (host !== undefined) await page.goto(host);
  await page.setContent(cardPage(url, width, allow));
  return page.frameLocator('#card');
}

/**
 * The address a page was opened at, before it wrote its own state back into
 * its address bar: what a card's Details or a link handed it.
 * @param page - The page.
 * @returns The address its document was loaded from.
 */
export function readOpenedAddress(page: Page): Promise<string | undefined> {
  return page.evaluate(
    () => performance.getEntriesByType('navigation')[0]?.name,
  );
}

/**
 * The page holding the card's frame, which takes the height the card reports.
 * @param url - The card's address.
 * @param width - The width of the frame, in pixels.
 * @param allow - What the frame delegates to the card.
 * @returns The page's HTML.
 */
function cardPage(url: string, width: number, allow: string): string {
  const delegated = allow === '' ? '' : ` allow="${escapeAttribute(allow)}"`;
  return `<!doctype html><body style="margin:0"><iframe id="card" src="${escapeAttribute(url)}"${delegated} style="display:block;width:${width}px;height:120px;border:0"></iframe><script>${FRAME_LOG_SCRIPT}
addEventListener('message', (event) => {
  if (event.data?.type === 'cheminfo:embed-height') {
    document.getElementById('card').style.height = event.data.height + 'px';
  }
});
</script></body>`;
}
