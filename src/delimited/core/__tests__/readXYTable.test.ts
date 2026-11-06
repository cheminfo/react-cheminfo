import { expect, test } from 'vitest';

import { readXYTable } from '../readXYTable.ts';

test('a table is read from its first two columns, under its header and beside its assignments', () => {
  const text = [
    'mz\tintensity\tdeltaNeutrons\tassignment',
    '287.05501\t100.0000\t0\tA, [ ¹²C₁₅ ¹H₁₁ ¹⁶O₆ ]',
    '288.05837\t16.2236\t1\tA+1, [ ¹³C ]',
    '289.06345\t2.1766e-4\t2\tA+2, [ ¹⁷O₂ ]',
  ].join('\n');

  expect(readXYTable(text)).toStrictEqual({
    x: [287.05501, 288.05837, 289.06345],
    y: [100, 16.2236, 2.1766e-4],
  });
});

test('a comma separated table keeps a comma quoted inside its last cell', () => {
  expect(
    readXYTable('mz,intensity,note\n100.5,12,"M, loss"\n101.5,3,'),
  ).toStrictEqual({ x: [100.5, 101.5], y: [12, 3] });
});

test('a decimal comma reads as a point', () => {
  expect(readXYTable('100,5\t12,25\tion')).toStrictEqual({
    x: [100.5],
    y: [12.25],
  });
});

test('a row whose first two cells are not both numbers is skipped', () => {
  const text = [
    'note\tnone',
    '100\t',
    '\t12',
    '101',
    '102 Da\t5',
    '103\t5\tkept',
  ].join('\n');

  expect(readXYTable(text)).toStrictEqual({ x: [103], y: [5] });
});

test('text with no numbers gives two empty columns', () => {
  expect(readXYTable('hello\nworld')).toStrictEqual({ x: [], y: [] });
  expect(readXYTable('')).toStrictEqual({ x: [], y: [] });
});
