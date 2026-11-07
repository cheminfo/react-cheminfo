import { expect, test } from 'vitest';

import type { AboutPerson } from '../affiliations.ts';
import { affiliationProblems, affiliationRows } from '../affiliations.ts';
import type { ProviderId } from '../providers.ts';
import { providers } from '../providers.ts';

const AUTHORS: AboutPerson[] = [
  { name: 'Mara', affiliation: 'fsu-jena' },
  { name: 'Kevin', affiliation: 'fsu-jena' },
  { name: 'Luc', affiliation: 'zakodium' },
  { name: 'Sarthak', affiliation: 'hu-berlin' },
  { name: 'Boris', affiliation: 'fsu-jena' },
];

/**
 * The rows as `[institution, names]` pairs, which is what a reader sees.
 * @param people - Who the site names.
 * @param ids - The institutions it names.
 * @returns One pair per row.
 */
function rowsOf(
  people: readonly AboutPerson[],
  ids: readonly ProviderId[],
): Array<[string | undefined, string[]]> {
  return affiliationRows(people, providers(ids)).map((row) => [
    row.provider?.id,
    row.people.map(({ name }) => name),
  ]);
}

test('each institution holds its own people, in the order the site names them', () => {
  expect(rowsOf(AUTHORS, ['fsu-jena', 'zakodium', 'hu-berlin'])).toStrictEqual([
    ['fsu-jena', ['Mara', 'Kevin', 'Boris']],
    ['zakodium', ['Luc']],
    ['hu-berlin', ['Sarthak']],
  ]);
});

test('with one institution nobody has to say where they belong', () => {
  expect(rowsOf([{ name: 'Luc' }], ['epfl'])).toStrictEqual([
    ['epfl', ['Luc']],
  ]);
});

test('an institution nobody belongs to keeps its row', () => {
  expect(rowsOf([{ name: 'Luc' }], ['epfl', 'zakodium'])).toStrictEqual([
    ['epfl', []],
    ['zakodium', []],
    [undefined, ['Luc']],
  ]);
});

test('somebody placed at an institution the site does not name is not dropped', () => {
  expect(
    rowsOf([{ name: 'Sarthak', affiliation: 'hu-berlin' }], ['epfl']),
  ).toStrictEqual([
    ['epfl', []],
    [undefined, ['Sarthak']],
  ]);
});

test('a site naming no institution and nobody draws no row', () => {
  expect(rowsOf([], [])).toStrictEqual([]);
});

test('people with no institution at all stay in one row without a logo', () => {
  expect(rowsOf([{ name: 'Luc' }, { name: 'Kevin' }], [])).toStrictEqual([
    [undefined, ['Luc', 'Kevin']],
  ]);
});

test('a record placing everybody has no problem', () => {
  expect(
    affiliationProblems(AUTHORS, ['fsu-jena', 'zakodium', 'hu-berlin']),
  ).toStrictEqual([]);
  expect(affiliationProblems([{ name: 'Luc' }], ['epfl'])).toStrictEqual([]);
});

test('several institutions: each person has to say which one', () => {
  expect(
    affiliationProblems([{ name: 'Luc' }], ['fsu-jena', 'zakodium']),
  ).toStrictEqual([
    'Luc has no `affiliation`: a site naming several institutions says which one each person belongs to.',
  ]);
});

test('an affiliation the site does not name has no row to be drawn in', () => {
  expect(
    affiliationProblems(
      [{ name: 'Sarthak', affiliation: 'hu-berlin' }],
      ['fsu-jena'],
    ),
  ).toStrictEqual([
    'Sarthak belongs to `hu-berlin`, which is not in `providedBy`: the row their name is drawn in does not exist.',
  ]);
});
