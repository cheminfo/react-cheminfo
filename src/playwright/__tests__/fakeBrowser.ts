import type { Locator, Page } from '@playwright/test';

/** Where a fake element is drawn. */
export interface FakeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** What the fake page answers, by the path of the locator asked. */
export interface FakeBrowserSetup {
  /** The box of each locator, by its path joined with ` >> `. */
  boxes?: Record<string, FakeRect | null>;
  /** The attributes of each locator, by its path. */
  attributes?: Record<string, Record<string, string | null>>;
  /** What `evaluate` and `evaluateAll` run against, by the locator's path. */
  elements?: Record<string, unknown>;
  /** The page's viewport, or `null` for none. */
  viewport?: { width: number; height: number } | null;
}

/** A page standing in for Playwright's, and every call made of it, in order. */
export interface FakeBrowser {
  page: Page;
  calls: unknown[][];
  /** The listeners registered with `page.on`, by event. */
  listeners: Record<string, Array<(value: unknown) => void>>;
}

/**
 * A page whose locators record what is asked of them and answer from `setup`,
 * and whose `evaluate` runs the function handed to it in the test's own
 * window.
 * @param setup - What the page answers.
 * @returns The page, and what it recorded.
 */
export function fakeBrowser(setup: FakeBrowserSetup = {}): FakeBrowser {
  const { boxes = {}, attributes = {}, elements = {} } = setup;
  const calls: unknown[][] = [];
  const listeners: FakeBrowser['listeners'] = {};
  const fake: FakeBrowser = { page: {} as Page, calls, listeners };

  function locatorAt(path: string[]): Locator {
    const key = path.join(' >> ');
    const child = (step: string) => locatorAt([...path, step]);
    return {
      locator: (selector: string) => child(selector),
      nth: (index: number) => child(`nth=${index}`),
      first: () => child('nth=0'),
      getByRole: (role: string, options: unknown) =>
        child(`role=${role} ${JSON.stringify(options)}`),
      getByTestId: (id: string) => child(`testid=${id}`),
      page: () => fake.page,
      waitFor: async (options: unknown) => {
        calls.push(['waitFor', key, options]);
      },
      boundingBox: async () => {
        calls.push(['boundingBox', key]);
        return boxes[key] ?? null;
      },
      hover: async () => {
        calls.push(['hover', key]);
      },
      click: async () => {
        calls.push(['click', key]);
      },
      getAttribute: async (name: string) => {
        calls.push(['getAttribute', key, name]);
        return attributes[key]?.[name] ?? null;
      },
      evaluate: async (run: (element: unknown) => unknown) =>
        run(elements[key]),
      evaluateAll: async (run: (list: unknown) => unknown) =>
        run(elements[key]),
      screenshot: async () => Buffer.from(key),
    } as unknown as Locator;
  }

  fake.page = {
    locator: (selector: string) => locatorAt([selector]),
    getByTestId: (id: string) => locatorAt([`testid=${id}`]),
    mouse: {
      move: async (x: number, y: number, options?: unknown) => {
        calls.push(
          options === undefined ? ['move', x, y] : ['move', x, y, options],
        );
      },
      down: async () => {
        calls.push(['down']);
      },
      up: async () => {
        calls.push(['up']);
      },
    },
    viewportSize: () => setup.viewport ?? null,
    evaluate: async (run: (argument: unknown) => unknown, argument: unknown) =>
      run(argument),
    on: (event: string, listener: (value: unknown) => void) => {
      listeners[event] ??= [];
      listeners[event].push(listener);
    },
    waitForTimeout: async (milliseconds: number) => {
      calls.push(['waitForTimeout', milliseconds]);
    },
  } as unknown as Page;
  return fake;
}
