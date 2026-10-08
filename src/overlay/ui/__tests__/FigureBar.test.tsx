import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { FigureBar } from '../FigureBar.tsx';

test('a figure bar is chrome that never reaches paper or a saved file', () => {
  const html = renderToStaticMarkup(
    <FigureBar tools={<span>Save</span>}>
      <span>Scale</span>
    </FigureBar>,
  );

  expect(html).toMatch(
    /^<div class="figure-bar no-print" data-figure="chrome">/,
  );
  expect(html).toContain('<span>Scale</span>');
  expect(html).toContain('<span>Save</span>');
});

test('a figure bar spans the width in the flow, on the compact metrics', () => {
  const html = renderToStaticMarkup(
    <FigureBar className="extra" testId="bar">
      <span>Scale</span>
    </FigureBar>,
  );

  expect(html).toContain('class="figure-bar no-print extra"');
  expect(html).toContain('data-testid="bar"');
  expect(html).toContain('position:relative;display:flex;width:100%');
  expect(html).toContain('gap:4px;padding:3px 6px');
  expect(html).toContain(
    'border-bottom:1px solid var(--border);background:var(--surface)',
  );
});

test('a figure bar reads its settings from the left and keeps the glyphs right', () => {
  const html = renderToStaticMarkup(
    <FigureBar end={<span>Colour by</span>} tools={<span>Save</span>}>
      <span>Scale</span>
    </FigureBar>,
  );

  const scale = html.indexOf('<span>Scale</span>');
  const colour = html.indexOf('<span>Colour by</span>');
  const save = html.indexOf('<span>Save</span>');

  expect(scale).toBeLessThan(colour);
  expect(colour).toBeLessThan(save);
  // The settings and the glyphs are the two sides of one group set apart.
  expect(html).toContain(
    'flex:1 1 auto;align-items:center;justify-content:space-between',
  );
  expect(html).toMatch(
    /<span>Colour by<\/span><\/div><div style="[^"]*"><span>Save<\/span>/,
  );
});

test('a resting bar is the page’s grey: quiet faded, hidden empty, both at full height', () => {
  const visible = renderToStaticMarkup(
    <FigureBar tools={<span>Save</span>}>
      <span>Scale</span>
    </FigureBar>,
  );
  const quiet = renderToStaticMarkup(
    <FigureBar rest="quiet" tools={<span>Save</span>}>
      <span>Scale</span>
    </FigureBar>,
  );
  const hidden = renderToStaticMarkup(
    <FigureBar rest="hidden" tools={<span>Save</span>}>
      <span>Scale</span>
    </FigureBar>,
  );

  expect(visible).not.toContain('opacity');
  expect(quiet).toContain('opacity:0.45;transition:opacity 150ms ease-out');
  expect(hidden).toContain('opacity:0;transition:opacity 150ms ease-out');
  // The ground and its hairline fade to the page's grey, and the strip keeps
  // its place.
  expect(quiet).toContain(
    'border-bottom:1px solid var(--border);background:var(--surface);pointer-events:none;opacity:0.08',
  );
  expect(visible).not.toContain('opacity:0.08');
  expect(hidden).toContain('<span>Scale</span>');
});
