/**
 * The one-sentence band across a figure: floating over an edge as a gradient
 * that leaves the pointer alone, or docked below in the flow; quiet when it
 * explains, strong and announced when it reports what the reader just did.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayCaption } from '../OverlayCaption.tsx';

test('by default it floats on the bottom edge, quiet, and lets the pointer through', () => {
  const html = renderToStaticMarkup(
    <OverlayCaption>Each dot is one sample.</OverlayCaption>,
  );

  expect(html).toMatch(
    /^<div style="position:absolute;left:0;right:0;bottom:0;/,
  );
  expect(html).toContain('linear-gradient(to top,');
  expect(html).toContain('pointer-events:none');
  expect(html).toContain('color:var(--text-muted)');
  expect(html).toContain('font-weight:400');
  expect(html).not.toContain('aria-live');
  expect(html).toContain('>Each dot is one sample.</span>');
});

test('on the top edge it fades the other way', () => {
  const html = renderToStaticMarkup(
    <OverlayCaption edge="top">Drag to select.</OverlayCaption>,
  );

  expect(html).toMatch(/^<div style="position:absolute;left:0;right:0;top:0;/);
  expect(html).toContain('linear-gradient(to bottom,');
});

test('docked below, it is a row of the flow with no ground of its own', () => {
  const html = renderToStaticMarkup(
    <OverlayCaption placement="below" edge="top">
      Each dot is one sample.
    </OverlayCaption>,
  );

  expect(html).toMatch(/^<div style="display:flex;align-items:center"><span/);
  expect(html).not.toContain('gradient');
});

test('live state is strong, and a screen reader is told when it changes', () => {
  const html = renderToStaticMarkup(
    <OverlayCaption tone="strong" live>
      31 samples selected
    </OverlayCaption>,
  );

  expect(html).toContain('color:var(--text);');
  expect(html).toContain('font-weight:600');
  expect(html).toContain('aria-live="polite" aria-atomic="true"');
});
