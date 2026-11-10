/**
 * A caption as it is drawn: its lines laid out on their baselines, the frame
 * it turns in and is hit by, and the SVG text it is written as.
 */

import { expect, test } from 'vitest';

import type { DrawText } from '../../core/captions.ts';
import { primitivesBounds } from '../bounds.ts';
import { captionMarkup } from '../captionMarkup.ts';
import {
  captionContains,
  captionCorners,
  captionPrimitive,
  captionTransform,
} from '../captions.ts';
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
  x: 0,
  y: 0,
  text: 'ab',
  align: 'left',
  size: 10,
};

test('a caption takes the style size, font and centring it does not set', () => {
  const caption = captionPrimitive(
    { type: 'text', id: 't2', x: 5, y: 6, text: 'H2O' },
    STYLE,
  );

  expect(caption).toStrictEqual({
    kind: 'caption',
    x: 5,
    y: 6,
    anchor: 'middle',
    size: 10,
    family: 'Arial, Helvetica, sans-serif',
    baselines: [6],
    sizes: [10],
    lines: [[{ text: 'H' }, { text: '2', script: 'sub' }, { text: 'O' }]],
    widths: [caption.widths[0]],
    rotation: 0,
  });
  expect(caption.widths[0]).toBeCloseTo(7.22 + 3.892 + 7.78, 10);
  expect(captionTransform(caption)).toBeUndefined();
});

test('the next baseline clears the descent of a line and the height of the next', () => {
  const lines = { ...CAPTION, text: 'NaOH\nΔ', align: 'center' } as const;

  expect(captionPrimitive(lines, STYLE).baselines).toStrictEqual([0, 12]);

  const sized = captionPrimitive(
    { ...CAPTION, text: '{14pt:Big}\nsmall', size: undefined },
    STYLE,
  );

  expect(sized.sizes).toStrictEqual([14, 10]);
  expect(sized.baselines).toStrictEqual([0, 13]);

  const gap = captionPrimitive({ ...CAPTION, text: 'a\n\nb' }, STYLE);

  expect(gap.sizes).toStrictEqual([10, 10, 10]);
  expect(gap.baselines).toStrictEqual([0, 12, 24]);
  expect(gap.widths).toStrictEqual([5.56, 0, 5.56]);
});

test('a turned caption is written as a group turned about its anchor', () => {
  const turned = captionPrimitive({ ...CAPTION, rotation: 90 }, STYLE);
  const upright = captionPrimitive(CAPTION, STYLE);

  expect(captionMarkup(turned, '#000000')).toBe(
    '<g transform="rotate(90 0 0)"><text x="0" y="0" text-anchor="start" font-size="10" font-family="Arial, Helvetica, sans-serif" fill="#000000" stroke="none" xml:space="preserve"><tspan>ab</tspan></text></g>',
  );
  expect(captionMarkup(upright, '#000000')).toBe(
    '<text x="0" y="0" text-anchor="start" font-size="10" font-family="Arial, Helvetica, sans-serif" fill="#000000" stroke="none" xml:space="preserve"><tspan>ab</tspan></text>',
  );
});

test('a caption writes its runs as tspans in their own weight, slant and size, and skips empty lines', () => {
  const caption = captionPrimitive(
    {
      ...CAPTION,
      text: '**bold** *it* {14pt:<big>}\n\nH2O',
      family: "'Times New Roman', Times, serif",
      chemical: true,
    },
    STYLE,
  );

  expect(captionMarkup(caption, '#ff0000')).toBe(
    `<text x="0" y="0" text-anchor="start" font-size="10" font-family="'Times New Roman', Times, serif" fill="#ff0000" stroke="none" xml:space="preserve"><tspan font-weight="bold">bold</tspan><tspan> </tspan><tspan font-style="italic">it</tspan><tspan> </tspan><tspan font-size="14">&lt;big&gt;</tspan></text>` +
      `<text x="0" y="25" text-anchor="start" font-size="10" font-family="'Times New Roman', Times, serif" fill="#ff0000" stroke="none" xml:space="preserve"><tspan>H</tspan><tspan dy="2.5" font-size="7">2</tspan><tspan dy="-2.5">O</tspan></text>`,
  );
});

