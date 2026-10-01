import { expect, test } from 'vitest';

import type { Language } from '../../../i18n/core/languages.ts';
import { alternateLinkTags } from '../alternates.ts';

const SPOKEN: readonly Language[] = ['en', 'fr', 'de'];
const ORIGIN = 'https://3d.cheminfo.org';

test('every language of a page names every other, itself included', () => {
  expect(
    alternateLinkTags({ origin: ORIGIN, path: '/tutorial', languages: SPOKEN }),
  ).toBe(
    [
      '<link rel="alternate" hreflang="en" href="https://3d.cheminfo.org/tutorial" />',
      '<link rel="alternate" hreflang="fr" href="https://3d.cheminfo.org/fr/tutorial" />',
      '<link rel="alternate" hreflang="de" href="https://3d.cheminfo.org/de/tutorial" />',
      '<link rel="alternate" hreflang="x-default" href="https://3d.cheminfo.org/tutorial" />',
    ].join('\n'),
  );
});

test('the front page writes the language alone, not a trailing slash', () => {
  expect(
    alternateLinkTags({ origin: ORIGIN, path: '/', languages: SPOKEN }),
  ).toContain('href="https://3d.cheminfo.org/fr"');
});

test('x-default is the unprefixed address, the one already handed out', () => {
  expect(
    alternateLinkTags({ origin: ORIGIN, path: '/batch', languages: SPOKEN }),
  ).toContain(
    '<link rel="alternate" hreflang="x-default" href="https://3d.cheminfo.org/batch" />',
  );
});

test('a site speaking one language writes no alternate at all', () => {
  expect(
    alternateLinkTags({ origin: ORIGIN, path: '/tutorial', languages: ['en'] }),
  ).toBe('');
});

test('a mounted deployment keeps its mount in every alternate', () => {
  expect(
    alternateLinkTags({
      origin: 'https://learn.cheminfo.org/surge',
      path: '/exercises',
      languages: ['en', 'fr'],
    }),
  ).toBe(
    [
      '<link rel="alternate" hreflang="en" href="https://learn.cheminfo.org/surge/exercises" />',
      '<link rel="alternate" hreflang="fr" href="https://learn.cheminfo.org/surge/fr/exercises" />',
      '<link rel="alternate" hreflang="x-default" href="https://learn.cheminfo.org/surge/exercises" />',
    ].join('\n'),
  );
});

test('a hostile origin cannot break out of the attribute', () => {
  expect(
    alternateLinkTags({
      origin: 'https://evil"onload="alert(1)',
      path: '/',
      languages: ['en', 'fr'],
    }),
  ).not.toContain('onload="alert(1)"');
});
