import { MF } from 'mf-parser';
import { expect, test } from 'vitest';

import {
  atomCounts,
  canonicalFormula,
  formulaHtml,
  formulaText,
} from '../formulaText.ts';
import { normalizeFormula } from '../normalizeFormula.ts';
import {
  FormulaError,
  atomicNumber,
  elementName,
  readFormula,
} from '../readFormula.ts';

test('the parser alone misreads a trailing charge and a hydrate dot', () => {
  // What this module exists to work around: if either assertion starts failing,
  // mf-parser has been fixed and the rewrite below can be reconsidered.
  expect(new MF('NO3-').getInfo().charge).toBe(0);
  expect(new MF('CuSO4.5H2O').getInfo().mf).toBe('H2CuO5.5S');
});

test('a trailing charge is rewritten into the syntax the parser reads', () => {
  expect(normalizeFormula('NO3-')).toBe('NO3(-1)');
  expect(normalizeFormula('SO4--')).toBe('SO4(-2)');
  expect(normalizeFormula('S2O3-2')).toBe('S2O3(-2)');
  expect(normalizeFormula('CO3 2-')).toBe('CO3(-2)');
  expect(normalizeFormula('CO3^2-')).toBe('CO3(-2)');
  expect(normalizeFormula('NH4+')).toBe('NH4(+1)');
  expect(normalizeFormula('Fe+3')).toBe('Fe(+3)');
});

test('a charge already in parentheses is left as it is', () => {
  expect(normalizeFormula('NO3(1-)')).toBe('NO3(1-)');
  expect(normalizeFormula(' Fe(3+) ')).toBe('Fe(3+)');
});

test('a hydrate dot becomes a part separator, never a decimal', () => {
  expect(normalizeFormula('CuSO4.5H2O')).toBe('CuSO4 . 5H2O');
  expect(normalizeFormula('CuSO4·5H2O')).toBe('CuSO4 . 5H2O');
  expect(normalizeFormula('CuSO4*5H2O')).toBe('CuSO4 . 5H2O');
});

test('a formula is read into atoms and charge', () => {
  const nitrate = readFormula('NO3-');

  expect(nitrate.charge).toBe(-1);
  expect([...atomCounts(nitrate)]).toStrictEqual([
    ['N', 1],
    ['O', 3],
  ]);

  const hydrate = readFormula('CuSO4.5H2O');

  expect(hydrate.parts).toHaveLength(2);
  expect(Object.fromEntries(atomCounts(hydrate))).toStrictEqual({
    Cu: 1,
    S: 1,
    O: 9,
    H: 10,
  });
});

test('an isotope keeps its mass number, atoms in the order written', () => {
  expect(readFormula('[238U][19F]6').parts[0]?.atoms).toStrictEqual([
    { symbol: 'U', massNumber: 238, count: 1 },
    { symbol: 'F', massNumber: 19, count: 6 },
  ]);
});

test('what is not a formula says why, for a student', () => {
  expect(() => readFormula('')).toThrow(FormulaError);
  expect(() => readFormula('')).toThrow('Type a formula first.');
  expect(() => readFormula('Hx')).toThrow('“Hx” is not an element symbol.');
  expect(() => atomicNumber('Xx')).toThrow('“Xx” is not an element symbol.');
});

test('an element is named and numbered as the periodic table writes it', () => {
  expect(atomicNumber('Fe')).toBe(26);
  expect(elementName('Fe')).toBe('Iron');
  expect(elementName('Xx')).toBe('Xx');
});

test('two spellings of one compound share a canonical formula', () => {
  expect(canonicalFormula('NaOH')).toBe(canonicalFormula('HONa'));
  expect(canonicalFormula('NaOH')).toBe(canonicalFormula('NaHO'));
  expect(canonicalFormula('H2O')).not.toBe(canonicalFormula('D2O'));
});

test('a formula typed in the wrong case is fixed only when asked', () => {
  expect(canonicalFormula('c9h6n4', { fixCase: true })).toBe('C9H6N4');
  expect(canonicalFormula('N4C9H6', { fixCase: true })).toBe('C9H6N4');
  expect(() => canonicalFormula('c9h6n4')).toThrow(FormulaError);
});

test('a formula in prose is written the way a chemist writes it', () => {
  expect(formulaText('NO3-')).toBe('NO₃⁻');
  expect(formulaText('Fe(3+)')).toBe('Fe³⁺');
  expect(formulaText('S2O3(2-)')).toBe('S₂O₃²⁻');
  expect(formulaText('[238U][19F]6')).toBe('²³⁸U¹⁹F₆');
  expect(formulaText('H2O')).toBe('H₂O');
  expect(formulaText('not one')).toBe('not one');
});

test('a formula copied as HTML keeps its subscripts', () => {
  expect(formulaHtml('H2O')).toBe('H<sub>2</sub>O');
  expect(formulaHtml('  ?? ')).toBe('??');
});
