import { expect, test } from 'vitest';

import {
  INTERFACE_FACE_SLACK,
  INTERFACE_FONT,
  interfaceTextWidth,
} from '../interfaceText.ts';
import { textWidth } from '../metrics.ts';

test('figures and words run wider than Helvetica by their own measured slack', () => {
  expect(INTERFACE_FACE_SLACK).toStrictEqual({ figures: 1.15, words: 1.08 });
  expect(textWidth('60000', 11)).toBeCloseTo(30.58, 10);
  expect(interfaceTextWidth('60000', 11, { kind: 'figures' })).toBeCloseTo(
    35.167,
    10,
  );
  expect(interfaceTextWidth('Find objects', 12, { bold: true })).toBeCloseTo(
    textWidth('Find objects', 12, true) * 1.08,
    12,
  );
});

test('the interface font is the stack chrome.css sets the body in', () => {
  expect(INTERFACE_FONT).toBe(
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  );
});
