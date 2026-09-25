import { Molecule } from 'openchemlib';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ConformerOptions } from '../conformerOptions.ts';
import { DEFAULT_CONFORMER_OPTIONS } from '../conformerOptions.ts';
import { refineConformers } from '../conformerRefine.ts';
import type { Conformer, ConformerSet } from '../conformers.ts';
import { continueConformers, generateConformers } from '../conformers.ts';
import type {
  GeometryRelaxer,
  RelaxableGeometry,
  RelaxedGeometry,
} from '../geometryRelaxer.ts';
import { readRelaxableGeometry } from '../moleculeCoordinates.ts';
import { registerResources } from '../oclResources.ts';

beforeAll(async () => {
  await registerResources();
});

test('a plain run is ranked by the force field and carries no refinement', () => {
  const set = butaneSet(3);

  expect(set.rankedBy).toBe('force-field');
  expect(set.refinement).toBeNull();

  for (const conformer of set.conformers) {
    expect(conformer.refinement).toBeNull();
  }
});

test('refining ranks the set by the new energies and keeps both of them', async () => {
  const set = butaneSet(3);
  const forceFieldOrder = set.conformers.map((conformer) => conformer.energy);
  // Reverse the force field's verdict exactly: the last conformer is now lowest.
  const refined = await refineConformers(
    set,
    relaxerReturning((index) => ({ energy: -100 - index })),
  );

  expect(refined.rankedBy).toBe('refined');
  expect(refined.refinement?.method).toBe('GFN2-xTB');
  expect(refined.refinement?.merged).toBe(0);
  // Reversing three conformers moves the outer two and leaves the middle one.
  expect(refined.refinement?.reordered).toBe(2);
  expect(refined.conformers.map((conformer) => conformer.id)).toStrictEqual([
    1, 2, 3,
  ]);
  expect(
    refined.conformers.map((conformer) => conformer.refinement?.energy),
  ).toStrictEqual([-102, -101, -100]);
  expect(
    refined.conformers.map((conformer) => conformer.refinement?.relativeEnergy),
  ).toStrictEqual([0, 1, 2]);
  // The force-field energies travel with the conformers, in the new order.
  expect(
    refined.conformers.map(
      (conformer) => conformer.refinement?.forceFieldEnergy,
    ),
  ).toStrictEqual(forceFieldOrder.toReversed());
  // And each conformer's own `energy` is still the force field's.
  expect(refined.conformers.map((conformer) => conformer.energy)).toStrictEqual(
    forceFieldOrder.toReversed(),
  );
});

test('a refinement that agrees with the force field reorders nothing', async () => {
  const set = butaneSet(3);
  const refined = await refineConformers(
    set,
    relaxerReturning((index) => ({ energy: index })),
  );

  expect(refined.refinement?.reordered).toBe(0);
  expect(
    refined.conformers.map((conformer) => conformer.refinement?.energy),
  ).toStrictEqual([0, 1, 2]);
  expect(
    refined.conformers.map((conformer) => conformer.refinement?.forceFieldId),
  ).toStrictEqual([1, 2, 3]);
});

test('every conformer remembers the rank it held before, so the two orders can be read against each other', async () => {
  const refined = await refineConformers(
    butaneSet(3),
    relaxerReturning((index) => ({ energy: -100 - index })),
  );

  expect(
    refined.conformers.map((conformer) => [
      conformer.id,
      conformer.refinement?.forceFieldId,
    ]),
  ).toStrictEqual([
    [1, 3],
    [2, 2],
    [3, 1],
  ]);
});

test('the relaxed coordinates reach the molfile, and the RMSD measures how far the atoms moved', async () => {
  const set = butaneSet(1);
  const before = readRelaxableGeometry(
    Molecule.fromMolfile(only(set).molfile.data),
  );

  const refined = await refineConformers(
    set,
    // One atom moved 0.1 A along x, and the whole molecule 5 A along y: the
    // translation must not reach the RMSD, the displacement must.
    relaxerReturning((index, geometry) => ({
      energy: -10,
      coordinates: shifted(geometry, 0.1, 5),
    })),
  );

  const after = only(refined);

  // Moving one atom of N by d also moves the centroid by d/N, so once both
  // centroids are removed the RMSD is d·sqrt(N-1)/N: 0.0258 A for d = 0.1 and
  // the 14 atoms of hydrogen-saturated butane.
  expect(after.refinement?.rmsd).toBeCloseTo((0.1 * Math.sqrt(13)) / 14, 12);

  const moved = readRelaxableGeometry(Molecule.fromMolfile(after.molfile.data));

  expect(moved.coordinates[0]).toBeCloseTo(
    (before.coordinates[0] as number) + 0.1,
    3,
  );
  expect(moved.coordinates[1]).toBeCloseTo(
    (before.coordinates[1] as number) + 5,
    3,
  );
});

test('two conformers that relax into one minimum are merged, and the set says so', async () => {
  const set = butaneSet(3);
  const shared = readRelaxableGeometry(
    Molecule.fromMolfile(only(set).molfile.data),
  ).coordinates;

  // All three land on the same energy and the same geometry.
  const refined = await refineConformers(set, async (geometries) =>
    geometries.map(() => relaxed({ energy: -42, coordinates: shared })),
  );

  expect(refined.conformers).toHaveLength(1);
  expect(refined.refinement?.merged).toBe(2);
  expect(refined.warnings).toContain(
    '2 conformer(s) relaxed into a GFN2-xTB minimum the set already held, so they were dropped.',
  );
});

