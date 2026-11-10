import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import { EmptyLoci } from 'molstar/lib/mol-model/loci.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';
import { assert, expect, test } from 'vitest';

import type { AtomReference } from '../../../molecule3d/core/measurement.ts';
import { subscribeHoverAtom } from '../hover.ts';

import { acetoneStructure } from './acetone.ts';
import { fakeHover } from './fakeHover.ts';

const elementLoci = StructureElement.Loci;

function atomsLoci(structure: Structure, atoms: readonly number[]) {
  const unit = structure.units[0];
  assert(unit !== undefined, 'acetone has one unit');
  return elementLoci(structure, [
    {
      unit,
      indices: OrderedSet.ofSortedArray(
        Int32Array.from(atoms) as unknown as StructureElement.UnitIndex[],
      ),
    },
  ]);
}

test('the atom under the pointer is reported once, as highlights address it, then null', async () => {
  const structure = await acetoneStructure();
  const hover = fakeHover();
  const seen: Array<AtomReference | null> = [];

  const stop = subscribeHoverAtom(
    hover.plugin,
    () => structure,
    (atom) => seen.push(atom),
  );
  hover.emit(atomsLoci(structure, [2]));
  hover.emit(atomsLoci(structure, [2]));
  hover.emit(atomsLoci(structure, [6]));
  hover.emit(EmptyLoci);
  hover.emit(EmptyLoci);
  stop();
  hover.emit(atomsLoci(structure, [2]));

  expect(seen).toStrictEqual([
    { unit: 0, element: 2 },
    { unit: 0, element: 6 },
    null,
  ]);
  expect(hover.unsubscribed).toBe(1);
});

test('two atoms at once, or no structure on screen, is no atom', async () => {
  const structure = await acetoneStructure();
  const hover = fakeHover();
  const seen: Array<AtomReference | null> = [];
  let onScreen: Structure | undefined = structure;

  subscribeHoverAtom(
    hover.plugin,
    () => onScreen,
    (atom) => seen.push(atom),
  );
  hover.emit(atomsLoci(structure, [0]));
  hover.emit(atomsLoci(structure, [0, 1]));
  hover.emit(atomsLoci(structure, [3]));
  onScreen = undefined;
  hover.emit(atomsLoci(structure, [4]));

  expect(seen).toStrictEqual([
    { unit: 0, element: 0 },
    null,
    { unit: 0, element: 3 },
    null,
  ]);
});
