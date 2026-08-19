import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import type { AboutContent } from '../../core/about.ts';
import { AboutPage } from '../AboutPage.tsx';

const SMILES: AboutContent = {
  siteId: 'smiles',
  what: 'Draw a structure and read the SMILES that describes it, atom by atom.',
  paragraphs: ['It replaces the SMILES tiles of the teaching visualizer.'],
  can: [
    'Draw a structure and read its SMILES.',
    'Paste a SMILES and see what it draws.',
    'Follow the notation one rule at a time.',
  ],
  credits: ['openchemlib', 'react'],
  cite: [PLATFORM_WORK],
  version: '2.4.0',
};

/**
 * Where each section starts in the page, in the order they must be read in.
 * @param html - The rendered page.
 * @returns The offset of each section, or -1 for one that was not drawn.
 */
function positions(html: string): number[] {
  return [
    html.indexOf('about-hero'),
    html.indexOf('What you can do here'),
    html.indexOf('about-context'),
    html.indexOf('Built on'),
    html.indexOf('How to cite'),
    html.indexOf('Licence and source'),
    html.indexOf('Found a problem?'),
  ];
}

test('the seven sections are all there, in the one order every site reads in', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);
  const found = positions(html);

  expect(found).toHaveLength(7);

  for (let index = 0; index < found.length; index++) {
    // Every section is drawn, and each starts after the one before it: a
    // missing section reads as -1 and fails here rather than going unnoticed.
    expect(found[index]).toBeGreaterThan(
      index === 0 ? -1 : (found[index - 1] ?? -1),
    );
  }
});

test('the hero names the site, its tagline and what the tool is', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('class="wordmark__lead" style="color:#1c6e42"');
  expect(html).toContain('>smiles</span>');
  expect(html).toContain(
    'Draw a structure, read its SMILES, learn the notation.',
  );
  expect(html).toContain(
    'Draw a structure and read the SMILES that describes it, atom by atom.',
  );
});

test('every line of what a visitor can do is written, and the context under it', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('<li>Draw a structure and read its SMILES.</li>');
  expect(html).toContain('<li>Paste a SMILES and see what it draws.</li>');
  expect(html).toContain('<li>Follow the notation one rule at a time.</li>');
  expect(html).toContain(
    'It replaces the SMILES tiles of the teaching visualizer.',
  );
});

test('the borrowed works are the registry entries, licence included', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('href="https://github.com/cheminfo/openchemlib-js"');
  expect(html).toContain('>BSD-3-Clause</span>');
  expect(html).toContain('the component model the pages are written in.');
});

test('the licence, the sources and the version come from the ecosystem record', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('MIT, © cheminfo.');
  expect(html).toContain(
    'href="https://github.com/cheminfo/smiles.cheminfo.org"',
  );
  expect(html).toContain('>github.com/cheminfo/smiles.cheminfo.org</a>');
  expect(html).toContain(
    'href="https://github.com/cheminfo/smiles.cheminfo.org/issues"',
  );
  expect(html).toContain('This page is running version 2.4.0.');
});

test('the work to cite is previewed, and its DOI is a link', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('Data processing in the browser');
  expect(html).toContain(
    'Cite it for the site itself, which runs in the browser.',
  );
  expect(html).toContain('Chimia');
  expect(html).toContain('href="https://doi.org/10.2533/chimia.2025.66"');
  expect(html).toContain('doi:10.2533/chimia.2025.66');
});

test('a site asking for no citation loses that section and nothing else', () => {
  const { cite, ...noCite } = SMILES;
  const html = renderToStaticMarkup(<AboutPage content={noCite} />);

  expect(html).not.toContain('How to cite');
  expect(html).not.toContain('10.2533/chimia.2025.66');
  expect(html).toContain('What you can do here');
  expect(html).toContain('Built on');
  expect(html).toContain('Licence and source');
  expect(html).toContain('Found a problem?');
});

test('a site writing no context loses that block, and the page still reads', () => {
  const { paragraphs, ...noContext } = SMILES;
  const html = renderToStaticMarkup(<AboutPage content={noContext} />);

  expect(html).not.toContain('about-context');
  expect(html.indexOf('What you can do here')).toBeLessThan(
    html.indexOf('Built on'),
  );
});

test("the site's own section lands between the context and the credits", () => {
  const html = renderToStaticMarkup(
    <AboutPage content={SMILES}>
      <section className="about-numbers">Where the numbers come from</section>
    </AboutPage>,
  );

  expect(html.indexOf('about-context')).toBeLessThan(
    html.indexOf('about-numbers'),
  );
  expect(html.indexOf('about-numbers')).toBeLessThan(html.indexOf('Built on'));
});

test('the page carries the class the site gives it, and its own', () => {
  const html = renderToStaticMarkup(
    <AboutPage content={SMILES} className="page" />,
  );

  expect(html).toContain('<div class="about-page page"');
});

test('a credit no registry entry answers to stops the page being drawn', () => {
  expect(() =>
    renderToStaticMarkup(
      <AboutPage
        content={{ ...SMILES, credits: ['ml-matrx' as 'ml-matrix'] }}
      />,
    ),
  ).toThrow('unknown credit: ml-matrx');
});
