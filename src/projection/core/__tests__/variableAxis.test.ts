import { expect, test } from 'vitest';

import type {
  ContinuousVariableAxis,
  NamedVariableAxis,
} from '../variableAxis.ts';
import {
  variableCount,
  variableDecimals,
  variableLabel,
} from '../variableAxis.ts';

const SPECTRUM: ContinuousVariableAxis = {
  kind: 'continuous',
  values: [1650, 1700, 1750],
  label: 'Wavenumber',
  unit: 'cm⁻¹',
  direction: 'descending',
};

const TABLE: NamedVariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
  label: 'Measurement',
};

test('a continuous axis carries one value per measurement', () => {
  expect(variableCount(SPECTRUM)).toBe(3);
  expect(variableCount({ kind: 'continuous', values: [], label: 'm/z' })).toBe(
    0,
  );
});

test('a named axis carries one name per measurement', () => {
  expect(variableCount(TABLE)).toBe(4);
  expect(variableCount({ kind: 'named', names: ['Only'] })).toBe(1);
});

test('a continuous measurement is written with its unit', () => {
  expect(
    variableLabel(
      {
        kind: 'continuous',
        values: [1650],
        label: 'Wavenumber',
        unit: 'cm⁻¹',
      },
      0,
    ),
  ).toBe('1650 cm⁻¹');
  expect(variableLabel(SPECTRUM, 2)).toBe('1750 cm⁻¹');
});

test('a continuous axis with no unit is written as the bare number', () => {
  const axis: ContinuousVariableAxis = {
    kind: 'continuous',
    values: [0.5, 12.25],
    label: 'Time',
  };

  expect(variableLabel(axis, 0)).toBe('0.5');
  expect(variableLabel(axis, 1)).toBe('12.25');
});

test('a named measurement is written as its name', () => {
  expect(variableLabel({ kind: 'named', names: ['Petal length'] }, 0)).toBe(
    'Petal length',
  );
  expect(variableLabel(TABLE, 3)).toBe('Petal width');
});

test('an index outside the axis names nothing', () => {
  expect(variableLabel(SPECTRUM, 3)).toBe('');
  expect(variableLabel(TABLE, 4)).toBe('');
  expect(variableLabel(SPECTRUM, -1)).toBe('');
  expect(variableLabel(TABLE, -1)).toBe('');
  expect(variableLabel(SPECTRUM, 1.5)).toBe('');
  expect(variableLabel(SPECTRUM, Number.NaN)).toBe('');
});

test('a resampled axis writes whole values under its own ticks', () => {
  const grid: ContinuousVariableAxis = {
    kind: 'continuous',
    values: [800, 878.9834, 957.9668],
    label: 'Wavenumber',
    unit: 'cm⁻¹',
  };

  expect(variableDecimals(grid)).toBe(0);
  expect(variableLabel(grid, 1, 0)).toBe('879 cm⁻¹');
  expect(variableLabel(grid, 2, 0)).toBe('958 cm⁻¹');
  // The readout goes on naming the slot as the caller handed it in.
  expect(variableLabel(grid, 1)).toBe('878.9834 cm⁻¹');
});

test('a narrow axis keeps the decimals its own span asks for', () => {
  const shifts: ContinuousVariableAxis = {
    kind: 'continuous',
    values: [0.5, 3.25, 7.4321],
    label: 'Shift',
    unit: 'ppm',
  };

  expect(variableDecimals(shifts)).toBe(1);
  expect(variableLabel(shifts, 2, 1)).toBe('7.4 ppm');
  expect(variableLabel(shifts, 0, 1)).toBe('0.5 ppm');
});

test('an axis with nothing to measure across is written in full', () => {
  const one: ContinuousVariableAxis = {
    kind: 'continuous',
    values: [878.9834],
    label: 'Wavenumber',
    unit: 'cm⁻¹',
  };

  expect(variableDecimals(one)).toBe(6);
  expect(variableLabel(one, 0, 6)).toBe('878.9834 cm⁻¹');
  expect(variableDecimals(TABLE)).toBe(0);
  expect(variableLabel(TABLE, 0, 0)).toBe('Sepal length');
});