test('an unconverged conformer is kept, with a warning that its energy is an upper bound', async () => {
  const refined = await refineConformers(
    butaneSet(1),
    relaxerReturning(() => ({ energy: -1, converged: false, cycles: 250 })),
  );

  expect(refined.conformers).toHaveLength(1);
  expect(refined.conformers[0]?.refinement?.converged).toBe(false);
  expect(refined.warnings).toStrictEqual([
    'The 1st conformer did not reach a GFN2-xTB minimum in 250 cycles, so its refined energy is an upper bound.',
  ]);
});

test('a warning the relaxer reports is attributed to its conformer', async () => {
  const refined = await refineConformers(
    butaneSet(1),
    relaxerReturning(() => ({ energy: -1, warnings: ['occ ran open-shell.'] })),
  );

  expect(refined.warnings).toStrictEqual([
    'The 1st conformer: occ ran open-shell.',
  ]);
});

test('the dispersion term travels through when the method reports one', async () => {
  const refined = await refineConformers(
    butaneSet(1),
    relaxerReturning(() => ({ energy: -1, dispersionEnergy: -0.25 })),
  );

  expect(refined.conformers[0]?.refinement?.dispersionEnergy).toBe(-0.25);
});

test('a method name of the caller reaches the set and the warnings', async () => {
  const refined = await refineConformers(
    butaneSet(1),
    relaxerReturning(() => ({ energy: -1, converged: false, cycles: 7 })),
    { method: 'PM6' },
  );

  expect(refined.refinement?.method).toBe('PM6');
  expect(refined.warnings[0]).toContain('a PM6 minimum in 7 cycles');
});

test('progress and cancellation are handed to the relaxer', async () => {
  const controller = new AbortController();
  const onSettled = vi.fn();
  const relax = vi.fn<GeometryRelaxer>(async (geometries, options) => {
    options?.onSettled?.(1, geometries.length);
    return geometries.map((geometry) =>
      relaxed({ energy: -1, coordinates: geometry.coordinates }),
    );
  });

  await refineConformers(butaneSet(2), relax, {
    onSettled,
    signal: controller.signal,
  });

  expect(relax).toHaveBeenCalledOnce();
  expect(relax.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
  expect(onSettled).toHaveBeenCalledWith(1, 2);
});

test('an empty set is refined into an empty refined set', async () => {
  const empty: ConformerSet = { ...butaneSet(1), conformers: [] };
  const refined = await refineConformers(empty, () => {
    throw new Error('the relaxer must not be called');
  });

  expect(refined.conformers).toStrictEqual([]);
  expect(refined.rankedBy).toBe('refined');
  expect(refined.refinement?.merged).toBe(0);
});

test('a relaxer that answers with the wrong count is refused', async () => {
  await expect(
    refineConformers(butaneSet(3), async () => [relaxed({ energy: -1 })]),
  ).rejects.toThrow('The relaxer answered with 1 geometries for 3 conformers.');
});

test('a refined set cannot be continued, because its energies and geometries no longer match', async () => {
  const molecule = butane();
  const set = generateConformers(molecule, options({ maxConformers: 1 }));
  const refined = await refineConformers(
    set,
    relaxerReturning(() => ({ energy: -1 })),
  );

  expect(() =>
    continueConformers(molecule, refined, {
      maxConformers: 2,
      timeoutSeconds: 10,
    }),
  ).toThrow(
    'This set was refined with GFN2-xTB, so it cannot be extended. Generate a larger set, then refine it again.',
  );
});

// A relaxer that returns each geometry unchanged, with the fields given.
function relaxerReturning(
  answer: (
    index: number,
    geometry: RelaxableGeometry,
  ) => Partial<RelaxedGeometry> & { energy: number },
): GeometryRelaxer {
  return async (geometries) =>
    geometries.map((geometry, index) =>
      relaxed({
        coordinates: geometry.coordinates,
        ...answer(index, geometry),
      }),
    );
}

function relaxed(
  fields: Partial<RelaxedGeometry> & { energy: number },
): RelaxedGeometry {
  return {
    coordinates: new Float64Array(0),
    dispersionEnergy: null,
    cycles: 3,
    converged: true,
    warnings: [],
    ...fields,
  };
}

// The first atom moved `along` in x, and the whole molecule `translated` in y.
// A shift applied to every atom would be a translation, which is exactly what
// the RMSD must not see.
function shifted(
  geometry: RelaxableGeometry,
  along: number,
  translated: number,
): Float64Array {
  const moved = new Float64Array(geometry.coordinates.length);
  for (let atom = 0; atom < geometry.elements.length; atom++) {
    moved[atom * 3] =
      (geometry.coordinates[atom * 3] as number) + (atom === 0 ? along : 0);
    moved[atom * 3 + 1] =
      (geometry.coordinates[atom * 3 + 1] as number) + translated;
    moved[atom * 3 + 2] = geometry.coordinates[atom * 3 + 2] as number;
  }
  return moved;
}

// The only conformer of a one-conformer set, so no test body holds a conditional.
function only(set: ConformerSet): Conformer {
  const [conformer] = set.conformers;
  if (conformer === undefined) throw new Error('the set holds no conformer');
  return conformer;
}

function butaneSet(maxConformers: number): ConformerSet {
  return generateConformers(butane(), options({ maxConformers }));
}

function butane(): Molecule {
  return Molecule.fromSmiles('CCCC');
}

function options(overrides: Partial<ConformerOptions>): ConformerOptions {
  return { ...DEFAULT_CONFORMER_OPTIONS, ...overrides };
}
