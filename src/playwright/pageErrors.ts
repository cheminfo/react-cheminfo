/**
 * What a page throws, collected for a test to hold against an empty list once
 * it has worked the page: an error the screen does not show — a second React,
 * a figure its layout cannot draw — still fails the test.
 */

import type { Page } from '@playwright/test';

/** What {@link collectPageErrors} listens to, and how it writes it down. */
export interface PageErrorOptions {
  /**
   * Also collect every message the page logs with `console.error`.
   * @default true
   */
  console?: boolean;
  /**
   * Put in front of each message, read when it happens — the address the page
   * is on, for a test walking several.
   * @default undefined - no prefix
   */
  prefix?: () => string;
}

/**
 * Collect every uncaught error the page raises from now on, as
 * `pageerror: <message>`, and every `console.error` as
 * `console.error: <message>`.
 * @param page - The page under test.
 * @param options - See {@link PageErrorOptions}.
 * @returns The list, filled as they happen.
 */
export function collectPageErrors(
  page: Page,
  options: PageErrorOptions = {},
): string[] {
  const { console: logged = true, prefix } = options;
  const errors: string[] = [];
  const write = (text: string) => {
    errors.push(prefix === undefined ? text : `${prefix()}${text}`);
  };
  page.on('pageerror', (error) => {
    write(`pageerror: ${error.message}`);
  });
  if (logged) {
    page.on('console', (message) => {
      if (message.type() === 'error') {
        write(`console.error: ${message.text()}`);
      }
    });
  }
  return errors;
}
