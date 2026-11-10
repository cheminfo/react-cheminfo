import { expect, test } from 'vitest';

import { numberReferents } from '../numbering.ts';
import { seriesLetter } from '../seriesLetter.ts';
import type { FigureReferent, ReferentSeries } from '../types.ts';

const ALDEHYDE: FigureReferent = { key: 'ald', idCode: 'ALD' };
const ACID: FigureReferent = { key: 'acid', idCode: 'ACID' };
const AMIDE: FigureReferent = {
  key: 'amide',
  idCode: 'GENERIC',
  series: 'scope',
  members: [
    { row: 'me', idCode: 'AMIDE-ME' },
    { row: 'et', idCode: 'AMIDE-ET' },
    { row: 'ph' },
  ],
};
const SCOPE: ReferentSeries = {
  key: 'scope',
  columns: ['R1'],
  rows: [
    { id: 'me', values: { R1: 'Me' } },
    { id: 'et', values: { R1: 'Et' } },
    { id: 'ph', values: { R1: 'Ph' } },
  ],
};

test('referents are numbered in the order first shown or cited', () => {
  const numbering = numberReferents({
    referents: [ALDEHYDE, ACID],
    series: [],
    order: [{ key: 'acid' }, { key: 'ald' }, { key: 'acid' }],
  });

  expect(numbering.label({ key: 'acid' })).toBe('1');
  expect(numbering.label({ key: 'ald' })).toBe('2');
  expect(numbering.numberOf('ald')).toBe(2);
});

test('a reference to nothing the document holds reads ?', () => {
  const numbering = numberReferents({
    referents: [ALDEHYDE],
    series: [SCOPE],
    order: [{ key: 'ald' }, { key: 'gone' }],
  });

  expect(numbering.label({ key: 'gone' })).toBe('?');
  expect(numbering.label({ key: 'ald', row: 'me' })).toBe('?');
  expect(numbering.numberOf('gone')).toBeUndefined();
});

test('the same structure in two figures is one compound', () => {
  const again: FigureReferent = { key: 'ald-copy', idCode: 'ALD' };
  const numbering = numberReferents({
    referents: [ALDEHYDE, ACID, again],
    series: [],
    order: [{ key: 'ald' }, { key: 'acid' }, { key: 'ald-copy' }],
  });

  expect(numbering.label({ key: 'ald-copy' })).toBe('1');
  expect(numbering.label({ key: 'acid' })).toBe('2');
});

test('members read their compound number and their row letter', () => {
  const numbering = numberReferents({
    referents: [ALDEHYDE, AMIDE],
    series: [SCOPE],
    order: [{ key: 'ald' }, { key: 'amide' }, { key: 'amide', row: 'ph' }],
  });

  expect(numbering.label({ key: 'amide' })).toBe('2');
  expect(numbering.label({ key: 'amide', row: 'me' })).toBe('2a');
  expect(numbering.label({ key: 'amide', row: 'ph' })).toBe('2c');
  expect(numbering.label({ key: 'amide', row: 'gone' })).toBe('?');
});

test('two compounds of one series share its letters', () => {
  const ester: FigureReferent = {
    key: 'ester',
    series: 'scope',
    members: [{ row: 'et' }],
  };
  const numbering = numberReferents({
    referents: [ester, AMIDE],
    series: [SCOPE],
    order: [{ key: 'ester' }, { key: 'amide' }],
  });

  expect(numbering.label({ key: 'ester', row: 'et' })).toBe('1b');
  expect(numbering.label({ key: 'amide', row: 'et' })).toBe('2b');
});

test('a member drawn in full reads as that member, and numbers its compound', () => {
  const ethyl: FigureReferent = { key: 'drawn-ethyl', idCode: 'AMIDE-ET' };
  const numbering = numberReferents({
    referents: [ethyl, ALDEHYDE, AMIDE],
    series: [SCOPE],
    order: [{ key: 'drawn-ethyl' }, { key: 'ald' }, { key: 'amide' }],
  });

  expect(numbering.label({ key: 'drawn-ethyl' })).toBe('1b');
  expect(numbering.label({ key: 'amide' })).toBe('1');
  expect(numbering.label({ key: 'ald' })).toBe('2');
});

test('each kind is counted on its own', () => {
  const spectrum: FigureReferent = { key: 'ir', kind: 'spectrum' };
  const numbering = numberReferents({
    referents: [ALDEHYDE, spectrum, ACID],
    series: [],
    order: [{ key: 'ald' }, { key: 'ir' }, { key: 'acid' }],
  });

  expect(numbering.label({ key: 'ir' })).toBe('1');
  expect(numbering.label({ key: 'acid' })).toBe('2');
});

test('a prefix, a first number and pinned numbers', () => {
  const numbering = numberReferents(
    {
      referents: [ALDEHYDE, ACID, AMIDE],
      series: [SCOPE],
      order: [{ key: 'ald' }, { key: 'acid' }, { key: 'amide' }],
    },
    { prefix: 'S', start: 4, pins: { acid: 5 } },
  );

  expect(numbering.label({ key: 'ald' })).toBe('S4');
  expect(numbering.label({ key: 'acid' })).toBe('S5');
  expect(numbering.label({ key: 'amide', row: 'et' })).toBe('S6b');
});

test('rows run past the alphabet as a chemist would', () => {
  expect([0, 1, 25, 26, 27, 51, 52].map(seriesLetter)).toStrictEqual([
    'a',
    'b',
    'z',
    'aa',
    'ab',
    'az',
    'ba',
  ]);
});
