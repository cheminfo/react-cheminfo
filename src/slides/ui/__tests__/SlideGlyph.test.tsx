import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SlideGlyph } from '../SlideGlyph.tsx';
import { sectionWithGlyph } from '../sectionWithGlyph.tsx';

function Ring(): ReactElement {
  return <circle cx={310} cy={120} r={96} />;
}

const GLYPHS = { ring: Ring };

test('a slide’s cartoon is drawn on its canvas, in the corner by default', () => {
  expect(renderToStaticMarkup(<SlideGlyph glyphs={GLYPHS} id="ring" />)).toBe(
    '<svg class="slide-glyph slide-glyph--corner keep-motion" viewBox="0 0 620 240" aria-hidden="true"><circle cx="310" cy="120" r="96"></circle></svg>',
  );
});

test('the site’s own class is carried, and suffixed with the place', () => {
  const html = renderToStaticMarkup(
    <SlideGlyph glyphs={GLYPHS} id="ring" place="figure" className="sg" />,
  );

  expect(html).toContain(
    'class="slide-glyph slide-glyph--figure keep-motion sg sg--figure"',
  );
});

test('a name nothing answers draws nothing, even one an object inherits', () => {
  expect(renderToStaticMarkup(<SlideGlyph glyphs={GLYPHS} id="flask" />)).toBe(
    '',
  );
  expect(
    renderToStaticMarkup(<SlideGlyph glyphs={GLYPHS} id="constructor" />),
  ).toBe('');
});

test('the section layout draws the divider with the cartoon its marker names', () => {
  const Section = sectionWithGlyph(GLYPHS, { className: 'talk-glyph' });
  const html = renderToStaticMarkup(
    <Section
      slide={{ layout: 'section', body: '<!-- glyph: Ring -->\n\n# 1 · Rings' }}
      talkId="a"
      slideIndex={1}
      meta={{ title: 'A' }}
    />,
  );

  expect(html).toContain('<h1 class="section-title">Rings</h1>');
  expect(html).not.toContain('glyph:');
  expect(html).toContain(
    'class="slide-glyph slide-glyph--corner keep-motion talk-glyph talk-glyph--corner"',
  );
});