test('the SVG of a fragment label sets the charge back over its count', () => {
  const caption = captionPrimitive(
    {
      type: 'text',
      id: '',
      x: 100,
      y: 50,
      text: '{{C8H17(+)}}\n*m/z* 113.13',
      align: 'left',
      chemical: false,
    },
    STYLE,
  );

  expect(captionMarkup(caption, '#000000')).toContain(
    '<tspan dy="2.5" font-size="7">17</tspan><tspan dx="-7.78" dy="-6.5" font-size="7">+</tspan></text>',
  );
});

test('a caption ending on a stacked charge is set from its start, shifted back', () => {
  const caption = captionPrimitive(
    { ...CAPTION, x: 100, text: '{{H3O(+)}}', align: 'right', chemical: false },
    STYLE,
  );
  const markup = captionMarkup(caption, '#000000');

  expect(markup.startsWith('<text x="100" ')).toBe(true);
  expect(caption.anchor).toBe('end');
  expect(markup).toContain('text-anchor="end"');

  const stacked = captionPrimitive(
    {
      ...CAPTION,
      x: 100,
      text: '{{C6H12(+)}}',
      align: 'right',
      chemical: false,
    },
    STYLE,
  );

  expect(stacked.widths[0]).toBeCloseTo(26.116, 10);
  expect(captionMarkup(stacked, '#000000')).toContain(
    '<text x="73.88" y="0" text-anchor="start"',
  );
});

test('a quarter turn stands the box of a caption on end', () => {
  const upright = primitivesBounds([captionPrimitive(CAPTION, STYLE)]);
  const turned = primitivesBounds([
    captionPrimitive({ ...CAPTION, rotation: 90 }, STYLE),
  ]);

  expect(upright).toStrictEqual({ x: 0, y: -9, width: 11.12, height: 12 });
  expect(turned?.x).toBeCloseTo(-3, 10);
  expect(turned?.y).toBeCloseTo(0, 10);
  expect(turned?.width).toBeCloseTo(12, 10);
  expect(turned?.height).toBeCloseTo(11.12, 10);
});

test('the corners of a caption stand off its text by the pad, on the side it is aligned', () => {
  expect(captionCorners(captionPrimitive(CAPTION, STYLE), 1)).toStrictEqual([
    { x: -1, y: -10 },
    { x: 12.12, y: -10 },
    { x: 12.12, y: 4 },
    { x: -1, y: 4 },
  ]);

  const right = captionPrimitive({ ...CAPTION, align: 'right' }, STYLE);

  expect(captionCorners(right)).toStrictEqual([
    { x: -11.12, y: -9 },
    { x: 0, y: -9 },
    { x: 0, y: 3 },
    { x: -11.12, y: 3 },
  ]);
});

test('a turned caption is hit where it is drawn, not where it stood', () => {
  const slanted = captionPrimitive({ ...CAPTION, rotation: 45 }, STYLE);
  const standing = captionPrimitive({ ...CAPTION, rotation: 90 }, STYLE);

  // Along the slanted line, 8 pt from the anchor.
  expect(captionContains(slanted, { x: 5.66, y: 5.66 }, 0)).toBe(true);
  // Inside the upright box that frames it, but off the text itself.
  expect(captionContains(slanted, { x: 12, y: -4 }, 0)).toBe(false);
  // Where the upright text would have been.
  expect(captionContains(standing, { x: 8, y: -4 }, 0)).toBe(false);
  expect(captionContains(standing, { x: -1, y: 8 }, 0)).toBe(true);
});

test('a reach widens the box a caption is hit by, half on each side', () => {
  const upright = captionPrimitive(CAPTION, STYLE);

  expect(captionContains(upright, { x: 12, y: 0 }, 0)).toBe(false);
  expect(captionContains(upright, { x: 12, y: 0 }, 2)).toBe(true);
  expect(captionContains(upright, { x: 5, y: 4.5 }, 2)).toBe(false);
});
