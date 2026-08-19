import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Slide as SlideData, TalkMeta } from '../../core/index.ts';
import type { SlideLayoutProps, SlideViewProps } from '../Slide.tsx';
import { SlideView } from '../Slide.tsx';

const META: TalkMeta = { title: 'ChemCalc', logos: ['/epfl.svg', '/zak.svg'] };

function render(slide: SlideData, extra: Partial<SlideViewProps> = {}) {
  return renderToStaticMarkup(
    <SlideView
      slide={slide}
      talkId="demo"
      slideIndex={4}
      meta={META}
      {...extra}
    />,
  );
}

test('a title slide carries its heading and the talk logos', () => {
  const html = render({
    layout: 'title',
    body: '# ChemCalc\n\n## Mass spectrometry in the browser',
  });

  expect(html).toContain('class="slide slide--title"');
  expect(html).toContain('<h1>ChemCalc</h1>');
  expect(html).toContain('<h2>Mass spectrometry in the browser</h2>');
  expect(html).toContain(
    '<div class="slide-logos"><img class="slide-logo" src="/epfl.svg" alt=""/><img class="slide-logo" src="/zak.svg" alt=""/></div>',
  );
});

test('a content slide renders its markdown and its demo links', () => {
  const html = render({
    layout: 'content',
    body: '## Finding a formula\n\n- monoisotopic mass\n- tolerance\n\n[Demo: mf finder](/mf-finder?targetMass=300)',
  });

  expect(html).toContain('class="slide slide--content"');
  expect(html).toContain('<h2>Finding a formula</h2>');
  expect(html).toContain('<li>monoisotopic mass</li>');
  expect(html).toContain('<span class="slide-demos-label">Live demos:</span>');
  expect(html).toContain(
    '<a class="slide-demo" href="/mf-finder?targetMass=300&amp;from=talk:demo:4">',
  );
  expect(html).toContain('<span class="slide-demo-label">Mf finder</span>');
});

test('only the title slide draws the logos', () => {
  const html = render({ layout: 'content', body: '## Results' });

  expect(html).not.toContain('slide-logos');
});

test('a layout nobody knows still renders its body, as content', () => {
  const html = render({ layout: 'sankey', body: '## Where the data goes' });

  expect(html).toContain('class="slide slide--content"');
  expect(html).toContain('<h2>Where the data goes</h2>');
});

test('a layout the site registered is the one that draws', () => {
  function Sankey(props: SlideLayoutProps) {
    return <div className="sankey">{props.slide.body}</div>;
  }

  const html = render(
    { layout: 'sankey', body: 'flow' },
    { layouts: { sankey: Sankey } },
  );

  expect(html).toBe('<div class="sankey">flow</div>');
});

test('a section divider sets its number apart from its title', () => {
  const html = render({
    layout: 'section',
    body: '# 2 · Isotopic distributions\n\n## What the peaks say',
  });

  expect(html).toContain(
    '<div class="section-number" aria-hidden="true">2</div>',
  );
  expect(html).toContain(
    '<h1 class="section-title">Isotopic distributions</h1>',
  );
  expect(html).toContain('<h2>What the peaks say</h2>');
});

test('a link out of the deck opens in a tab of its own', () => {
  const html = render({
    layout: 'content',
    body: 'See [the paper](https://doi.org/10.1000/xyz) for the method.',
  });

  expect(html).toContain(
    '<a href="https://doi.org/10.1000/xyz" target="_blank" rel="noreferrer">the paper</a>',
  );
});

test('the site draws the in-app links when it says how', () => {
  const html = render(
    { layout: 'content', body: '[Demo: masses](/mf)' },
    {
      renderLink: ({ href, children }) => (
        <a className="slide-demo router-link" href={href}>
          {children}
        </a>
      ),
    },
  );

  expect(html).toContain(
    '<a class="slide-demo router-link" href="/mf?from=talk:demo:4">',
  );
});

test('a deck played away from home keeps its links pointing at the site that wrote it', () => {
  const html = render(
    {
      layout: 'content',
      body: 'Try it.\n\n[Demo: the formula tool](/?mf=C6H12O6)',
    },
    { site: 'chemcalc', talkOrigin: 'https://www.chemcalc.org' },
  );

  expect(html).toContain(
    'href="https://www.chemcalc.org/?mf=C6H12O6&amp;from=talk:chemcalc:demo:4"',
  );
});
