/**
 * The time budget of a conformer run: what it covers, when it ends the run, and
 * what the run reports having spent.
 */

import { Molecule } from 'openchemlib';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ConformerOptions } from '../conformerOptions.ts';
import { DEFAULT_CONFORMER_OPTIONS } from '../conformerOptions.ts';
import { generateConformers } from '../conformers.ts';
import { registerResources } from '../oclResources.ts';

beforeAll(async () => {
  await registerResources();
});

/** What the run did, in order, as the test below watches it happen. */
const events = vi.hoisted(() => [] as string[]);

// Opening the session is where OpenChemLib sets up the torsion sets, and the
// only seam at which "before the initialisation" can be observed without timing
// anything.
vi.mock(import('../conformerSession.ts'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    openConformerSession: (
      ...parameters: Parameters<typeof actual.openConformerSession>
    ) => {
      events.push('open the session');
      return actual.openConformerSession(...parameters);
    },
  };
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

test('the budget is read before the session is opened, not only around the loop', () => {
  // Setting up the torsion sets is the slow half of a run, so a clock started
  // after it would hand a flexible molecule a budget it has already spent. The
  // order of the two says that in milliseconds; measuring a real initialisation
  // takes a molecule slow enough to measure, which is the race this file exists
  // to keep out of the suite.
  events.length = 0;

  const set = generateConformers(
    butane(),
    options({ maxConformers: 1, minimisation: 'none' }),
    () => {
      events.push('clock');
      return 0;
    },
  );

  expect(set.conformers).toHaveLength(1);
  // The clock opens the run, tests the budget before the first conformer and
  // again once it is in hand, and closes the run.
  expect(events).toStrictEqual([
    'clock',
    'open the session',
    'clock',
    'clock',
    'clock',
  ]);
});

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
