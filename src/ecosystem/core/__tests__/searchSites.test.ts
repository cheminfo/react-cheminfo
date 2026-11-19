import { expect, test } from 'vitest';

import { searchSites, searchWords } from '../searchSites.ts';

/**
 * The ids a query finds, in the order they are given.
 * @param query - What was typed.
 * @returns The ids.
 */
function idsOf(query: string): string[] {
  return searchSites(query).map((site) => site.id);
}

test('a blank query finds nothing, rather than everything', () => {
  expect(searchWords(' \t ')).toStrictEqual([]);
  expect(idsOf('')).toStrictEqual([]);
  expect(idsOf('\n')).toStrictEqual([]);
});

test('the site a name starts with comes first, then a word inside a name, then a tagline', () => {
  // nmr.cheminfo is named so; metabo.nmrium carries the word inside its
  // name; elucidation and spectroscopy only say NMR in their taglines.
  expect(idsOf('nmr')).toStrictEqual([
    'nmr',
    'metabo',
    'elucidation',
    'spectroscopy',
  ]);
});

test('a topic finds every site under it, in the order of the menu', () => {
  expect(idsOf('physics')).toStrictEqual(['optics', 'circuits', 'mechanics']);
});

test('a site is still found under the name it had before', () => {
  expect(idsOf('biodraw')).toStrictEqual(['cell']);
});

test('every word typed has to be found', () => {
  expect(idsOf('titration')).toStrictEqual(['equilibrium']);
  expect(idsOf('titration physics')).toStrictEqual([]);
  expect(idsOf('xyzzy')).toStrictEqual([]);
});

/**
 * A tagline in French, for the one site that has one here.
 * @param id - The site.
 * @returns What it answers to in French.
 */
function french(id: string): string[] {
  return id === 'equilibrium' ? ['Équilibres chimiques : pH et titrages'] : [];
}

test('case and accents are ignored on both sides', () => {
  expect(
    searchSites('équilibres', { texts: (site) => french(site.id) }).map(
      (site) => site.id,
    ),
  ).toStrictEqual(['equilibrium']);
  expect(
    searchSites('EQUILIBRES', { texts: (site) => french(site.id) }).map(
      (site) => site.id,
    ),
  ).toStrictEqual(['equilibrium']);
});

test('the texts given are searched beside the English record, not instead of it', () => {
  expect(
    searchSites('titration', { texts: () => ['autre chose'] }).map(
      (site) => site.id,
    ),
  ).toStrictEqual(['equilibrium']);
});
