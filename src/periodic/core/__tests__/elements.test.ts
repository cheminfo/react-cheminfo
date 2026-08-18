import { elements as chemicalElements } from 'chemical-elements';
import { expect, test } from 'vitest';

import {
  PERIODIC_ELEMENTS,
  elementByAtomicNumber,
  elementBySymbol,
} from '../elements.ts';

test('the table holds the 118 elements, in atomic-number order', () => {
  expect(PERIODIC_ELEMENTS).toHaveLength(118);

  for (const [index, element] of PERIODIC_ELEMENTS.entries()) {
    expect(element.atomicNumber).toBe(index + 1);
  }
});

test('every symbol and name still agrees with chemical-elements', () => {
  const disagreeing: string[] = [];
  for (const element of PERIODIC_ELEMENTS) {
    const reference = chemicalElements[element.atomicNumber - 1];
    if (
      reference?.symbol !== element.symbol ||
      reference.name !== element.name
    ) {
      disagreeing.push(element.symbol);
    }
  }

  // `chemical-elements` 2.3.2 spells element 117 "Teennessine". The fix is
  // committed upstream in mass-tools; delete this exception once it ships, at
  // which point this test says so by failing.
  expect(disagreeing).toStrictEqual(['Ts']);
});

test('the f block carries no group, and every other element carries one', () => {
  const groupless: string[] = [];
  const outOfRange: string[] = [];
  for (const element of PERIODIC_ELEMENTS) {
    const isInnerTransition =
      element.category === 'lanthanoid' || element.category === 'actinoid';
    if (element.group === null) {
      groupless.push(element.symbol);
    } else if (isInnerTransition || element.group < 1 || element.group > 18) {
      outOfRange.push(element.symbol);
    }
  }

  expect(groupless).toHaveLength(30);
  expect(outOfRange).toStrictEqual([]);
});

test('the block follows the position in the table', () => {
  expect(elementBySymbol('He')?.block).toBe('s');
  expect(elementBySymbol('C')?.block).toBe('p');
  expect(elementBySymbol('Fe')?.block).toBe('d');
  expect(elementBySymbol('Zn')?.block).toBe('d');
  expect(elementBySymbol('Nd')?.block).toBe('f');
  expect(elementBySymbol('U')?.block).toBe('f');
});

test('an element is found by symbol and by atomic number', () => {
  expect(elementBySymbol('Cl')).toStrictEqual({
    atomicNumber: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    period: 3,
    group: 17,
    block: 'p',
    category: 'halogen',
  });
  expect(elementByAtomicNumber(17)?.symbol).toBe('Cl');
});

test('a symbol or an atomic number outside the table finds nothing', () => {
  expect(elementBySymbol('cl')).toBeUndefined();
  expect(elementBySymbol('Xx')).toBeUndefined();
  expect(elementByAtomicNumber(0)).toBeUndefined();
  expect(elementByAtomicNumber(119)).toBeUndefined();
});

test('each family holds the elements it is named for', () => {
  const counts = new Map<string, number>();
  for (const element of PERIODIC_ELEMENTS) {
    counts.set(element.category, (counts.get(element.category) ?? 0) + 1);
  }

  expect(counts.get('lanthanoid')).toBe(15);
  expect(counts.get('actinoid')).toBe(15);
  expect(counts.get('noble-gas')).toBe(7);
  expect(counts.get('alkali-metal')).toBe(6);
  expect(counts.get('halogen')).toBe(6);
});
