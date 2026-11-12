import { expect, test } from 'vitest';

import {
  createInstrument,
  factorRows,
  putInstrument,
  readSensitivityFactors,
  removeInstrument,
  withFactor,
  withFactors,
  withoutFactor,
} from '../instrumentEdits.ts';
import type { XpsInstrument } from '../xpsInstrument.ts';

const KRATOS: XpsInstrument = {
  id: 'kratos',
  name: 'Kratos',
  factors: [
    { element: 'C', orbital: '1s', factor: 0.278 },
    { element: 'O', orbital: '1s', factor: 0.78 },
  ],
};

test('a table is read whatever separators the software wrote it with', () => {
  const reading = readSensitivityFactors(
    [
      'Element\tLevel\tRSF',
      'C 1s 0.278',
      'O1s\t0,78',
      'n;1S;0.477',
      'Fe 2p3 2.957',
      'Mo,3d5/2,1.66',
      'S 2p 6.68e-1',
    ].join('\n'),
  );

  expect(reading).toStrictEqual({
    factors: [
      { element: 'C', orbital: '1s', factor: 0.278 },
      { element: 'O', orbital: '1s', factor: 0.78 },
      { element: 'N', orbital: '1s', factor: 0.477 },
      { element: 'Fe', orbital: '2p3/2', factor: 2.957 },
      { element: 'Mo', orbital: '3d5/2', factor: 1.66 },
      { element: 'S', orbital: '2p', factor: 0.668 },
    ],
    rejected: [],
  });
});

test('a line that is no factor is handed back as it was written', () => {
  const reading = readSensitivityFactors(
    'C 1s 0.278\nXx 1s 1\nC 1s 0\nC 9s 1\nC 1s\nnot a line\n\n',
  );

  expect(reading).toStrictEqual({
    factors: [{ element: 'C', orbital: '1s', factor: 0.278 }],
    rejected: ['Xx 1s 1', 'C 1s 0', 'C 9s 1', 'C 1s', 'not a line'],
  });
});

test('a first line holding a number is no header, and is handed back', () => {
  expect(readSensitivityFactors('C 1s abc 1\nO 1s 0.78')).toStrictEqual({
    factors: [{ element: 'O', orbital: '1s', factor: 0.78 }],
    rejected: ['C 1s abc 1'],
  });
});

test('a factor replaces the one of its line, or is added after the others', () => {
  expect(
    withFactor(KRATOS, { element: 'O', orbital: '1s', factor: 0.711 }).factors,
  ).toStrictEqual([
    { element: 'C', orbital: '1s', factor: 0.278 },
    { element: 'O', orbital: '1s', factor: 0.711 },
  ]);
  expect(
    withFactors(KRATOS, [
      { element: 'N', orbital: '1s', factor: 0.477 },
      { element: 'C', orbital: '1s', factor: 0.25 },
    ]).factors,
  ).toStrictEqual([
    { element: 'C', orbital: '1s', factor: 0.25 },
    { element: 'O', orbital: '1s', factor: 0.78 },
    { element: 'N', orbital: '1s', factor: 0.477 },
  ]);
  expect(withoutFactor(KRATOS, 'C', '1s').factors).toStrictEqual([
    { element: 'O', orbital: '1s', factor: 0.78 },
  ]);
  expect(KRATOS.factors).toHaveLength(2);
});

test('an instrument is added, replaced and deleted without touching the list', () => {
  const created = createInstrument('Thermo', [
    { element: 'C', orbital: '1s', factor: 1 },
  ]);
  const list = [KRATOS];

  expect(created.id).toMatch(/^instrument-[\da-f-]{36}$/u);
  expect(putInstrument(list, created)).toStrictEqual([KRATOS, created]);
  expect(putInstrument(list, { ...KRATOS, name: 'Kratos Axis' })).toStrictEqual(
    [{ ...KRATOS, name: 'Kratos Axis' }],
  );
  expect(removeInstrument(list, 'kratos')).toStrictEqual([]);
  expect(list).toStrictEqual([KRATOS]);
});

test('an instrument is copied out one line per level', () => {
  expect(factorRows(KRATOS)).toStrictEqual([
    ['C', '1s', '0.278'],
    ['O', '1s', '0.78'],
  ]);
});
