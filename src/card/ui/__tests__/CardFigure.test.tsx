import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CardFigure } from '../CardFigure.tsx';

test('the figure carries its glyph column, the picture glyph last', () => {
  const html = renderToStaticMarkup(
    <CardFigure
      fileName="titration"
      tools={<button type="button">table</button>}
    >
      <svg data-testid="curve" />
    </CardFigure>,
  );

  expect(html).toMatch(/^<div class="card-figure">/);
  expect(html).toContain('class="card-figure__drawing"');
  expect(html).toContain('<svg data-testid="curve"></svg>');
  expect(html).toContain('data-testid="figure-tools"');
  expect(html).toContain('aria-label="Copy or save the picture — PNG"');
  expect(html).toContain('data-testid="card-save-figure"');
  expect(html.indexOf('>table<')).toBeLessThan(
    html.indexOf('data-testid="card-save-figure"'),
  );
  expect(html).not.toContain('data-figure="html"');
});

test('a grid of HTML cells fills the card and is painted as it is seen', () => {
  const html = renderToStaticMarkup(
    <CardFigure
      fileName="isomers"
      className="isomer-grid"
      fill
      html
      label="Copy or save the isomers"
    >
      <div>C6H6</div>
    </CardFigure>,
  );

  expect(html).toMatch(/^<div class="card-figure card-figure--fill">/);
  expect(html).toContain('class="card-figure__drawing isomer-grid"');
  expect(html).toContain('data-figure="html"');
  expect(html).toContain('aria-label="Copy or save the isomers — PNG"');
});
