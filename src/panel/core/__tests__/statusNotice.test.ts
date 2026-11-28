import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { StatusNotice } from '../statusNotice.ts';
import { createStatusNotice } from '../statusNotice.ts';

function cell(): {
  value: StatusNotice | null;
  peek: () => StatusNotice | null;
} {
  const box = {
    value: null as StatusNotice | null,
    peek: () => box.value,
  };
  return box;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('a sentence stays six seconds, then the hint is back', () => {
  const notice = cell();
  const say = createStatusNotice({ notice });
  say('Saved figure.svg');

  expect(notice.value).toStrictEqual({
    text: 'Saved figure.svg',
    danger: false,
  });

  vi.advanceTimersByTime(5999);

  expect(notice.value).toStrictEqual({
    text: 'Saved figure.svg',
    danger: false,
  });

  vi.advanceTimersByTime(1);

  expect(notice.value).toBeNull();
});

test('only danger is drawn as a failure', () => {
  const notice = cell();
  const say = createStatusNotice({ notice });
  say('Nothing was written.', 'danger');

  expect(notice.value).toStrictEqual({
    text: 'Nothing was written.',
    danger: true,
  });

  say('Saved.', 'success');

  expect(notice.value).toStrictEqual({ text: 'Saved.', danger: false });
});

test('a later sentence replaces the earlier one and restarts the wait', () => {
  const notice = cell();
  const say = createStatusNotice({ notice, duration: 1000 });
  say('First');
  vi.advanceTimersByTime(800);
  say('Second');
  vi.advanceTimersByTime(800);

  expect(notice.value).toStrictEqual({ text: 'Second', danger: false });

  vi.advanceTimersByTime(200);

  expect(notice.value).toBeNull();
});
