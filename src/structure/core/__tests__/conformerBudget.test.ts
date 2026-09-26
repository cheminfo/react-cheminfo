/**
 * The time budget of a conformer run: what it covers, when it ends the run, and
 * what the run reports having spent.
 */

import { Molecule } from 'openchemlib';
import { beforeAll, expect, test } from 'vitest';

import type { ConformerOptions } from '../conformerOptions.ts';
import { DEFAULT_CONFORMER_OPTIONS } from '../conformerOptions.ts';
import { generateConformers } from '../conformers.ts';
import { registerResources } from '../oclResources.ts';

beforeAll(async () => {
  await registerResources();
});

test('a spent time budget returns what was produced, never an error', () => {
  const set = generateConformers(
    butane(),
    options({ maxConformers: 10, minimisation: 'none', timeoutSeconds: 10 }),
    advancingClock(4000),
  );

  expect(set.stoppedBy).toBe('timeout');
  expect(ids(set.conformers)).toStrictEqual([1]);
  expect(set.elapsedMilliseconds).toBe(16_000);
});

test('a conformer produced after the deadline is dropped, not minimised', () => {
  const set = generateConformers(
    butane(),
    options({ maxConformers: 10, timeoutSeconds: 10 }),
    advancingClock(6000),
  );

  expect(set.stoppedBy).toBe('timeout');
  expect(set.conformers).toStrictEqual([]);
  expect(set.warnings).toStrictEqual([]);
  expect(set.elapsedMilliseconds).toBe(18_000);
});

test('a budget of zero seconds stops before the first conformer', () => {
  const set = generateConformers(
    butane(),
    options({ maxConformers: 10, timeoutSeconds: 0 }),
  );

  expect(set.stoppedBy).toBe('timeout');
  expect(set.conformers).toStrictEqual([]);
  expect(set.warnings).toStrictEqual([]);
  expect(set.potentialConformerCount).toBe(3);
});

test('the reported duration covers the initialisation, not only the loop', () => {
  const stamps: number[] = [];
  const now = () => {
    const stamp = performance.now();
    stamps.push(stamp);
    return stamp;
  };
  const set = generateConformers(
    Molecule.fromSmiles(DIPEPTIDE),
    // A budget nothing can spend: this test is about what the duration covers,
    // and the default ten seconds is a race against the very initialisation it
    // measures — a second when the machine is idle, more than ten when the rest
    // of the suite is running beside it, and then there is no conformer at all.
    options({ maxConformers: 1, minimisation: 'none', timeoutSeconds: 600 }),
    now,
  );

  expect(set.conformers).toHaveLength(1);
  // Read to open the run, to test the budget before the first conformer and
  // again once it is in hand, and to close the run.
  expect(stamps).toHaveLength(4);

  const initialisation = (stamps[1] ?? 0) - (stamps[0] ?? 0);

  expect(initialisation).toBeGreaterThan(100);
  expect(set.elapsedMilliseconds).toBeGreaterThanOrEqual(initialisation);
}, 30_000);

/**
 * Alanyl-alanine: its torsion sets take about a second to set up on an idle
 * machine, and four under load — which is the point, and also why the run above
 * is given a budget it cannot spend.
 */
const DIPEPTIDE = 'CC(N)C(=O)NC(C)C(=O)O';

function butane(): Molecule {
  return Molecule.fromSmiles('CCCC');
}

// A clock that stands still except when it is read, `step` at a time.
function advancingClock(step: number): () => number {
  let elapsed = -step;
  return () => {
    elapsed += step;
    return elapsed;
  };
}

function options(overrides: Partial<ConformerOptions>): ConformerOptions {
  return { ...DEFAULT_CONFORMER_OPTIONS, ...overrides };
}

function ids(conformers: ReadonlyArray<{ id: number }>): number[] {
  const result: number[] = [];
  for (const conformer of conformers) result.push(conformer.id);
  return result;
}
