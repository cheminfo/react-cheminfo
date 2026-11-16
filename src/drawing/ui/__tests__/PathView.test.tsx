/**
 * A path drawn on screen as the saved file writes it: its stroke, its dashes,
 * its fill and the gradient that fill names.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { DrawGraphic } from '../../core/graphics.ts';
import { graphicPrimitive } from '../../render/graphics.ts';
import type { Scene } from '../../render/primitives.ts';
import { GradientDefs } from '../GradientDefs.tsx';
import { PathView } from '../PathView.tsx';

const STYLE = { lineWidth: 0.6 };

const BOX: DrawGraphic = {
  type: 'graphic',
  id: 'd1',
  kind: 'rectangle',
  x: 0,
  y: 0,
  width: 20,
  height: 10,
};

function sceneOf(graphic: DrawGraphic): Scene {
  return {
    items: [
      {
        owner: { kind: 'graphic', id: graphic.id },
        primitives: [graphicPrimitive(graphic, STYLE)],
      },
    ],
    bounds: { x: 0, y: 0, width: 20, height: 10 },
  };
}

test('a path leaves the drawing width to its group, and writes its dashes and its fill', () => {
  expect(
    renderToStaticMarkup(
      <PathView primitive={graphicPrimitive(BOX, STYLE)} style={STYLE} />,
    ),
  ).toBe('<path d="M0 0L20 0L20 10L0 10Z"></path>');

  const filled = graphicPrimitive(
    { ...BOX, lineWidth: 1, dashed: true, fill: '#0072b280', outline: false },
    STYLE,
  );

  expect(
    renderToStaticMarkup(<PathView primitive={filled} style={STYLE} />),
  ).toBe(
    '<path d="M0 0L20 0L20 10L0 10Z" stroke-width="1" stroke-dasharray="5 3" stroke-linecap="butt" fill="#0072b2" fill-opacity="0.5" stroke="none"></path>',
  );
});

test('a gradient fill names the gradient its defs lay out once', () => {
  const shaded: DrawGraphic = {
    ...BOX,
    fill: '#56b4e9',
    gradient: { kind: 'linear', color: '#000000' },
  };

  expect(
    renderToStaticMarkup(
      <PathView primitive={graphicPrimitive(shaded, STYLE)} style={STYLE} />,
    ),
  ).toBe(
    '<path d="M0 0L20 0L20 10L0 10Z" fill="url(#cd-linear_0_5_20_5_056b4e9_1000000)"></path>',
  );

  const defs = renderToStaticMarkup(<GradientDefs scene={sceneOf(shaded)} />);

  expect(defs).toContain(
    '<defs><linearGradient id="cd-linear_0_5_20_5_056b4e9_1000000" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="20" y2="5">',
  );
  expect(defs.match(/<stop /g)).toHaveLength(2);
  expect(renderToStaticMarkup(<GradientDefs scene={sceneOf(BOX)} />)).toBe('');
});
