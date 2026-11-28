/**
 * A caption on an editor's canvas: the family's caption markup inside a group
 * the end-to-end suites find, behind an invisible outline it is picked up by.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { DrawText } from '../../core/captions.ts';
import { STYLE } from '../../render/__tests__/drawingStyle.ts';
import { captionMarkup } from '../../render/captionMarkup.ts';
import { captionCorners, captionPrimitive } from '../../render/captions.ts';
import { CaptionView } from '../CaptionView.tsx';

const CAPTION: DrawText = { type: 'text', id: 'c1', x: 10, y: 20, text: 'H2O' };

function noop(): void {
  // Nothing is pressed in a static render.
}

function corners(reach: number): string {
  const points = captionCorners(captionPrimitive(CAPTION, STYLE), reach);
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

test('a caption is its markup behind an outline reaching 3 points round it', () => {
  const html = renderToStaticMarkup(
    <CaptionView
      caption={CAPTION}
      style={STYLE}
      selected={false}
      className="bench-item"
      onGrab={noop}
      onOpen={noop}
    />,
  );

  expect(html).toBe(
    `<g class="bench-item" data-testid="caption" data-id="c1" data-x="10" data-y="20"><polygon points="${corners(3)}" fill="transparent" stroke="none"></polygon><g>${captionMarkup(captionPrimitive(CAPTION, STYLE), '#000000')}</g></g>`,
  );
});

test('a selected caption in its own colour, with a wider reach and its own test id', () => {
  const html = renderToStaticMarkup(
    <CaptionView
      caption={{ ...CAPTION, color: '#aa0000' }}
      style={STYLE}
      selected
      className="biology-item"
      reach={4}
      testId="label"
      position={false}
      onGrab={noop}
      onOpen={noop}
    />,
  );

  expect(html).toContain(
    '<g class="biology-item is-selected" data-testid="label" data-id="c1">',
  );
  expect(html).toContain(`points="${corners(4)}"`);
  expect(html).toContain('fill="#aa0000"');
});

test('a caption being typed into is not drawn', () => {
  expect(
    renderToStaticMarkup(
      <CaptionView
        caption={CAPTION}
        style={STYLE}
        selected={false}
        className="bench-item"
        hidden
        onGrab={noop}
        onOpen={noop}
      />,
    ),
  ).toBe('');
});
