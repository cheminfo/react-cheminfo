import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import { EmptyLoci } from 'molstar/lib/mol-model/loci.js';
import type { Shape } from 'molstar/lib/mol-model/shape.js';
import { ShapeGroup } from 'molstar/lib/mol-model/shape.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';
import { assert, beforeAll, expect, test } from 'vitest';

import type { Measurement } from '../../../molecule3d/core/measurement.ts';
import {
  measurementOfLoci,
  subscribeHoverMeasurement,
} from '../measurementLoci.ts';

import { acetoneStructure } from './acetone.ts';
import { fakeHover } from './fakeHover.ts';
import { atom } from './measurementStandIn.ts';

// Lowercased: they are factories, not constructors.
const elementLoci = StructureElement.Loci;
const groupLoci = ShapeGroup.Loci;

let acetone: Structure;

beforeAll(async () => {
  acetone = await acetoneStructure();
});

test('a hovered distance, angle or dihedral names its kind and its atoms in drawing order', () => {
  expect(
    measurementOfLoci(acetone, drawn({ pairs: [bundle(1, 2)] })),
  ).toStrictEqual({ kind: 'distance', atoms: [atom(1), atom(2)] });
  expect(
    measurementOfLoci(acetone, drawn({ triples: [bundle(0, 1, 2)] })),
  ).toStrictEqual({ kind: 'angle', atoms: [atom(0), atom(1), atom(2)] });
  expect(
    measurementOfLoci(acetone, drawn({ quads: [bundle(4, 0, 1, 3)] })),
  ).toStrictEqual({
    kind: 'dihedral',
    atoms: [atom(4), atom(0), atom(1), atom(3)],
  });
});

test('the hovered group picks its own bundle of a shape drawing several', () => {
  const loci = drawn({ pairs: [bundle(1, 2), bundle(0, 3)] }, 1);

  expect(measurementOfLoci(acetone, loci)).toStrictEqual({
    kind: 'distance',
    atoms: [atom(0), atom(3)],
  });
});

test('an atom, a shape that is no measurement, or a bundle without atoms is no measurement', () => {
  expect(measurementOfLoci(acetone, atomLoci(acetone, 1))).toBeUndefined();
  expect(measurementOfLoci(acetone, EmptyLoci)).toBeUndefined();
  expect(measurementOfLoci(acetone, drawn({ mesh: [] }))).toBeUndefined();
  expect(measurementOfLoci(acetone, drawn(undefined))).toBeUndefined();
  expect(
    measurementOfLoci(acetone, drawn({ pairs: [bundle(1, 2)] }, 3)),
  ).toBeUndefined();
  expect(
    measurementOfLoci(
      acetone,
      drawn({ pairs: [{ loci: [atomLoci(acetone, 1), EmptyLoci] }] }),
    ),
  ).toBeUndefined();
  expect(
    measurementOfLoci(acetone, drawn({ pairs: [{ loci: 'none' }] })),
  ).toBeUndefined();
});

test('the measurement under the pointer is reported once per change, then null', () => {
  const hover = fakeHover();
  const seen: Array<Measurement | null> = [];

  const stop = subscribeHoverMeasurement(
    hover.plugin,
    () => acetone,
    (measurement) => seen.push(measurement),
  );
  // Two dashes of the same line.
  hover.emit(drawn({ pairs: [bundle(1, 2)] }));
  hover.emit(drawn({ pairs: [bundle(1, 2)] }));
  hover.emit(drawn({ triples: [bundle(0, 1, 2)] }));
  hover.emit(atomLoci(acetone, 1));
  hover.emit(EmptyLoci);
  stop();
  hover.emit(drawn({ pairs: [bundle(1, 2)] }));

  expect(seen).toStrictEqual([
    { kind: 'distance', atoms: [atom(1), atom(2)] },
    { kind: 'angle', atoms: [atom(0), atom(1), atom(2)] },
    null,
  ]);
  expect(hover.unsubscribed).toBe(1);
});

/**
 * What molstar reports under the pointer for one group of a measurement shape.
 * @param sourceData - What the shape was drawn from.
 * @param group - The hovered group.
 * @returns The loci.
 */
function drawn(sourceData: unknown, group = 0): ShapeGroup.Loci {
  const shape = { sourceData } as unknown as Shape;
  return groupLoci(shape, [
    { ids: OrderedSet.ofSingleton(group), instance: 0 },
  ]);
}

function bundle(...atoms: number[]) {
  return { loci: atoms.map((element) => atomLoci(acetone, element)) };
}

function atomLoci(structure: Structure, element: number) {
  const unit = structure.units[0];
  assert(unit !== undefined, 'acetone has one unit');
  return elementLoci(structure, [
    {
      unit,
      indices: OrderedSet.ofSingleton(element as StructureElement.UnitIndex),
    },
  ]);
}
