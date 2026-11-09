import { expect, test } from 'vitest';

import type { DrawText } from '../captions.ts';
import {
  CAPTION_SIZE_LIMITS,
  MAX_TEXT,
  addText,
  clampCaptionSize,
  parseText,
  updateText,
} from '../captions.ts';

type Item = DrawText | { type: 'mark'; id: string };

function drawing(): { objects: Item[]; page: { width: number } } {
  return { objects: [{ type: 'mark', id: 't4' }], page: { width: 100 } };
}

test('a caption is written with an identifier nothing else carries', () => {
  const next = addText(drawing(), { x: 1.004, y: 2 }, 'H2O', {
    align: 'left',
    chemical: false,
  });

  expect(next.page).toStrictEqual({ width: 100 });
  expect(next.objects[1]).toStrictEqual({
    type: 'text',
    id: 't5',
    x: 1,
    y: 2,
    text: 'H2O',
    align: 'left',
    chemical: false,
  });
  expect(addText(drawing(), { x: 0, y: 0 }, '  ')).toStrictEqual(drawing());
  expect(
    addText(drawing(), { x: 0, y: 0 }, 'x'.repeat(MAX_TEXT + 1)),
  ).toStrictEqual(drawing());
});

test('a caption changed keeps only what differs from the defaults', () => {
  const written = addText(drawing(), { x: 0, y: 0 }, 'NaCl');
  const changed = updateText(written, 't5', {
    align: 'center',
    size: 500,
    rotation: 360,
  });

  expect(changed.objects[1]).toStrictEqual({
    type: 'text',
    id: 't5',
    x: 0,
    y: 0,
    text: 'NaCl',
    size: CAPTION_SIZE_LIMITS.max,
  });
  expect(updateText(written, 't5', { text: ' ' }).objects).toHaveLength(1);
  expect(clampCaptionSize(0)).toBe(CAPTION_SIZE_LIMITS.min);
});

test('a caption read from a file keeps what it may carry', () => {
  expect(
    parseText({
      id: 't1',
      x: 1,
      y: 2,
      text: 'K2CO3',
      align: 'right',
      size: 12,
      family: 'Unknown',
      rotation: 450,
      color: '#ff0000',
    }),
  ).toStrictEqual({
    type: 'text',
    id: 't1',
    x: 1,
    y: 2,
    text: 'K2CO3',
    align: 'right',
    size: 12,
    rotation: 90,
    color: '#ff0000',
  });
  expect(parseText({ id: 't1', x: 1, y: 2, text: '' })).toBeUndefined();
  expect(parseText([])).toBeUndefined();
});
