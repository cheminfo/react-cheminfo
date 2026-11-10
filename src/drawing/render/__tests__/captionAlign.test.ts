/**
 * A caption aligned anew stays where it is drawn: its anchor moves along its
 * widest line, along its own baseline when it is turned.
 */

import { expect, test } from 'vitest';

import type { DrawText } from '../../core/captions.ts';
import { realignedAnchor } from '../captionAlign.ts';
import { captionPrimitive } from '../captions.ts';
import { textWidth } from '../metrics.ts';
import type { DrawingStyle } from '../style.ts';

const STYLE: DrawingStyle = {
  bondLength: 14.4,
  lineWidth: 0.6,
  fontFamily: 'Arial, Helvetica, sans-serif',
  captionSize: 10,
  captionFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

const CAPTION: DrawText = {
  type: 'text',
  id: 't1',
  x: 100,
  y: 50,
  text: 'Et3N\nCH2Cl2, 0 °C',
};

test('a caption aligned anew keeps its widest line where it was', () => {
  // CH2Cl2, 0 °C in Helvetica, its two subscripts at 7 pt.
  const [, widest] = captionPrimitive(CAPTION, STYLE).widths;

  expect(widest).toBeCloseTo(56.784, 6);

  const left = realignedAnchor(CAPTION, 'left', STYLE);

  expect(left).toStrictEqual({ x: 71.61, y: 50 });

  const right = realignedAnchor(
    { ...CAPTION, align: 'left', ...left },
    'right',
    STYLE,
  );

  expect(right).toStrictEqual({ x: 128.39, y: 50 });
  expect(realignedAnchor(CAPTION, 'center', STYLE)).toStrictEqual({
    x: 100,
    y: 50,
  });
});

test('a turned caption moves its anchor along its own baseline', () => {
  const turned = { ...CAPTION, rotation: 90 };

  expect(realignedAnchor(turned, 'right', STYLE)).toStrictEqual({
    x: 100,
    y: 78.39,
  });
});

test('a caption in Times is aligned on the width Times gives it', () => {
  const times = {
    ...CAPTION,
    text: 'Mg',
    size: 20,
    family: "'Times New Roman', serif",
  };

  expect(textWidth('Mg', 20, false, 'times')).toBe(27.78);
  expect(realignedAnchor(times, 'left', STYLE)).toStrictEqual({
    x: 86.11,
    y: 50,
  });
});
