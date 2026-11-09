import { expect, test } from 'vitest';

import { chemicalRanges } from '../chemicalText.ts';
import { parseRichText } from '../richText.ts';

// A line as a reader sees it: `_[…]` lowered, `^[…]` raised.
function shown(text: string): string {
  return (parseRichText(text, true)[0] ?? [])
    .map((span) => {
      if (span.script === 'sub') return `_[${span.text}]`;
      if (span.script === 'sup') return `^[${span.text}]`;
      return span.text;
    })
    .join('');
}

test('the digits before the charge of one element are the charge', () => {
  expect(shown('Ca2+, Fe3+, (Al3+)')).toBe('Ca^[2+], Fe^[3+], (Al^[3+])');
  expect(shown('O2-')).toBe('O^[2−]');
  // Two digits: the atoms, then the charge.
  expect(shown('Hg22+')).toBe('Hg_[2]^[2+]');
});

test('one digit before the charge of several atoms counts them', () => {
  expect(shown('NO3-, NH4+, H3O+, MnO4-')).toBe(
    'NO_[3]^[−], NH_[4]^[+], H_[3]O^[+], MnO_[4]^[−]',
  );
  expect(shown('SO42-, PO43-, Cr2O72-')).toBe(
    'SO_[4]^[2−], PO_[4]^[3−], Cr_[2]O_[7]^[2−]',
  );
  expect(shown('C60-')).toBe('C_[60]^[−]');
});

test('a run of signs is a charge, written as its number and one sign', () => {
  expect(shown('NO3--, SO4--, Ca++, Fe+++')).toBe(
    'NO_[3]^[2−], SO_[4]^[2−], Ca^[2+], Fe^[3+]',
  );
});

test('a charge after a bracket is the number before the sign', () => {
  expect(shown('[Cu(NH3)4]2+, [Fe(CN)6]4-')).toBe(
    '[Cu(NH_[3])_[4]]^[2+], [Fe(CN)_[6]]^[4−]',
  );
  expect(shown('Fe(CN)64-')).toBe('Fe(CN)_[6]^[4−]');
});

test('a charge in parentheses, as mf-parser writes one, is raised without them', () => {
  expect(shown('SO4(2-), O2(-), Fe(+3), Ca(2+)')).toBe(
    'SO_[4]^[2−], O_[2]^[−], Fe^[3+], Ca^[2+]',
  );
  expect(shown('Pd(0)')).toBe('Pd(0)');
});

test('a sign that is not a charge is left alone', () => {
  expect(shown('1- and 2-substituted, (+)-camphor')).toBe(
    '1- and 2-substituted, (+)-camphor',
  );
  expect(shown('a result-- here, t-BuOK')).toBe('a result-- here, t-BuOK');
  expect(shown('e-')).toBe('e^[−]');
});

test('a charge ending a sentence is still raised', () => {
  expect(shown('Then H3O+.')).toBe('Then H_[3]O^[+].');
});

test('what a mark has set is left to the mark', () => {
  expect(chemicalRanges('CH2', [false, false, true])).toStrictEqual([]);
  expect(parseRichText('**Ca**2+', true)).toStrictEqual([
    [
      { text: 'Ca', bold: true },
      { text: '2+', script: 'sup' },
    ],
  ]);
  expect(parseRichText(String.raw`C\2`, true)).toStrictEqual([
    [{ text: 'C2' }],
  ]);
});
