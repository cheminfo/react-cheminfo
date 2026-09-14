import { expect, test } from 'vitest';

import { activeHeadingIndex } from '../activeHeading.ts';

test('the heading read is the last one above the reading line', () => {
  expect(activeHeadingIndex(headingsAt([-400, -20, 80, 300]), 96)).toBe(2);
  expect(activeHeadingIndex(headingsAt([-400, -20, 97, 300]), 96)).toBe(1);
});

test('before any heading reaches the line, the first one counts', () => {
  expect(activeHeadingIndex(headingsAt([150, 600]), 96)).toBe(0);
});

test('an article without headings has none', () => {
  expect(activeHeadingIndex([], 96)).toBe(-1);
});

function headingsAt(tops: number[]) {
  const headings = [];
  for (const top of tops) {
    headings.push({ getBoundingClientRect: () => ({ top }) });
  }
  return headings;
}
