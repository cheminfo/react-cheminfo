import { expect, test } from 'vitest';

import type { GradientPaint, RadialPaint } from '../gradients.ts';
import {
  gradientDefs,
  gradientId,
  gradientMarkup,
  radialTransform,
  sceneGradients,
} from '../gradients.ts';
import type { PathPrimitive, Scene } from '../primitives.ts';
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

const LINEAR: GradientPaint = {
  kind: 'linear',
  from: { x: 0, y: 5 },
  to: { x: 20, y: 5 },
  stops: [
    { offset: 0, color: '#56b4e9' },
    { offset: 1, color: '#000000' },
  ],
};

const RADIAL: RadialPaint = {
  kind: 'radial',
  centre: { x: 10, y: 5 },
  radii: { x: 10, y: 5 },
  rotation: 30,
  stops: [
    { offset: 0, color: '#ffffff' },
    { offset: 1, color: '#8c8c8c80' },
  ],
};

function filled(id: string, gradient?: GradientPaint): Scene {
  const box: PathPrimitive = {
    kind: 'path',
    d: 'M0 0L20 0L20 10L0 10Z',
    width: 0.6,
    extent: [],
    fill: '#56b4e9',
    ...(gradient ? { gradient } : {}),
  };
  return {
    items: [{ owner: { kind: 'graphic', id }, primitives: [box] }],
    bounds: { x: 0, y: 0, width: 20, height: 10 },
  };
}

test('a gradient is named by what it paints', () => {
  expect(gradientId(LINEAR)).toBe('cd-linear_0_5_20_5_056b4e9_1000000');
  expect(
    gradientId({
      ...LINEAR,
      stops: [LINEAR.stops[0] as never, { offset: 1, color: '#FFFFFF' }],
    }),
  ).toBe('cd-linear_0_5_20_5_056b4e9_1ffffff');
  expect(gradientId(RADIAL)).toBe('cd-radial_10_5_10_5_30_0ffffff_18c8c8c80');
});

test("a gradient is written in the page's own points, its opacity apart", () => {
  expect(gradientMarkup(LINEAR)).toBe(
    '<linearGradient id="cd-linear_0_5_20_5_056b4e9_1000000" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="20" y2="5"><stop offset="0" stop-color="#56b4e9"/><stop offset="1" stop-color="#000000"/></linearGradient>',
  );
  expect(radialTransform(RADIAL)).toBe(
    'translate(10 5) rotate(30) scale(10 5)',
  );
  expect(radialTransform({ ...RADIAL, rotation: 0 })).toBe(
    'translate(10 5) scale(10 5)',
  );
  expect(gradientMarkup(RADIAL)).toBe(
    '<radialGradient id="cd-radial_10_5_10_5_30_0ffffff_18c8c8c80" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(10 5) rotate(30) scale(10 5)"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8c8c8c" stop-opacity="0.5"/></radialGradient>',
  );
});

test('the file writes each gradient once, before the shapes filled with it', () => {
  const one = filled('d1', LINEAR);
  const scene: Scene = {
    ...one,
    items: [...one.items, ...filled('d2', LINEAR).items],
  };

  expect(sceneGradients(scene)).toStrictEqual([LINEAR]);

  const body = sceneBody(scene, { style: STYLE });

  expect(body.match(/<defs>/g)).toHaveLength(1);
  expect(body.match(/<linearGradient /g)).toHaveLength(1);
  expect(
    body.match(/fill="url\(#cd-linear_0_5_20_5_056b4e9_1000000\)"/g),
  ).toHaveLength(2);
  expect(body.indexOf('<defs>')).toBeLessThan(body.indexOf('<path'));
});

test('a shape filled flat writes its colour and no gradient', () => {
  const body = sceneBody(filled('d1'), { style: STYLE });

  expect(gradientDefs(filled('d1'))).toBe('');
  expect(body).not.toContain('<defs>');
  expect(body).toContain('fill="#56b4e9"');
});
