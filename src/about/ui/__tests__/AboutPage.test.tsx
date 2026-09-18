import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import type { SiteId } from '../../../ecosystem/core/sites.ts';
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
  // Stated rather than inherited: the real repository is private, and these
  // tests are about the page a site with open sources draws.
  publicRepository: true,
  build: {
    version: '2.4.0',
    builtAt: '2026-09-16T09:41:07Z',
    commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
  },
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
  expect(html).toContain(
    'href="https://github.com/cheminfo/smiles.cheminfo.org/releases/tag/v2.4.0"',
  );
  expect(html).toContain('Built 2026-09-16 09:41:07 UTC');
  expect(html).toContain(
    'href="https://github.com/cheminfo/smiles.cheminfo.org/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"',
  );
  expect(html).toContain('>a1b2c3d</code>');
});

test('a build that does not know its commit says only what it knows', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        build: { version: '2.4.0', builtAt: '2026-09-16T09:41:07Z' },
      }}
    />,
  );

  expect(html).toContain('Built 2026-09-16 09:41:07 UTC');
  expect(html).not.toContain('from commit');
});

test('a site published off GitHub shows the build without inventing links', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        repository: 'https://gitlab.com/cheminfo/elsewhere',
      }}
    />,
  );

  expect(html).toContain('>2.4.0 · 2026-09-16 09:41 UTC</span>');
  expect(html).not.toContain('gitlab.com/cheminfo/elsewhere/releases');
  expect(html).not.toContain('gitlab.com/cheminfo/elsewhere/commit');
});

test('the version is read in the hero, above everything the page says', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('class="about-version"');
  expect(html).toContain('>2.4.0 · 2026-09-16 09:41 UTC</a>');
  expect(html.indexOf('about-version')).toBeLessThan(
    html.indexOf('What you can do here'),
  );
  // It left the line it used to share with the build instant.
  expect(html).not.toContain('Running version');
});

test('a site that has never been released is named by its commit instead', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        build: {
          version: '0.0.0',
          builtAt: '2026-09-16T09:41:07Z',
          commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
        },
      }}
    />,
  );

  // `0.0.0` names no release anybody can look up; the commit names one build.
  expect(html).not.toContain('0.0.0');
  expect(html).toContain('class="about-version"');
  expect(html).toContain('>a1b2c3d · 2026-09-16 09:41 UTC</a>');
  expect(html).toContain(
    'href="https://github.com/cheminfo/smiles.cheminfo.org/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"',
  );
  // What the build knows is still worth saying.
  expect(html).toContain('Built 2026-09-16 09:41:07 UTC');
});

test('a build with neither a release nor a commit shows no badge', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        build: { version: '0.0.0', builtAt: '2026-09-16T09:41:07Z' },
      }}
    />,
  );

  expect(html).not.toContain('about-version');
  expect(html).not.toContain('0.0.0');
});

test('a private site that has never been released still names its build', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        publicRepository: false,
        build: {
          version: '0.0.0',
          builtAt: '2026-09-16T09:41:07Z',
          commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
        },
      }}
    />,
  );

  // The hero badge is the whole of what the page says about the build, so it
  // carries the instant a reader would otherwise read under the licence.
  expect(html).toContain('title="Built 2026-09-16 09:41:07 UTC from commit');
  expect(html).toContain('>a1b2c3d · 2026-09-16 09:41 UTC</span>');
  expect(html).not.toContain('smiles.cheminfo.org/commit');
  expect(html).not.toContain('Licence and source');
});

test('a site with no build record shows no version', () => {
  const { build, ...noBuild } = SMILES;
  const html = renderToStaticMarkup(<AboutPage content={noBuild} />);

  expect(html).not.toContain('about-version');
  expect(html).toContain('Licence and source');
});

test('a private repository is named nowhere, and the version stops linking', () => {
  const html = renderToStaticMarkup(
    <AboutPage content={{ ...SMILES, publicRepository: false }} />,
  );

  expect(html).not.toContain('Licence and source');
  expect(html).not.toContain('MIT, © cheminfo.');
  expect(html).not.toContain('smiles.cheminfo.org/releases');
  expect(html).not.toContain('smiles.cheminfo.org/commit');

  // The build a reader is asked to quote is still on the page, as plain text,
  // and the badge it is read from carries the instant the licence used to.
  expect(html).toContain('class="about-version"');
  expect(html).toContain('>2.4.0 · 2026-09-16 09:41 UTC</span>');
  expect(html).toContain(
    'title="Built 2026-09-16 09:41:07 UTC from commit a1b2c3d"',
  );

  // A tracker nobody outside can open is not offered either.
  expect(html).not.toContain('Found a problem?');
  expect(html).not.toContain('smiles.cheminfo.org/issues');

  // Everything else the page says is untouched.
  expect(html).toContain('What you can do here');
  expect(html).toContain('Built on');
});

