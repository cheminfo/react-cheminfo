/**
 * A caption drawn live on a canvas: the same text elements as the markup a
 * saved figure writes, so the canvas and the file never disagree.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { DrawText } from '../../core/captions.ts';
import { STYLE } from '../../render/__tests__/drawingStyle.ts';
import { captionMarkup } from '../../render/captionMarkup.ts';
import { captionPrimitive } from '../../render/captions.ts';
import { CaptionText } from '../CaptionText.tsx';

const CAPTION: DrawText = {
  type: 'text',
  id: 'c1',
  x: 10,
  y: 20,
  text: 'Heat',
};

test('a one-line caption is the text element a saved figure writes', () => {
  const primitive = captionPrimitive(CAPTION, STYLE);
  const html = renderToStaticMarkup(
    <CaptionText caption={primitive} ink="#000000" />,
  );

  expect(html).toBe(`<g>${captionMarkup(primitive, '#000000')}</g>`);
});

test('each line is a text element of its own, the empty one left out', () => {
  const primitive = captionPrimitive(
    { ...CAPTION, text: 'Heat\n\nStir' },
    STYLE,
  );
  const html = renderToStaticMarkup(
    <CaptionText caption={primitive} ink="#aa0000" />,
  );

  expect(html.match(/<text /g)).toHaveLength(2);
  expect(html).toContain('<tspan>Heat</tspan>');
  expect(html).toContain('<tspan>Stir</tspan>');
  expect(html).toContain('fill="#aa0000"');
});

test('a turned caption is a group turned about its anchor', () => {
  const primitive = captionPrimitive({ ...CAPTION, rotation: 90 }, STYLE);
  const html = renderToStaticMarkup(
    <CaptionText caption={primitive} ink="#000000" />,
  );

  expect(html.startsWith('<g transform="rotate(90 10 20)">')).toBe(true);
});
