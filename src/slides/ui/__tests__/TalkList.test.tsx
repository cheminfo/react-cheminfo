import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { TalkManifest } from '../../core/index.ts';
import { TalkList } from '../TalkList.tsx';

const CHEMCALC: TalkManifest = {
  site: 'chemcalc',
  origin: 'https://chemcalc.org',
  talks: [
    {
      id: 'asms-2026',
      title: 'Mass spectrometry in the browser',
      event: 'ASMS',
      date: '2026-06-02',
      slideCount: 24,
    },
    {
      id: 'sciex-2025',
      title: 'Isotopic distributions',
      subtitle: 'from a formula to a spectrum',
      event: 'SCIEX days',
      date: '2025-11-14',
      slideCount: 1,
    },
  ],
};

const SURGE: TalkManifest = {
  site: 'surge',
  origin: 'https://surge.cheminfo.org',
  talks: [
    {
      id: 'enumeration',
      title: 'Structure enumeration',
      event: 'ICCS',
      date: '2026-03-08',
      slideCount: 12,
    },
  ],
};

test('two sites are two groups, each named', () => {
  const html = renderToStaticMarkup(
    <TalkList
      manifests={[CHEMCALC, SURGE]}
      onOpen={() => undefined}
      siteName={(site) => (site === 'surge' ? 'Surge' : 'ChemCalc')}
    />,
  );

  expect(html).toContain('<h2 class="talk-list-site">ChemCalc</h2>');
  expect(html).toContain('<h2 class="talk-list-site">Surge</h2>');
  expect(html.indexOf('ChemCalc')).toBeLessThan(html.indexOf('Surge'));
});

test('a site with one manifest is not labelled with its own name', () => {
  const html = renderToStaticMarkup(
    <TalkList manifests={[CHEMCALC]} onOpen={() => undefined} />,
  );

  expect(html).not.toContain('talk-list-site');
  expect(html).toContain('Mass spectrometry in the browser');
});

test('the most recent talk of a site comes first', () => {
  const html = renderToStaticMarkup(
    <TalkList manifests={[CHEMCALC]} onOpen={() => undefined} />,
  );

  expect(html.indexOf('Mass spectrometry in the browser')).toBeLessThan(
    html.indexOf('Isotopic distributions'),
  );
});

test('an undated talk sorts behind every dated one', () => {
  const html = renderToStaticMarkup(
    <TalkList
      manifests={[
        {
          site: 'chemcalc',
          origin: 'https://chemcalc.org',
          talks: [
            { id: 'draft', title: 'Work in progress', slideCount: 3 },
            {
              id: 'asms',
              title: 'Given at ASMS',
              date: '2024-01-01',
              slideCount: 5,
            },
          ],
        },
      ]}
      onOpen={() => undefined}
    />,
  );

  expect(html.indexOf('Given at ASMS')).toBeLessThan(
    html.indexOf('Work in progress'),
  );
});

test('a card reads its title, its occasion and its length', () => {
  const html = renderToStaticMarkup(
    <TalkList manifests={[CHEMCALC]} onOpen={() => undefined} />,
  );

  expect(html).toContain(
    '<div class="talk-card-title">Mass spectrometry in the browser</div>',
  );
  expect(html).toContain('<div class="talk-card-meta">ASMS · 2026-06-02</div>');
  expect(html).toContain('<div class="talk-card-count">24 slides</div>');
  expect(html).toContain(
    '<div class="talk-card-subtitle">from a formula to a spectrum</div>',
  );
  expect(html).toContain('<div class="talk-card-count">1 slide</div>');
});

test('a card is a real link when the site says where the talk sits', () => {
  const html = renderToStaticMarkup(
    <TalkList
      manifests={[SURGE]}
      onOpen={() => undefined}
      renderHref={(manifest, talk) => `${manifest.origin}/talk/${talk.id}`}
    />,
  );

  expect(html).toContain(
    '<a class="talk-card" href="https://surge.cheminfo.org/talk/enumeration">',
  );
});

test('nothing published says so, rather than drawing an empty box', () => {
  const html = renderToStaticMarkup(
    <TalkList manifests={[]} onOpen={() => undefined} />,
  );

  expect(html).toBe('<p class="talk-list-empty">No talk yet.</p>');
});

test('a site that has published nothing is not a heading over a void', () => {
  const html = renderToStaticMarkup(
    <TalkList
      manifests={[
        { site: 'surge', origin: 'https://surge.cheminfo.org', talks: [] },
      ]}
      onOpen={() => undefined}
      emptyNote="Nothing here yet — write the first one."
    />,
  );

  expect(html).toBe(
    '<p class="talk-list-empty">Nothing here yet — write the first one.</p>',
  );
});
