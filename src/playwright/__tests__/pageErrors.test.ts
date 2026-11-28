import { expect, test } from 'vitest';

import { collectPageErrors } from '../pageErrors.ts';

import { fakeBrowser } from './fakeBrowser.ts';

/**
 * A console message, as Playwright hands one to a listener.
 * @param type - Its level, e.g. `error`.
 * @param text - What it says.
 * @returns The message.
 */
function consoleMessage(type: string, text: string) {
  return { type: () => type, text: () => text };
}

/**
 * Raise what a page raises: an uncaught error, a console.error and a warning.
 * @param listeners - The listeners the collector registered.
 */
function raise(listeners: Record<string, Array<(value: unknown) => void>>) {
  for (const listener of listeners.pageerror ?? []) {
    listener(new Error('Cannot read properties of null'));
  }
  for (const listener of listeners.console ?? []) {
    listener(consoleMessage('error', 'Failed to load resource'));
    listener(consoleMessage('warning', 'Deprecated API'));
  }
}

test('an uncaught error and a console.error are both collected, a warning is not', () => {
  const { page, listeners } = fakeBrowser();

  const errors = collectPageErrors(page);

  expect(errors).toStrictEqual([]);

  raise(listeners);

  expect(errors).toStrictEqual([
    'pageerror: Cannot read properties of null',
    'console.error: Failed to load resource',
  ]);
});

test('without the console only what the page throws is collected', () => {
  const { page, listeners } = fakeBrowser();

  const errors = collectPageErrors(page, { console: false });
  raise(listeners);

  expect(listeners.console).toBeUndefined();
  expect(errors).toStrictEqual(['pageerror: Cannot read properties of null']);
});

test('a prefix is read when each message arrives', () => {
  const { page, listeners } = fakeBrowser();
  let address = 'http://localhost:10603/';

  const errors = collectPageErrors(page, { prefix: () => `${address} ` });
  for (const listener of listeners.pageerror ?? []) {
    listener(new Error('first'));
  }
  address = 'http://localhost:10603/scatter';
  for (const listener of listeners.console ?? []) {
    listener(consoleMessage('error', 'second'));
  }

  expect(errors).toStrictEqual([
    'http://localhost:10603/ pageerror: first',
    'http://localhost:10603/scatter console.error: second',
  ]);
});
