import { expect, test } from 'vitest';

import { detectIrFormat } from '../../../ir/core/detectIrFormat.ts';
import { detectMassFormat } from '../../../mass/core/detectMassFormat.ts';
import { detectFormat } from '../../../xps/core/detectFormat.ts';
import { acceptOf, startsJcamp } from '../fileHeader.ts';

const COMMENTED =
  '$$ exported by the instrument\n\n##TITLE=film\n##JCAMP-DX=4.24\n';

test('a JCAMP label is found under a comment and a blank line, not under data', () => {
  expect(startsJcamp('##TITLE=film')).toBe(true);
  expect(startsJcamp(COMMENTED)).toBe(true);
  expect(startsJcamp('1 2\n##TITLE=film')).toBe(false);
  expect(startsJcamp('\n\n\n\n\n##TITLE=film')).toBe(false);
});

test('the three viewers read a commented JCAMP as JCAMP', () => {
  expect([
    detectIrFormat(COMMENTED),
    detectMassFormat(COMMENTED),
    detectFormat(COMMENTED),
  ]).toStrictEqual(['jcamp', 'jcamp', 'jcamp']);
});

test('a file input accepts every extension the table knows', () => {
  const table = new Map([
    ['jdx', 'jcamp'],
    ['txt', 'text'],
  ]);

  expect(acceptOf(table)).toBe('.jdx,.txt');
});
