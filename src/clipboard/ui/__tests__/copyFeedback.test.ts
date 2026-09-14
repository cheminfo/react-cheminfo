import { afterEach, expect, test, vi } from 'vitest';

import type { CopyFeedbackState } from '../copyFeedback.ts';
import { createCopyFeedback } from '../copyFeedback.ts';

afterEach(() => {
  vi.useRealTimers();
});

test('a copy that worked is confirmed under its key, then fades after the delay', () => {
  vi.useFakeTimers();
  const seen: CopyFeedbackState[] = [];
  const feedback = createCopyFeedback(1500, (state) => seen.push(state));

  feedback.announce(true, 'bibtex');

  expect(seen).toStrictEqual([{ outcome: 'copied', key: 'bibtex' }]);

  vi.advanceTimersByTime(1499);

  expect(seen).toHaveLength(1);

  vi.advanceTimersByTime(1);

  expect(seen).toStrictEqual([
    { outcome: 'copied', key: 'bibtex' },
    { outcome: undefined, key: undefined },
  ]);
});

test('a refused copy is shown as failed, with no key when none was given', () => {
  vi.useFakeTimers();
  const seen: CopyFeedbackState[] = [];
  const feedback = createCopyFeedback(1000, (state) => seen.push(state));

  feedback.announce(false);

  expect(seen).toStrictEqual([{ outcome: 'failed', key: undefined }]);
});

test('a second copy replaces the first and restarts the delay', () => {
  vi.useFakeTimers();
  const seen: CopyFeedbackState[] = [];
  const feedback = createCopyFeedback(1000, (state) => seen.push(state));

  feedback.announce(true, 'text');
  vi.advanceTimersByTime(800);
  feedback.announce(false, 'html');
  vi.advanceTimersByTime(800);

  expect(seen).toStrictEqual([
    { outcome: 'copied', key: 'text' },
    { outcome: 'failed', key: 'html' },
  ]);

  vi.advanceTimersByTime(200);

  expect(seen.at(-1)).toStrictEqual({ outcome: undefined, key: undefined });
  expect(seen).toHaveLength(3);
});

test('once disposed, the shown outcome is cleared, nothing is announced and no timer is left behind', () => {
  vi.useFakeTimers();
  const seen: CopyFeedbackState[] = [];
  const feedback = createCopyFeedback(1000, (state) => seen.push(state));

  feedback.announce(true);
  feedback.dispose();
  vi.advanceTimersByTime(5000);
  feedback.announce(true);

  expect(seen).toStrictEqual([
    { outcome: 'copied', key: undefined },
    { outcome: undefined, key: undefined },
  ]);
  expect(vi.getTimerCount()).toBe(0);
});

test('disposing after the outcome has faded changes nothing', () => {
  vi.useFakeTimers();
  const seen: CopyFeedbackState[] = [];
  const feedback = createCopyFeedback(1000, (state) => seen.push(state));

  feedback.announce(false, 'png');
  vi.advanceTimersByTime(1000);
  feedback.dispose();

  expect(seen).toStrictEqual([
    { outcome: 'failed', key: 'png' },
    { outcome: undefined, key: undefined },
  ]);
});
