/**
 * A card framed in a bare sandbox, as a chat's plain view frames it: an
 * iframe sandboxed to its scripts alone, whose `srcdoc` frames the card. The
 * card then runs in an opaque origin, which is what a spec checks it survives.
 * The chat's whole nesting, with its proxy and its delegations, is
 * `frameAsChat`.
 */

import type { FrameLocator, Page } from '@playwright/test';

import { escapeAttribute } from '../../share/core/escape.ts';

/** How {@link frameInSandbox} frames a card. */
export interface SandboxFrameOptions {
  /**
   * The width of the sandboxed frame, in pixels.
   * @default 980
   */
  width?: number;
  /**
   * The height of the sandboxed frame, in pixels.
   * @default 500
   */
  height?: number;
  /**
   * The width of the card's frame inside it, in pixels.
   * @default 958
   */
  cardWidth?: number;
  /**
   * The height of the card's frame inside it, in pixels.
   * @default height - 20
   */
  cardHeight?: number;
}

/**
 * Frame a card in a sandbox allowing only its scripts, in the page as it is.
 * @param page - The page holding the frames.
 * @param url - The card's address.
 * @param options - See {@link SandboxFrameOptions}.
 * @returns The card's frame.
 */
export async function frameInSandbox(
  page: Page,
  url: string,
  options: SandboxFrameOptions = {},
): Promise<FrameLocator> {
  const { width = 980, height = 500, cardWidth = 958 } = options;
  const { cardHeight = height - 20 } = options;
  const card = `<iframe src="${escapeAttribute(url)}" style="width:${cardWidth}px;height:${cardHeight}px;border:0"></iframe>`;
  await page.setContent(
    `<iframe sandbox="allow-scripts" style="width:${width}px;height:${height}px" srcdoc="${escapeAttribute(card)}"></iframe>`,
  );
  return page.frameLocator('iframe').frameLocator('iframe');
}

/**
 * The origin a framed card runs in — `'null'` in a sandbox.
 * @param page - The page holding the frames.
 * @param server - How the card's address starts, e.g. its origin.
 * @returns The origin, or `undefined` while no frame is at that address.
 */
export async function readFrameOrigin(
  page: Page,
  server: string,
): Promise<string | undefined> {
  return page
    .frames()
    .find((frame) => frame.url().startsWith(server))
    ?.evaluate(() => globalThis.origin);
}
