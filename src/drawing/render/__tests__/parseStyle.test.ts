import { expect, test } from 'vitest';

import { DRAWING_STYLE_LIMITS, parseDrawingStyle } from '../parseStyle.ts';
import type { DrawingStyle } from '../style.ts';

import { STYLE } from './drawingStyle.ts';

test('a file keeps the ink its drawing is set in, and only a colour', () => {
  expect(parseDrawingStyle({ ...STYLE, color: '#1f3a93' }, STYLE)?.color).toBe(
    '#1f3a93',
  );
  expect(parseDrawingStyle({ ...STYLE, color: 'navy' }, STYLE)?.color).toBe(
    STYLE.color,
  );
});

test('every length is brought within its range, and a missing one refuses the style', () => {
  expect(
    parseDrawingStyle({ ...STYLE, bondLength: 200, lineWidth: 0 }, STYLE),
  ).toStrictEqual({ ...STYLE, bondLength: 72, lineWidth: 0.1 });

  const { captionSize: _captionSize, ...missing } = STYLE;

  expect(parseDrawingStyle(missing, STYLE)).toBeUndefined();
  expect(parseDrawingStyle('serif', STYLE)).toBeUndefined();
});

test('only a font the settings offer is kept, and a background when it is a colour', () => {
  expect(
    parseDrawingStyle(
      {
        ...STYLE,
        fontFamily: 'Comic Sans MS',
        captionFamily: '</style><script>',
        background: '#ffffff80',
      },
      STYLE,
    ),
  ).toStrictEqual({ ...STYLE, background: '#ffffff80' });
});

interface BondStyle extends DrawingStyle {
  boldWidth: number;
}

test('a site reads the lengths its own style adds, past the shared ones', () => {
  const base: BondStyle = { ...STYLE, boldWidth: 2 };
  const limits = { ...DRAWING_STYLE_LIMITS, boldWidth: { min: 0.5, max: 8 } };

  expect(
    parseDrawingStyle({ ...base, boldWidth: 20 }, base, limits),
  ).toStrictEqual({ ...base, boldWidth: 8 });
  expect(parseDrawingStyle(STYLE, base, limits)).toBeUndefined();
});
