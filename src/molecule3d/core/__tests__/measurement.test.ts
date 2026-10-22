import { expect, test } from 'vitest';

import type { AtomReference, Measurement } from '../measurement.ts';
import { sameMeasurements } from '../measurement.ts';

const C_O: Measurement = { kind: 'distance', atoms: atoms(1, 2) };
const C_C_O: Measurement = { kind: 'angle', atoms: atoms(0, 1, 2) };

test('the same measurements in new objects are the same', () => {
  const copy = structuredClone([C_O, C_C_O]);

  expect(sameMeasurements([C_O, C_C_O], copy)).toBe(true);
  expect(sameMeasurements([], [])).toBe(true);
});

test('another kind, other atoms, another order or another count differ', () => {
  const angleOverDistance: Measurement = { kind: 'angle', atoms: atoms(1, 2) };

  expect(sameMeasurements([C_O], [angleOverDistance])).toBe(false);
  expect(
    sameMeasurements([C_O], [{ kind: 'distance', atoms: atoms(2, 1) }]),
  ).toBe(false);
  expect(
    sameMeasurements(
      [C_O],
      [{ kind: 'distance', atoms: [{ unit: 1, element: 1 }, atom(2)] }],
    ),
  ).toBe(false);
  expect(sameMeasurements([C_O, C_C_O], [C_C_O, C_O])).toBe(false);
  expect(sameMeasurements([C_O], [C_O, C_C_O])).toBe(false);
  expect(sameMeasurements([C_O], [])).toBe(false);
});

function atom(element: number): AtomReference {
  return { unit: 0, element };
}

function atoms(...elements: number[]): AtomReference[] {
  return elements.map(atom);
}
