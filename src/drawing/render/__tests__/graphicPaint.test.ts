import { expect, test } from 'vitest';

import type { DrawGraphic } from '../../core/graphics.ts';
import type { GradientPaint } from '../gradients.ts';
import { gradientId, gradientMarkup } from '../gradients.ts';
import { gradientPaint } from '../graphicPaint.ts';
import { graphicPrimitive } from '../graphics.ts';
import type { Scene } from '../primitives.ts';
import type { DrawingStyle } from '../style.ts';
import { sceneBody } from '../svg.ts';

const STYLE: DrawingStyle = {
  bondLength: 14.4,
  lineWidth: 0.6,
  fontFamily: 'Arial, Helvetica, sans-serif',
  captionSize: 10,
  captionFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

const BOX: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
  fill: '#56b4e9',
  gradient: { kind: 'linear', color: '#000000' },
};

function paintOf(graphic: DrawGraphic): GradientPaint {
  const paint = gradientPaint(graphic);
  if (!paint) throw new Error('No gradient');
  return paint;
}

function markup(graphic: DrawGraphic): string {
  return gradientMarkup(paintOf(graphic));
}

// The scene of shapes drawn as they are, one item each.
function sceneOf(...graphics: DrawGraphic[]): Scene {
  return {
    items: graphics.map((graphic) => ({
      owner: { kind: 'graphic', id: graphic.id },
      primitives: [graphicPrimitive(graphic, STYLE)],
    })),
    bounds: { x: 0, y: 0, width: 20, height: 10 },
  };
}

test('a linear gradient runs from edge to edge in its direction', () => {
  expect(gradientPaint(BOX)).toStrictEqual({
    kind: 'linear',
    from: { x: 0, y: 5 },
    to: { x: 20, y: 5 },
    stops: [
      { offset: 0, color: '#56b4e9' },
      { offset: 1, color: '#000000' },
    ],
  });
  expect(markup(BOX)).toBe(
    '<linearGradient id="cd-linear_0_5_20_5_056b4e9_1000000" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="20" y2="5"><stop offset="0" stop-color="#56b4e9"/><stop offset="1" stop-color="#000000"/></linearGradient>',
  );
});

test('a reflected gradient turns with its box, the fill in the middle', () => {
  const rod: DrawGraphic = {
    ...BOX,
    rotation: 30,
    fill: '#f4f4f4',
    gradient: { kind: 'reflected', color: '#8c8c8c80', angle: 90 },
  };

  expect(markup(rod)).toBe(
    '<linearGradient id="cd-linear_12.5_0.67_7.5_9.33_08c8c8c80_0.5f4f4f4_18c8c8c80" gradientUnits="userSpaceOnUse" x1="12.5" y1="0.67" x2="7.5" y2="9.33"><stop offset="0" stop-color="#8c8c8c" stop-opacity="0.5"/><stop offset="0.5" stop-color="#f4f4f4"/><stop offset="1" stop-color="#8c8c8c" stop-opacity="0.5"/></linearGradient>',
  );
});

test('a radial gradient fills an ellipse to its rim and a rectangle to its corners', () => {
  const ellipse: DrawGraphic = {
    type: 'graphic',
    id: 'd2',
    kind: 'ellipse',
    x: 10,
    y: 20,
    width: 40,
    height: 20,
    rotation: 15,
    fill: '#ffffff',
    gradient: { kind: 'radial', color: '#b8b8b8' },
  };

  expect(markup(ellipse)).toBe(
    '<radialGradient id="cd-radial_30_30_20_10_15_0ffffff_1b8b8b8" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(30 30) rotate(15) scale(20 10)"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b8b8b8"/></radialGradient>',
  );
  expect(
    gradientPaint({ ...BOX, gradient: { kind: 'radial', color: '#000000' } }),
  ).toMatchObject({
    centre: { x: 10, y: 5 },
    radii: { x: 14.14, y: 7.07 },
  });
});

test('a radial gradient lit from a corner reaches the far corner', () => {
  const lit: DrawGraphic = {
    ...BOX,
    fill: '#ffffff',
    gradient: { kind: 'radial', color: '#000000', centre: { x: -1, y: -1 } },
  };

  expect(gradientPaint(lit)).toMatchObject({
    kind: 'radial',
    centre: { x: 0, y: 0 },
    // Twice the half diagonal: 2√2 half sides.
    radii: { x: 28.28, y: 14.14 },
  });

  const ellipse: DrawGraphic = {
    ...lit,
    kind: 'ellipse',
    rotation: 90,
    gradient: { kind: 'radial', color: '#000000', centre: { x: 1, y: 0 } },
  };

  // Its right end, turned a quarter, is at the bottom; the far rim two radii away.
  expect(gradientPaint(ellipse)).toMatchObject({
    centre: { x: 10, y: 15 },
    radii: { x: 20, y: 10 },
    rotation: 90,
  });
});

test('a path is shaded across the box around it, and nothing unfilled is', () => {
  const triangle: DrawGraphic = {
    type: 'graphic',
    id: 'd3',
    kind: 'polygon',
    points: [
      { x: 40, y: 0 },
      { x: 60, y: 0 },
      { x: 50, y: 10 },
    ],
    fill: '#e69f00',
    gradient: { kind: 'linear', color: '#ffffff', angle: 180 },
  };

  expect(gradientPaint(triangle)).toMatchObject({
    kind: 'linear',
    from: { x: 60, y: 5 },
  });

  const { fill: _fill, ...unfilled } = BOX;

  expect(gradientPaint(unfilled)).toBeUndefined();

  const { gradient: _gradient, ...flat } = BOX;

  expect(gradientPaint(flat)).toBeUndefined();
});

test('a gradient is named by what it paints', () => {
  const same = paintOf({ ...BOX, id: 'd9' });
  const other = paintOf({
    ...BOX,
    gradient: { kind: 'linear', color: '#ffffff' },
  });

  expect(gradientId(same)).toBe('cd-linear_0_5_20_5_056b4e9_1000000');
  expect(gradientId(other)).toBe('cd-linear_0_5_20_5_056b4e9_1ffffff');
});

test('the file writes each gradient once, before the shapes filled with it', () => {
  const body = sceneBody(sceneOf(BOX, { ...BOX, id: 'd2' }), { style: STYLE });

  expect(body.match(/<defs>/g)).toHaveLength(1);
  expect(body.match(/<linearGradient /g)).toHaveLength(1);
  expect(
    body.match(/fill="url\(#cd-linear_0_5_20_5_056b4e9_1000000\)"/g),
  ).toHaveLength(2);
  expect(body.indexOf('<defs>')).toBeLessThan(body.indexOf('<path'));

  const flat = sceneBody(sceneOf({ ...BOX, gradient: undefined }), {
    style: STYLE,
  });

  expect(flat).not.toContain('<defs>');
  expect(flat).toContain('fill="#56b4e9"');
});
