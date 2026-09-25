import { ConformerGenerator, Molecule } from 'openchemlib';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ConformerOptions } from '../conformerOptions.ts';
import { DEFAULT_CONFORMER_OPTIONS } from '../conformerOptions.ts';
import { generateConformers, strategyConstant } from '../conformers.ts';
import { molfileAtomCount } from '../molfile.ts';
import { registerResources } from '../oclResources.ts';

beforeAll(async () => {
  await registerResources();
});

test('butane stops on the conformer count and numbers the set from one', () => {
  const set = generateConformers(butane(), options({ maxConformers: 2 }));

  expect(set.conformers).toHaveLength(2);
  expect(ids(set.conformers)).toStrictEqual([1, 2]);
  expect(set.stoppedBy).toBe('count');
  expect(set.potentialConformerCount).toBe(3);
  expect(set.minimisation).toBe('MMFF94s+');
  expect(set.warnings).toStrictEqual([]);
});

test('every conformer molfile carries the hydrogen-saturated atom count', () => {
  const set = generateConformers(butane(), options({ maxConformers: 3 }));
  const counts: number[] = [];
  for (const conformer of set.conformers) {
    expect(conformer.molfile.format).toBe('mol');

    counts.push(molfileAtomCount(conformer.molfile.data));
  }

  expect(counts).toStrictEqual([14, 14, 14]);
});

test('the molecule handed in is never mutated', () => {
  const molecule = butane();

  expect(molecule.getAllAtoms()).toBe(4);

  generateConformers(molecule, options({ maxConformers: 2 }));

  expect(molecule.getAllAtoms()).toBe(4);
  expect(molecule.toIsomericSmiles()).toBe('CCCC');
});

test('without minimisation every energy and every relative energy is null', () => {
  const set = generateConformers(
    butane(),
    options({ maxConformers: 3, minimisation: 'none' }),
  );

  expect(set.conformers).toHaveLength(3);
  expect(set.minimisation).toBe('none');

  for (const conformer of set.conformers) {
    expect(conformer.energy).toBeNull();
    expect(conformer.relativeEnergy).toBeNull();
  }
});

test('MMFF94s+ puts exactly one conformer at a relative energy of zero', () => {
  const set = generateConformers(butane(), options({ maxConformers: 3 }));

  expect(set.conformers).toHaveLength(3);

  let zeroes = 0;
  let lowest = Number.POSITIVE_INFINITY;
  for (const conformer of set.conformers) {
    const { energy, relativeEnergy } = conformer;

    expect(typeof energy).toBe('number');
    expect(Number.isFinite(energy as number)).toBe(true);
    expect(relativeEnergy).toBeGreaterThanOrEqual(0);

    if (relativeEnergy === 0) zeroes++;
    if ((energy as number) < lowest) lowest = energy as number;
  }

  expect(zeroes).toBe(1);
  expect(lowest).toBeCloseTo(-5.076, 3);
});

test('hexane is listed most stable first and numbered in that order', () => {
  const set = generateConformers(
    Molecule.fromSmiles('CCCCCC'),
    options({ maxConformers: 6 }),
  );

  expect(ids(set.conformers)).toStrictEqual([1, 2, 3, 4, 5, 6]);
  expect(relativeEnergies(set.conformers)).toStrictEqual([
    0, 0.827, 0.827, 0.882, 0.882, 1.78,
  ]);
});

test('cyclohexane lists one chair: the flipped copy minimises into the same one', () => {
  const set = generateConformers(
    Molecule.fromSmiles('C1CCCCC1'),
    options({ maxConformers: 10 }),
  );

  expect(set.conformers).toHaveLength(1);
  expect(set.produced).toBe(2);
  expect(set.stoppedBy).toBe('exhausted');
  expect(set.potentialConformerCount).toBe(1);
  expect(set.conformers[0]?.energy).toBeCloseTo(-3.561, 3);
});

test('gauche butane and its mirror image are both listed, beside anti', () => {
  const set = generateConformers(butane(), options({ maxConformers: 10 }));

  expect(set.produced).toBe(3);
  expect(set.stoppedBy).toBe('exhausted');
  expect(relativeEnergies(set.conformers)).toStrictEqual([0, 0.782, 0.782]);
});

test('cyclohexanol keeps its equatorial and its axial chair apart', () => {
  const set = generateConformers(
    Molecule.fromSmiles('OC1CCCCC1'),
    options({ maxConformers: 10 }),
  );

  expect(set.produced).toBe(4);
  expect(set.conformers).toHaveLength(2);
  expect(
    relativeEnergies(set.conformers).toSorted((a, b) => a - b),
  ).toStrictEqual([0, 0.322]);
});

test('unminimised conformers are never merged, having no energy to compare', () => {
  const set = generateConformers(
    Molecule.fromSmiles('C1CCCCC1'),
    options({ maxConformers: 10, minimisation: 'none' }),
  );

  expect(set.conformers).toHaveLength(2);
});

