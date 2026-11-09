import { expect, test } from 'vitest';

import { parseRichText } from '../richText.ts';

test('the digits of a formula are subscripts without being marked', () => {
  expect(parseRichText('Pd(PPh3)4, K2CO3', true)).toStrictEqual([
    [
      { text: 'Pd(PPh' },
      { text: '3', script: 'sub' },
      { text: ')' },
      { text: '4', script: 'sub' },
      { text: ', K' },
      { text: '2', script: 'sub' },
      { text: 'CO' },
      { text: '3', script: 'sub' },
    ],
  ]);
  // A number standing on its own, a temperature or a time, is left alone.
  expect(parseRichText('THF, 80 °C, 12 h', true)).toStrictEqual([
    [{ text: 'THF, 80 °C, 12 h' }],
  ]);
});

test('a charge ending a word is raised, and the number of an R too', () => {
  expect(parseRichText('Na+, Ca2+, Cl-', true)).toStrictEqual([
    [
      { text: 'Na' },
      { text: '+', script: 'sup' },
      { text: ', Ca' },
      { text: '2+', script: 'sup' },
      { text: ', Cl' },
      { text: '−', script: 'sup' },
    ],
  ]);
  expect(parseRichText('t-BuOK, R1', true)).toStrictEqual([
    [{ text: 't-BuOK, R' }, { text: '1', script: 'sup' }],
  ]);
});

test('marks write italic, bold, scripts and lines, and a backslash keeps a mark', () => {
  expect(parseRichText('*n*-BuLi\n**1a**', true)).toStrictEqual([
    [{ text: 'n', italic: true }, { text: '-BuLi' }],
    [{ text: '1a', bold: true }],
  ]);
  expect(parseRichText(String.raw`x^{2-}_i \*`, false)).toStrictEqual([
    [
      { text: 'x' },
      { text: '2−', script: 'sup' },
      { text: 'i', script: 'sub' },
      { text: ' *' },
    ],
  ]);
  expect(parseRichText('C18 column', false)).toStrictEqual([
    [{ text: 'C18 column' }],
  ]);
});
