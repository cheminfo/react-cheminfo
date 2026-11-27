import { expect, test } from 'vitest';

import type { DrawGraphic } from '../../core/graphics.ts';
import { graphicPath, graphicPrimitive } from '../graphics.ts';
import { primitiveMarkup } from '../primitiveMarkup.ts';

import { STYLE } from './drawingStyle.ts';

const BOX: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
};

test('each shape is one path through its corners or round its box', () => {
  expect(graphicPath(BOX)).toBe('M0 0L20 0L20 10L0 10Z');
  expect(graphicPath({ ...BOX, radius: 2 })).toBe(
    'M2 0L18 0C19.1 0 20 0.9 20 2L20 8C20 9.1 19.1 10 18 10L2 10C0.9 10 0 9.1 0 8L0 2C0 0.9 0.9 0 2 0Z',
  );
  // A radius larger than the box allows rounds it into a stadium, no more.
  expect(graphicPath({ ...BOX, radius: 50 })).toBe(
    'M5 0L15 0C17.76 0 20 2.24 20 5L20 5C20 7.76 17.76 10 15 10L5 10C2.24 10 0 7.76 0 5L0 5C0 2.24 2.24 0 5 0Z',
  );
  expect(graphicPath({ ...BOX, kind: 'ellipse' })).toBe(
    'M0 5A10 5 0 1 0 20 5A10 5 0 1 0 0 5Z',
  );

  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 8 },
  ];

  expect(
    graphicPath({ type: 'graphic', id: 'd2', kind: 'polygon', points }),
  ).toBe('M0 0L10 0L5 8Z');
  expect(
    graphicPath({ type: 'graphic', id: 'd2', kind: 'polyline', points }),
  ).toBe('M0 0L10 0L5 8');
});

test('a curve is one cubic piece per side, through every point', () => {
  const arc = [
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 20, y: 0 },
  ];

  expect(
    graphicPath({
      type: 'graphic',
      id: 'd2',
      kind: 'polyline',
      points: arc,
      smooth: true,
    }),
  ).toBe('M0 0C0 -4.71 5.29 -10 10 -10C14.71 -10 20 -4.71 20 0');
  expect(
    graphicPath({
      type: 'graphic',
      id: 'd2',
      kind: 'polygon',
      points: arc,
      smooth: true,
    }),
  ).toMatch(/^M0 0(?:C[^C]*){3}Z$/);
  // A point given control points by hand is drawn through them.
  expect(
    graphicPath({
      type: 'graphic',
      id: 'd2',
      kind: 'polyline',
      points: arc,
      smooth: true,
      controls: [
        null,
        { before: { x: 6, y: -12 }, after: { x: 14, y: -8 } },
        null,
      ],
    }),
  ).toBe('M0 0C0 -4.71 6 -12 10 -10C14 -8 20 -4.71 20 0');
  // Two points are a straight side however they are drawn.
  expect(
    graphicPath({
      type: 'graphic',
      id: 'd2',
      kind: 'polyline',
      points: arc.slice(0, 2),
      smooth: true,
    }),
  ).toBe('M0 0L10 -10');
});

test('a fill is written as a colour and an opacity, which every editor reads', () => {
  const primitive = graphicPrimitive(
    {
      ...BOX,
      lineWidth: 1,
      dashed: true,
      fill: '#0072b280',
      outline: false,
    },
    STYLE,
  );

  expect(primitive).toStrictEqual({
    kind: 'path',
    d: 'M0 0L20 0L20 10L0 10Z',
    width: 1,
    extent: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 },
    ],
    dash: [5, 3],
    fill: '#0072b280',
    outline: false,
  });
  expect(primitiveMarkup(primitive, STYLE)).toBe(
    '<path d="M0 0L20 0L20 10L0 10Z" stroke-width="1" stroke-dasharray="5 3" stroke-linecap="butt" fill="#0072b2" fill-opacity="0.5" stroke="none"/>',
  );
  expect(primitiveMarkup(graphicPrimitive(BOX, STYLE), STYLE)).toBe(
    '<path d="M0 0L20 0L20 10L0 10Z"/>',
  );
});