test('a private site naming a report address of its own keeps that section', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        publicRepository: false,
        issues: 'https://github.com/cheminfo/feedback/issues',
      }}
    />,
  );

  expect(html).toContain('Found a problem?');
  expect(html).toContain('href="https://github.com/cheminfo/feedback/issues"');
  expect(html).not.toContain('Licence and source');
});

test('a site inherits the visibility of its own repository from the family record', () => {
  const { publicRepository, ...inherited } = SMILES;
  const open = renderToStaticMarkup(
    <AboutPage content={{ ...inherited, siteId: 'regexp' }} />,
  );
  const closed = renderToStaticMarkup(<AboutPage content={inherited} />);

  expect(open).toContain('Licence and source');
  expect(closed).not.toContain('Licence and source');
});

test('each work is cited through the shared Cite button, and nothing else', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).toContain('Data processing in the browser');
  expect(html).toContain(
    'Cite it for the site itself, which runs in the browser.',
  );
  expect(html).toContain('citation-button');
  expect(html).toContain('aria-label="Cite Data processing in the browser"');
  expect(html).not.toContain('citation-preview');
  expect(html).not.toContain('doi:10.2533/chimia.2025.66');
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

test('provided by: the EPFL logo, the name and the institution, right under the hero', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        people: [{ name: 'Luc Patiny' }],
        providedBy: ['epfl'],
      }}
    />,
  );

  expect(html).toContain('Provided by');
  expect(html).toContain('>Luc Patiny</p>');
  expect(html).toContain('École polytechnique fédérale de Lausanne');
  expect(html).toContain('Lausanne, Switzerland');
  expect(html).toContain('href="https://www.epfl.ch"');
  expect(html).toContain(
    'aria-label="EPFL — École polytechnique fédérale de Lausanne"',
  );
  expect(html).not.toContain('<ul style="margin:16px 0 0');
  expect(html.indexOf('about-hero')).toBeLessThan(html.indexOf('Provided by'));
  expect(html.indexOf('Provided by')).toBeLessThan(
    html.indexOf('What you can do here'),
  );
});

test('several people are joined into one line, and their roles listed under it', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      content={{
        ...SMILES,
        people: [
          { name: 'Daniel Kostro', role: 'wrote the solver.' },
          { name: 'Michaël Zasso' },
          { name: 'Luc Patiny', role: 'curates the data.' },
        ],
        providedBy: ['epfl'],
      }}
    />,
  );

  expect(html).toContain('>Daniel Kostro, Michaël Zasso and Luc Patiny</p>');
  expect(html).toContain(
    '<li><strong>Daniel Kostro</strong> — wrote the solver.</li>',
  );
  expect(html).toContain(
    '<li><strong>Luc Patiny</strong> — curates the data.</li>',
  );
  expect(html).not.toContain('<li><strong>Michaël Zasso</strong>');
});

test('a site naming nobody and no provider has no "Provided by" section', () => {
  const html = renderToStaticMarkup(<AboutPage content={SMILES} />);

  expect(html).not.toContain('Provided by');
});

test('a provider no registry entry answers to stops the page being drawn', () => {
  expect(() =>
    renderToStaticMarkup(
      <AboutPage content={{ ...SMILES, providedBy: ['epf' as 'epfl'] }} />,
    ),
  ).toThrow('unknown provider: epf');
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

test('a site with a drawn lockup shows it instead of the mark and the name', () => {
  const plain = renderToStaticMarkup(<AboutPage content={SMILES} />);
  const drawn = renderToStaticMarkup(
    <AboutPage content={SMILES} logo={<img src="/logo.svg" alt="SMILES" />} />,
  );

  expect(plain).toContain('wordmark__lead');
  expect(plain).toContain('<svg');
  expect(drawn).toContain('<img src="/logo.svg" alt="SMILES"/>');
  expect(drawn).not.toContain('wordmark__lead');
  expect(drawn).not.toContain('<svg');
  expect(drawn).toContain(
    'Draw a structure and read the SMILES that describes it, atom by atom.',
  );
});

test('a site outside the family draws its own mark and name from its record', () => {
  const html = renderToStaticMarkup(
    <AboutPage
      mark={<svg data-testid="own-mark" />}
      content={{
        ...SMILES,
        siteId: {
          id: 'images' as SiteId,
          name: { lead: 'images', alt: 'cheminfo', dot: true },
          host: 'images.cheminfo.org',
          repository: 'https://github.com/cheminfo/images.cheminfo.org',
          group: 'computing',
          tagline: 'Crop, rotate, adjust, resize and compress images.',
          brand: '#a21caf',
          brandAlt: '#b45309',
          mark: { plate: '#a21caf', accent: '#f59e0b' },
        },
      }}
    />,
  );

  expect(html).toContain('Crop, rotate, adjust, resize and compress images.');
  expect(html).toContain('>images</span>');
});
