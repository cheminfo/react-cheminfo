import type { FrameLocator, Locator, Page } from '@playwright/test';
import { afterEach, expect, test, vi } from 'vitest';

import { readDrawnHeight, settledCardHeight } from '../cardHeight.ts';
import type { ChatFrameLog } from '../chatFrame.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * An element drawn at each height of `heights` in turn, the last repeating.
 * @param heights - What it measures, in order.
 * @returns Its locator.
 */
function drawnAt(heights: number[]): Locator {
  return {
    evaluate: async (run: (element: unknown) => unknown) => {
      const height = heights.length > 1 ? heights.shift() : heights[0];
      return run({ getBoundingClientRect: () => ({ height }) });
    },
  } as unknown as Locator;
}

test('a drawn height is rounded up, as a card reports it', async () => {
  await expect(readDrawnHeight(drawnAt([412.2]))).resolves.toBe(413);
  await expect(readDrawnHeight(drawnAt([412]))).resolves.toBe(412);
});

test('the height is the one drawn once the last report has caught up with it', async () => {
  const log: ChatFrameLog = { heights: [380], expanded: 0, messages: [] };
  vi.stubGlobal('chatFrameLog', log);
  const asked: string[] = [];
  const card = {
    getByTestId: (id: string) => {
      asked.push(id);
      return drawnAt([412.4]);
    },
  } as unknown as FrameLocator;
  const page = {
    evaluate: async (run: () => unknown) => run(),
  } as unknown as Page;
  setTimeout(() => log.heights.push(413), 50);

  await expect(settledCardHeight(page, card)).resolves.toBe(413);
  expect(asked[0]).toBe('answer-card');
});

test('a card that never reports its height fails, naming what it waited for', async () => {
  vi.stubGlobal('chatFrameLog', { heights: [], expanded: 0, messages: [] });
  const card = {
    getByTestId: () => drawnAt([120]),
  } as unknown as FrameLocator;
  const page = {
    evaluate: async (run: () => unknown) => run(),
  } as unknown as Page;

  await expect(
    settledCardHeight(page, card, { testId: 'card', timeout: 0 }),
  ).rejects.toThrow('the card never reported the height it is drawn at');
});
