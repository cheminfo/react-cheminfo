/**
 * The height a framed card is drawn at, and the height it tells its host, for
 * a site's browser suite: a card that reports less than it draws is cut off in
 * the chat, and one that reports more leaves a gap under it.
 */

import type { FrameLocator, Locator, Page } from '@playwright/test';

import { pollUntil } from '../../playwright/poll.ts';

import { readLastHeight } from './chatFrame.ts';

/** How {@link settledCardHeight} finds the card and waits. */
export interface SettledCardHeightOptions {
  /**
   * The test id of the card inside its frame.
   * @default 'answer-card'
   */
  testId?: string;
  /**
   * How long to wait for the two heights to agree, in milliseconds.
   * @default 30000
   */
  timeout?: number;
}

/**
 * The height an element is drawn at, rounded up as a card reports its own.
 * @param element - The card, or any element.
 * @returns The height in pixels.
 */
export function readDrawnHeight(element: Locator): Promise<number> {
  return element.evaluate((node) =>
    Math.ceil(node.getBoundingClientRect().height),
  );
}

/**
 * The card's height, once the last height it reported is the one it is drawn
 * at.
 * @param page - The page holding the card's frame.
 * @param card - The card's frame.
 * @param options - See {@link SettledCardHeightOptions}.
 * @returns The height in pixels.
 */
export async function settledCardHeight(
  page: Page,
  card: FrameLocator,
  options: SettledCardHeightOptions = {},
): Promise<number> {
  const { testId = 'answer-card', timeout = 30_000 } = options;
  return pollUntil(
    async () => {
      const reported = (await readLastHeight(page)) ?? -1;
      const height = await readDrawnHeight(card.getByTestId(testId));
      return reported === height ? height : undefined;
    },
    timeout,
    'the card never reported the height it is drawn at',
  );
}
