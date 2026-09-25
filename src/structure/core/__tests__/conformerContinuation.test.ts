/**
 * Continuing a run: the extended set must be the one a single larger run would
 * have produced, whether the generator was kept or has to be rebuilt.
 */

import { Molecule } from 'openchemlib';
import { beforeAll, expect, test } from 'vitest';

import type { ConformerOptions } from '../conformerOptions.ts';
import { DEFAULT_CONFORMER_OPTIONS } from '../conformerOptions.ts';
import type { ConformerSet } from '../conformers.ts';
import { continueConformers, generateConformers } from '../conformers.ts';
import { registerResources } from '../oclResources.ts';

beforeAll(async () => {
  await registerResources();
});

test('continuing a kept generator gives the set of one larger run', () => {
  const single = generateConformers(hexane(), options({ maxConformers: 6 }));
  const first = generateConformers(hexane(), options({ maxConformers: 3 }));
  const extended = continueConformers(hexane(), first, limits(3));

  expect(single.conformers).toHaveLength(6);
  expect(extended.stoppedBy).toBe('count');
  expect(ids(extended)).toStrictEqual([1, 2, 3, 4, 5, 6]);
  expect(extended.produced).toBe(single.produced);
  expect(extended.conformers).toStrictEqual(single.conformers);
  expect(extended.warnings).toStrictEqual(single.warnings);
});

test('continuing after another molecule rebuilds the generator and replays it', () => {
  const single = generateConformers(hexane(), options({ maxConformers: 5 }));
  const first = generateConformers(hexane(), options({ maxConformers: 2 }));
  generateConformers(Molecule.fromSmiles('CCO'), options({ maxConformers: 1 }));
  const extended = continueConformers(hexane(), first, limits(3));

  expect(ids(extended)).toStrictEqual([1, 2, 3, 4, 5]);
  expect(extended.conformers).toStrictEqual(single.conformers);
});

test('the previous set is left untouched and its options win over new ones', () => {
  const first = generateConformers(
    hexane(),
    options({ maxConformers: 2, minimisation: 'none' }),
  );
  const before = structuredClone(first);
  const extended = continueConformers(hexane(), first, limits(2));

  expect(first).toStrictEqual(before);
  expect(extended.minimisation).toBe('none');
  expect(extended.options).toStrictEqual({
    ...DEFAULT_CONFORMER_OPTIONS,
    minimisation: 'none',
    maxConformers: 2,
    timeoutSeconds: 30,
  });
  expect(extended.conformers).toHaveLength(4);
  expect(extended.potentialConformerCount).toBe(first.potentialConformerCount);
});

test('a conformer drawn past the deadline is the first one a continuation keeps', () => {
  const single = generateConformers(hexane(), options({ maxConformers: 2 }));
  const timedOut = generateConformers(
    hexane(),
    options({ maxConformers: 10, timeoutSeconds: 10 }),
    advancingClock(6000),
  );

  expect(timedOut.stoppedBy).toBe('timeout');
  expect(timedOut.conformers).toStrictEqual([]);
  expect(timedOut.produced).toBe(0);

  const extended = continueConformers(hexane(), timedOut, limits(2));

  expect(extended.conformers).toStrictEqual(single.conformers);
  expect(extended.elapsedMilliseconds).toBeGreaterThanOrEqual(18_000);
});

test('a generator that ran dry has nothing more to give', () => {
  const first = generateConformers(
    Molecule.fromSmiles('C1CCCCC1'),
    options({ maxConformers: 10 }),
  );

  expect(first.stoppedBy).toBe('exhausted');

  const extended = continueConformers(
    Molecule.fromSmiles('C1CCCCC1'),
    first,
    limits(5),
  );

  expect(extended.stoppedBy).toBe('exhausted');
  expect(extended.conformers).toStrictEqual(first.conformers);
});

function hexane(): Molecule {
  return Molecule.fromSmiles('CCCCCC');
}

function options(overrides: Partial<ConformerOptions>): ConformerOptions {
  return { ...DEFAULT_CONFORMER_OPTIONS, ...overrides };
}

function limits(maxConformers: number) {
  return { maxConformers, timeoutSeconds: 30 };
}

// A clock that stands still except when it is read, `step` at a time.
function advancingClock(step: number): () => number {
  let elapsed = -step;
  return () => {
    elapsed += step;
    return elapsed;
  };
}

function ids(set: ConformerSet): number[] {
  const result: number[] = [];
  for (const conformer of set.conformers) result.push(conformer.id);
  return result;
}
