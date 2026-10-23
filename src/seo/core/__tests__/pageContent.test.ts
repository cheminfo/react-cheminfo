import { expect, test } from 'vitest';

import { pageContentOf } from '../pageContent.ts';
import type { RouteMeta } from '../routes.ts';

const HOME: RouteMeta = {
  path: '/',
  title: 'Count the electrons of an ion',
  description: 'Type a formula and read the electron count, worked out.',
};
const LEWIS: RouteMeta = {
  path: '/lewis',
  title: 'Lewis structures',
  description: 'Draw a Lewis structure and have it checked atom by atom.',
};

test('a page written for is said in its own words', () => {
  const content = pageContentOf({
    '/': { heading: 'Count electrons', paragraphs: ['Protons, then charge.'] },
  });

  expect(content(HOME, 'en')).toStrictEqual({
    heading: 'Count electrons',
    paragraphs: ['Protons, then charge.'],
  });
});

test('any other page says the name and the sentence it is indexed under', () => {
  const content = pageContentOf({});

  expect(content(LEWIS, 'en')).toStrictEqual({
    heading: 'Lewis structures',
    paragraphs: ['Draw a Lewis structure and have it checked atom by atom.'],
  });
});

test('a site written in several languages hands a record per language', () => {
  const content = pageContentOf((language) =>
    language === 'fr'
      ? { '/': { heading: 'Compter les électrons' } }
      : { '/': { heading: 'Count electrons' } },
  );

  expect(content(HOME, 'fr')).toStrictEqual({
    heading: 'Compter les électrons',
  });
  expect(content(HOME, 'en')).toStrictEqual({ heading: 'Count electrons' });
});
