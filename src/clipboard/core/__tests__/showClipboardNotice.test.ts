// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
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

test('a warning stays until it is clicked', () => {
  showClipboardNotice('Copied as text', {
    tone: 'warning',
    closeLabel: 'Fermer',
  });

  expect(notices()).toStrictEqual([
    'clipboard-notice clipboard-notice--warning no-print|alert|Copied as text',
  ]);
  expect(
    document
      .querySelector('.clipboard-notice__close')
      ?.getAttribute('aria-label'),
  ).toBe('Fermer');

  vi.advanceTimersByTime(60_000);

  expect(notices()).toHaveLength(1);

  document.querySelector<HTMLElement>('.clipboard-notice')?.click();
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual([]);
});

test('an error stays until its close button or Escape', () => {
  showClipboardNotice('Copy refused', { tone: 'error' });
  vi.advanceTimersByTime(60_000);

  expect(notices()).toStrictEqual([
    'clipboard-notice clipboard-notice--error no-print|alert|Copy refused',
  ]);

  document.querySelector<HTMLElement>('.clipboard-notice__close')?.click();
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual([]);

  showClipboardNotice('Copy refused again', { tone: 'error' });
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toHaveLength(1);

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_LEAVE);

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

test('a copy that worked replaces a warning still shown, and then goes', () => {
  showClipboardNotice('Copied as text', { tone: 'warning' });
  showClipboardNotice('Copied');
  vi.advanceTimersByTime(CLIPBOARD_NOTICE_TIME + CLIPBOARD_NOTICE_LEAVE);

  expect(notices()).toStrictEqual([]);
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
