import { expect, test } from 'vitest';

import { CAPTION_FAMILIES, DRAWING_FONT, FONTS } from '../fonts.ts';

test('a drawing is set in Arial unless asked otherwise: the first font journals accept, and a caption may name it', () => {
  expect([
    DRAWING_FONT,
    FONTS[0] === DRAWING_FONT,
    CAPTION_FAMILIES.has(DRAWING_FONT.family),
  ]).toStrictEqual([
    { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
    true,
    true,
  ]);
});
