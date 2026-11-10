/**
 * One primitive as an SVG element: its stroke written only where it differs
 * from the drawing's, a fill as a colour and an opacity, and the bubbles and
 * runs of glassware written so a file draws them still.
 */

import { expect, test } from 'vitest';

import type { CaptionPrimitive, PathPrimitive } from '../primitives.ts';
import type { DrawingStyle } from '../style.ts';
import { primitiveMarkup } from '../svg.ts';

const STYLE: DrawingStyle = {
  bondLength: 14.4,
  lineWidth: 0.6,
  fontFamily: 'Arial, Helvetica, sans-serif',
  captionSize: 10,
  captionFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

function path(extra: Partial<PathPrimitive> = {}): PathPrimitive {
  return { kind: 'path', d: 'M0 0L1 1', width: 0.6, extent: [], ...extra };
}

test('a line writes its width and dashes only where they differ from the style', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 10, y: 5.555 };

  expect(primitiveMarkup({ kind: 'line', from, to, width: 0.6 }, STYLE)).toBe(
    '<line x1="0" y1="0" x2="10" y2="5.56"/>',
  );
  expect(
    primitiveMarkup(
      { kind: 'line', from, to, width: 1.2, dash: [2, 1.5] },
      STYLE,
    ),
  ).toBe(
    '<line x1="0" y1="0" x2="10" y2="5.56" stroke-width="1.2" stroke-dasharray="2 1.5" stroke-linecap="butt"/>',
  );
});

test('polygons, dots and texts are filled with the ink they are given', () => {
  const triangle = {
    kind: 'polygon' as const,
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  };

  expect(primitiveMarkup(triangle, STYLE)).toBe(
    '<polygon points="0,0 1,0 0,1" fill="#000000" stroke="none"/>',
  );
  expect(primitiveMarkup(triangle, STYLE, '#0072b2')).toBe(
    '<polygon points="0,0 1,0 0,1" fill="#0072b2" stroke="none"/>',
  );
  expect(
    primitiveMarkup({ kind: 'dot', x: 1, y: 2, r: 0.75 }, STYLE, '#009e73'),
  ).toBe('<circle cx="1" cy="2" r="0.75" fill="#009e73" stroke="none"/>');

  const text = { kind: 'text' as const, text: 'a<b', x: 1, y: 2, size: 10 };

  expect(primitiveMarkup(text, STYLE)).toBe(
    '<text x="1" y="2" font-size="10" fill="#000000" stroke="none">a&lt;b</text>',
  );
  expect(primitiveMarkup({ ...text, color: '#d55e00' }, STYLE)).toBe(
    '<text x="1" y="2" font-size="10" fill="#d55e00" stroke="none">a&lt;b</text>',
  );
});

test('a path writes its own stroke, and a fill as a colour and an opacity', () => {
  expect(primitiveMarkup(path(), STYLE)).toBe('<path d="M0 0L1 1"/>');
  expect(
    primitiveMarkup(
      path({ fill: '#e69f0080', color: '#56b4e9', width: 2, dash: [1, 2] }),
      STYLE,
    ),
  ).toBe(
    '<path d="M0 0L1 1" stroke-width="2" stroke="#56b4e9" stroke-dasharray="1 2" stroke-linecap="butt" fill="#e69f00" fill-opacity="0.5"/>',
  );
  expect(
    primitiveMarkup(path({ fill: '#E69F00', outline: false }), STYLE),
  ).toBe('<path d="M0 0L1 1" fill="#e69f00" stroke="none"/>');
  expect(primitiveMarkup(path({ outline: false }), STYLE)).toBe(
    '<path d="M0 0L1 1" stroke="none"/>',
  );
});

test('a path drawn without its outline writes one stroke, none, whatever its colour', () => {
  expect(
    primitiveMarkup(
      path({ fill: '#e69f00', color: '#56b4e9', outline: false }),
      STYLE,
    ),
  ).toBe('<path d="M0 0L1 1" fill="#e69f00" stroke="none"/>');
});

test('a bubble is written to rise a step behind the one under it', () => {
  expect(primitiveMarkup(path({ bubble: 1 }), STYLE)).toBe(
    '<path class="glass-bubble" style="animation-delay: -0.35s" d="M0 0L1 1"/>',
  );
});

test('a run is written hidden, and a still copy beside it when it stands', () => {
  const flow = { path: 'M0 0L0 -5', begin: 0.5, duration: 2 };
  const run =
    '<path class="glass-run" display="none" d="M0 0L1 1"><animateMotion path="M0 0L0 -5" begin="0.50s" dur="2.00s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" begin="0.50s" dur="2.00s" repeatCount="indefinite"/></path>';

  expect(primitiveMarkup(path({ flow }), STYLE)).toBe(run);
  expect(primitiveMarkup(path({ flow: { ...flow, still: true } }), STYLE)).toBe(
    `<path class="glass-stands" d="M0 0L1 1"/>${run}`,
  );
});

test('a caption is written as its text, in the ink given', () => {
  const caption: CaptionPrimitive = {
    kind: 'caption',
    x: 0,
    y: 0,
    anchor: 'start',
    size: 10,
    family: 'Arial',
    baselines: [0],
    sizes: [10],
    lines: [[{ text: 'ab' }]],
    widths: [11.12],
    rotation: 0,
  };

  expect(primitiveMarkup(caption, STYLE, '#0072b2')).toBe(
    '<text x="0" y="0" text-anchor="start" font-size="10" font-family="Arial" fill="#0072b2" stroke="none" xml:space="preserve"><tspan>ab</tspan></text>',
  );
});

test('an image is stretched to its box and turned about its centre', () => {
  const image = {
    kind: 'image' as const,
    href: 'data:image/png;base64,A&B',
    x: 0,
    y: 0,
    width: 40,
    height: 20,
    rotation: 0,
  };

  expect(primitiveMarkup(image, STYLE)).toBe(
    '<image x="0" y="0" width="40" height="20" preserveAspectRatio="none" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="data:image/png;base64,A&amp;B"/>',
  );
  expect(primitiveMarkup({ ...image, rotation: 90 }, STYLE)).toBe(
    '<image x="0" y="0" width="40" height="20" preserveAspectRatio="none" transform="rotate(90 20 10)" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="data:image/png;base64,A&amp;B"/>',
  );
});
