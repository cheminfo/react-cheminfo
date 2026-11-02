import type { Page } from '@playwright/test';

/** A page standing in for Playwright's, and what the helpers asked of it. */
export interface FakePage {
  page: Page;
  visited: string[];
  content: string;
  located: string[];
  locator: object;
}

/**
 * A page that records what the helpers ask of it, and runs what they hand to
 * `evaluate` in the test's own window.
 * @returns The page, and what it recorded.
 */
export function fakePage(): FakePage {
  const located: string[] = [];
  const locator = {
    frameLocator(selector: string) {
      located.push(selector);
      return locator;
    },
  };
  const fake: FakePage = {
    page: {} as Page,
    visited: [],
    content: '',
    located,
    locator,
  };
  fake.page = {
    goto: async (url: string) => {
      fake.visited.push(url);
      return null;
    },
    setContent: async (html: string) => {
      fake.content = html;
    },
    frameLocator: (selector: string) => locator.frameLocator(selector),
    evaluate: async (pageFunction: () => unknown) => pageFunction(),
  } as unknown as Page;
  return fake;
}

/**
 * The frame an HTML page holds.
 * @param html - The page.
 * @param id - The frame's id.
 * @returns The frame.
 */
export function frameIn(html: string, id: string): HTMLIFrameElement {
  const frame = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector(`iframe#${id}`);
  if (!(frame instanceof HTMLIFrameElement)) {
    throw new TypeError(`no frame #${id}`);
  }
  return frame;
}
