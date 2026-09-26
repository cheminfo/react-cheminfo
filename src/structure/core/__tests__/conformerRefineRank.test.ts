import { expect, test } from 'vitest';

import type { ConformerRefinement } from '../conformerRefine.ts';
import type { RefinedMinimum } from '../conformerRefineRank.ts';
import {
  isRefinedDuplicate,
  rankByRefinedEnergy,
} from '../conformerRefineRank.ts';
import type { ConformerShape } from '../conformerShape.ts';
import type { Conformer } from '../conformers.ts';

test('the set is ordered by refined energy, renumbered, and measured from the lowest', () => {
  const ranked = rankByRefinedEnergy([
    conformer(1, -100),
    conformer(2, -103),
    conformer(3, -101.5),
  ]);

  expect(ranked.conformers.map((entry) => entry.id)).toStrictEqual([1, 2, 3]);
  expect(
    ranked.conformers.map((entry) => entry.refinement?.forceFieldId),
  ).toStrictEqual([2, 3, 1]);
  expect(
    ranked.conformers.map((entry) => entry.refinement?.relativeEnergy),
  ).toStrictEqual([0, 1.5, 3]);
  // Ranks 1, 2 and 3 became 3, 1 and 2: not one of them kept its place.
  expect(ranked.reordered).toBe(3);
});

test('a conformer with no refinement ranks after every one that has one', () => {
  const ranked = rankByRefinedEnergy([
    unrefined(1),
    conformer(2, -50),
    unrefined(3),
    conformer(4, -80),
  ]);

  expect(
    ranked.conformers.map((entry) => entry.refinement?.energy ?? null),
  ).toStrictEqual([-80, -50, null, null]);
  // The two without one keep the order they came in.
  expect(ranked.conformers.map((entry) => entry.molfile.data)).toStrictEqual([
    'conformer 4',
    'conformer 2',
    'conformer 1',
    'conformer 3',
  ]);
  // And they are left without one rather than given a relative energy.
  expect(ranked.conformers[2]?.refinement).toBeNull();
  expect(ranked.conformers[3]?.refinement).toBeNull();
});

test('a set where nothing was refined keeps its order and reports no zero', () => {
  const ranked = rankByRefinedEnergy([unrefined(1), unrefined(2)]);

  expect(ranked.conformers.map((entry) => entry.id)).toStrictEqual([1, 2]);
  expect(ranked.reordered).toBe(0);

  for (const entry of ranked.conformers) expect(entry.refinement).toBeNull();
});

test('an empty set ranks to an empty set', () => {
  expect(rankByRefinedEnergy([])).toStrictEqual({
    conformers: [],
    reordered: 0,
  });
});

test('one minimum is the same energy and the same shape; either alone is not', () => {
  const chair: RefinedMinimum = { energy: -100, shape: shape(0) };
  const mirror: RefinedMinimum = { energy: -100, shape: shape(-0.4) };
  const kept = [chair];

  expect(
    isRefinedDuplicate({ energy: -100, shape: shape(0) }, kept, 1e-4),
  ).toBe(true);
  // Same shape, energies a hundredth apart: two minima at this tolerance.
  expect(
    isRefinedDuplicate({ energy: -100.01, shape: shape(0) }, kept, 1e-4),
  ).toBe(false);
  // Same energy, opposite handedness: the two mirror images of one minimum are
  // two minima, which is the whole reason the shape is consulted.
  expect(isRefinedDuplicate(mirror, kept, 1e-4)).toBe(false);
  expect(isRefinedDuplicate(chair, [], 1e-4)).toBe(false);
});

test('a looser tolerance merges what a tighter one keeps apart', () => {
  const kept: RefinedMinimum[] = [{ energy: -100, shape: shape(0) }];
  const candidate: RefinedMinimum = { energy: -100.005, shape: shape(0) };

  expect(isRefinedDuplicate(candidate, kept, 1e-4)).toBe(false);
  expect(isRefinedDuplicate(candidate, kept, 0.01)).toBe(true);
});

function shape(chirality: number): ConformerShape {
  return { moments: [10, 20, 30], chirality };
}

function conformer(id: number, energy: number): Conformer {
  return { ...unrefined(id), refinement: refinement(id, energy) };
}

function unrefined(id: number): Conformer {
  return {
    id,
    molfile: { format: 'mol', data: `conformer ${id}` },
    energy: id,
    relativeEnergy: id - 1,
    refinement: null,
  };
}

function refinement(id: number, energy: number): ConformerRefinement {
  return {
    forceFieldId: id,
    energy,
    // Rewritten by the ranking, so a wrong value here proves it was rewritten.
    relativeEnergy: -1,
    dispersionEnergy: null,
    forceFieldEnergy: id,
    rmsd: 0.1,
    cycles: 5,
    converged: true,
  };
}