test('a rigid molecule yields one conformer at relative energy zero', () => {
  const set = generateConformers(
    Molecule.fromSmiles('C=Cc1ccccc1'),
    options({ maxConformers: 5 }),
  );

  expect(set.conformers).toHaveLength(1);
  expect(set.stoppedBy).toBe('exhausted');

  const [conformer] = set.conformers;

  expect(conformer?.id).toBe(1);
  expect(conformer?.relativeEnergy).toBe(0);
  expect(conformer?.energy).toBeCloseTo(22.22, 2);
  expect(molfileAtomCount(conformer?.molfile.data ?? '')).toBe(16);
});

test('a dropped conformer does not renumber the warnings that follow it', () => {
  // A generator of our own, seeded like the run's, hands back the same
  // conformers, so the test can alter the one it wants to see dropped.
  const prepared = Molecule.fromSmiles(BORIC_ESTER).getCompactCopy();
  prepared.addImplicitHydrogens();
  const source = new ConformerGenerator(DEFAULT_CONFORMER_OPTIONS.seed);
  source.initializeConformers(prepared, {
    strategy: strategyConstant(DEFAULT_CONFORMER_OPTIONS.strategy),
    maxTorsionSets: DEFAULT_CONFORMER_OPTIONS.maxTorsionSets,
    use60degreeSteps: DEFAULT_CONFORMER_OPTIONS.use60DegreeSteps,
  });
  const nextConformer = source.getNextConformerAsMolecule.bind(source);
  let produced = 0;
  const spy = vi
    .spyOn(ConformerGenerator.prototype, 'getNextConformerAsMolecule')
    .mockImplementation(() => {
      produced++;
      const conformer = nextConformer();
      // The second conformer arrives with one atom nowhere in particular.
      if (produced === 2 && conformer !== null) {
        conformer.setAtomX(0, Number.NaN);
      }
      return conformer;
    });
  try {
    const set = generateConformers(
      Molecule.fromSmiles(BORIC_ESTER),
      options({ maxConformers: 3, minimisation: 'MMFF94' }),
    );

    expect(ids(set.conformers)).toStrictEqual([1, 2, 3]);
    expect(set.warnings).toStrictEqual([
      `The 1st conformer produced could not be minimised with MMFF94 (${BORON}), so its energy is unknown.`,
      'The 2nd conformer produced was dropped: the generator placed some of its atoms at non-finite coordinates.',
      `The 3rd conformer produced could not be minimised with MMFF94 (${BORON}), so its energy is unknown.`,
      `The 4th conformer produced could not be minimised with MMFF94 (${BORON}), so its energy is unknown.`,
    ]);
  } finally {
    spy.mockRestore();
  }
});

test('a conformer MMFF94 cannot type is kept, without an energy', () => {
  const set = generateConformers(
    Molecule.fromSmiles('B(O)(O)O'),
    options({ maxConformers: 2, minimisation: 'MMFF94' }),
  );

  expect(set.conformers).toHaveLength(1);
  expect(set.conformers[0]?.energy).toBeNull();
  expect(set.conformers[0]?.relativeEnergy).toBeNull();
  expect(set.warnings).toStrictEqual([
    `The 1st conformer produced could not be minimised with MMFF94 (${BORON}), so its energy is unknown.`,
  ]);
});

test('an empty structure is refused with a sentence, not a stack trace', () => {
  expect(() => generateConformers(new Molecule(0, 0), options({}))).toThrow(
    'The structure is empty: there is nothing to embed in 3D.',
  );
});

test('every strategy id maps to its ConformerGenerator constant', () => {
  expect(strategyConstant('adaptive-random')).toBe(
    ConformerGenerator.STRATEGY_ADAPTIVE_RANDOM,
  );
  expect(strategyConstant('likely-random')).toBe(
    ConformerGenerator.STRATEGY_LIKELY_RANDOM,
  );
  expect(strategyConstant('pure-random')).toBe(
    ConformerGenerator.STRATEGY_PURE_RANDOM,
  );
  expect(strategyConstant('likely-systematic')).toBe(
    ConformerGenerator.STRATEGY_LIKELY_SYSTEMATIC,
  );
  expect([
    strategyConstant('adaptive-random'),
    strategyConstant('likely-random'),
    strategyConstant('pure-random'),
    strategyConstant('likely-systematic'),
  ]).toStrictEqual([4, 3, 2, 1]);
});

/** Butyl borate: several conformers, and MMFF94 can type none of them. */
const BORIC_ESTER = 'B(O)(O)OCCCC';

/** What MMFF94 answers about a boron atom it has no type for. */
const BORON = "Couldn't assign an atom type to atom 0 (B)";

function butane(): Molecule {
  return Molecule.fromSmiles('CCCC');
}

function options(overrides: Partial<ConformerOptions>): ConformerOptions {
  return { ...DEFAULT_CONFORMER_OPTIONS, ...overrides };
}

// Relative energies in kcal/mol, to three decimals, in list order.
function relativeEnergies(
  conformers: ReadonlyArray<{ relativeEnergy: number | null }>,
): number[] {
  const result: number[] = [];
  for (const { relativeEnergy } of conformers) {
    result.push(Math.round((relativeEnergy ?? Number.NaN) * 1000) / 1000);
  }
  return result;
}

function ids(conformers: ReadonlyArray<{ id: number }>): number[] {
  const result: number[] = [];
  for (const conformer of conformers) result.push(conformer.id);
  return result;
}
