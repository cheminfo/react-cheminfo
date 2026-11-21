import { expect, test } from 'vitest';

import type { CslItem } from '../cslItems.ts';
import {
  itemLabel,
  itemSearchText,
  itemVenue,
  itemYear,
  readCslItems,
  readCslText,
} from '../cslItems.ts';

import { ZOTERO_COPY } from './zoteroCopy.ts';

test('what Zotero copies as CSL JSON reads as its works, each under its DOI', () => {
  const items = readCslText(ZOTERO_COPY) ?? [];

  expect(items.map((item) => item.id)).toStrictEqual([
    'doi:10.1021/ci300563h',
    'doi:10.3762/bjoc.20.4',
  ]);

  const [chemcalc] = items;

  expect(chemcalc?.abstract).toBeUndefined();
  expect(chemcalc?.journalAbbreviation).toBe('J. Chem. Inf. Model.');
  expect(chemcalc?.issued).toStrictEqual({ 'date-parts': [['2013', 5, 24]] });
});

test('text that is not CSL JSON names no work', () => {
  expect(
    readCslText('Patiny, L.; Borel, A. J. Chem. Inf. Model. 2013'),
  ).toBeUndefined();
  expect(readCslText('[1, 2, 3]')).toBeUndefined();
  expect(readCslText('[]')).toBeUndefined();
  expect(readCslText('{"title": "no type"}')).toBeUndefined();
  expect(readCslText('[{"type": "book"')).toBeUndefined();
});

test('one work, two copies of it and a work without a DOI', () => {
  expect(
    readCslText('{"id": "ITEM-1", "type": "book", "title": "Alone"}'),
  ).toStrictEqual([{ id: 'ITEM-1', type: 'book', title: 'Alone' }]);

  const items = readCslItems([
    { id: 'a', type: 'article-journal', DOI: '10.1021/CI300563H' },
    { id: 'b', type: 'article-journal', DOI: '10.1021/ci300563h' },
    { id: 'c', type: 'book', 'citation-key': 'patiny2013' },
    { id: 'd', type: 'book' },
    { type: 'book' },
    null,
  ]);

  expect(items.map((item) => item.id)).toStrictEqual([
    'doi:10.1021/ci300563h',
    'patiny2013',
    'd',
  ]);
});

test('a work is named by its first author and year, beside its journal', () => {
  const [chemcalc, nmrium] = readCslText(ZOTERO_COPY) as [CslItem, CslItem];

  expect(itemLabel(chemcalc)).toBe('Patiny & Borel 2013');
  expect(itemLabel(nmrium)).toBe('Patiny et al. 2024');
  expect(itemVenue(chemcalc)).toBe('J. Chem. Inf. Model. 53');
  expect(
    itemLabel({
      id: 'iupac',
      type: 'report',
      author: [{ literal: 'IUPAC' }],
      issued: { literal: 'Spring 2021' },
    }),
  ).toBe('IUPAC 2021');
  expect(itemLabel({ id: 'x', type: 'webpage', title: 'A page' })).toBe(
    'A page',
  );
  expect(
    itemVenue({
      id: 'y',
      type: 'article-journal',
      'container-title': 'Nature',
    }),
  ).toBe('Nature');
});

test('the year is read from its parts, a string included, or from the text', () => {
  expect(
    itemYear({ id: 'a', type: 'book', issued: { 'date-parts': [[2013]] } }),
  ).toBe(2013);
  expect(
    itemYear({ id: 'b', type: 'book', issued: { raw: 'March 1999' } }),
  ).toBe(1999);
  expect(itemYear({ id: 'c', type: 'book' })).toBeUndefined();
});

test('a search reads the authors, the year, the title, the journal and the DOI', () => {
  const [chemcalc] = readCslText(ZOTERO_COPY) as [CslItem];
  const text = itemSearchText(chemcalc);
  for (const word of [
    'borel',
    'luc',
    '2013',
    'building block',
    'j. chem. inf. model.',
    '10.1021/ci300563h',
  ]) {
    expect(text).toContain(word);
  }
});
