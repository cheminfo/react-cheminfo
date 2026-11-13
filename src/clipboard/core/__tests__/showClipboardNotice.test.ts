// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  CLIPBOARD_FAILURE_TIME,
  CLIPBOARD_NOTICE_LEAVE,
  CLIPBOARD_NOTICE_TIME,
  hideClipboardNotice,
  showClipboardNotice,
} from '../showClipboardNotice.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  hideClipboardNotice();
  vi.useRealTimers();
});

test('a notice says what was copied, slides out, then goes', () => {
  showClipboardNotice('Figure copied');

  expect(notices()).toStrictEqual([
    'clipboard-notice no-print|status|Figure copied',
  ]);

  vi.advanceTimersByTime(CLIPBOARD_NOTICE_TIME);

  expect(notices()).toStrictEqual([
    'clipboard-notice no-print clipboard-notice--leaving|status|Figure copied',
  ]);

  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual([]);
});

test('a failure is an alert, and stays longer', () => {
  showClipboardNotice('Copy refused', true);

  expect(notices()).toStrictEqual([
    'clipboard-notice clipboard-notice--failed no-print|alert|Copy refused',
  ]);

  vi.advanceTimersByTime(CLIPBOARD_FAILURE_TIME - 1);

  expect(notices()).toHaveLength(1);

  vi.advanceTimersByTime(1 + CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual([]);
});

test('a second notice replaces the first at once, even one sliding out', () => {
  showClipboardNotice('First');
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_TIME);
  showClipboardNotice('Second');

  expect(notices()).toStrictEqual(['clipboard-notice no-print|status|Second']);

  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual(['clipboard-notice no-print|status|Second']);
});

function notices(): string[] {
  const shown = document.querySelectorAll('.clipboard-notice');
  const lines: string[] = [];
  for (const element of shown) {
    lines.push(
      `${element.className}|${element.getAttribute('role')}|${element.textContent}`,
    );
  }
  return lines;
}
