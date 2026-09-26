/**
 * The claim the whole module exists for: a site that declares the language it
 * is written in gets its chrome in that language, without passing a single
 * string of its own.
 */

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import { CiteButton } from '../../../citation/ui/CiteButton.tsx';
import { EcosystemLinks } from '../../../ecosystem/ui/EcosystemLinks.tsx';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { ShareButton } from '../../../share/ui/ShareButton.tsx';
import { CHROME_CATALOG } from '../../core/chromeCatalog.ts';
import { LANGUAGES } from '../../core/languages.ts';

beforeAll(async () => {
  // A language is a chunk of its own, so a site reading in it pays for it once
  // and every later render is synchronous.
  await Promise.all(
    LANGUAGES.map(async (language) => CHROME_CATALOG.load(language)),
  );
});

function chrome(language: string | undefined): ReactElement {
  return (
    <SiteLanguage value={language}>
      <ShareButton onClick={() => undefined} />
      <CiteButton reference={PLATFORM_WORK.reference} />
      <EcosystemLinks currentSiteId="surge" layout="row" />
    </SiteLanguage>
  );
}

test('an English page is written in English', () => {
  const html = renderToStaticMarkup(chrome(undefined));

  expect(html).toContain('Share');
  expect(html).toContain('Cite');
  expect(html).toContain('Our other tools');
});

test('a French page writes the chrome in French', () => {
  const html = renderToStaticMarkup(chrome('fr'));

  expect(html).toContain('Partager');
  expect(html).toContain('Citer');
  expect(html).toContain('Nos autres outils');
  expect(html).toContain('Structures et notations');
});

test('a German page writes the chrome in German', () => {
  const html = renderToStaticMarkup(chrome('de'));

  expect(html).toContain('Teilen');
  expect(html).toContain('Zitieren');
  expect(html).toContain('Unsere weiteren Werkzeuge');
});

test('a Spanish page writes the chrome in Spanish', () => {
  const html = renderToStaticMarkup(chrome('es'));

  expect(html).toContain('Compartir');
  expect(html).toContain('Citar');
  expect(html).toContain('Nuestras otras herramientas');
});

test('a language the family does not speak reads as English', () => {
  expect(renderToStaticMarkup(chrome('it'))).toContain('Share');
});
