import { expect, test, vi } from 'vitest';

import type { RelaxableGeometry } from '../../../structure/core/geometryRelaxer.ts';

/**
 * How many times the import was attempted. A failed load must not poison the
 * session: the module forgets it, so the next call tries again. Hoisted with the
 * factory, because `vi.mock` is lifted above everything else in the file.
 */
const load = vi.hoisted(() => ({ attempts: 0 }));

// The package is an optional peer dependency, so a site that never refines a
// geometry does not install it. This is what that site sees if it asks anyway.
//
// What the failure says is vitest's own wording, not the resolver's: an error
// thrown out of a `vi.mock` factory is wrapped before it reaches the importer.
// So what is asserted below is the shape this module gives it — the sentence, the
// reason appended to it, and the original carried as `cause` — and never the
// upstream text, which is not ours.
vi.mock('xtb-wasm', () => {
  load.attempts++;
  throw new Error('Failed to resolve "xtb-wasm"');
});

/** What every load failure must be reported as, whatever went wrong. */
const PREFIX =
  'xtb-wasm could not be loaded, so geometries cannot be refined: ';

const { xtbRelaxer } = await import('../xtbRelaxer.ts');

const water: RelaxableGeometry = {
  elements: ['O', 'H', 'H'],
  coordinates: new Float64Array([
    0, 0, 0.117, 0, 0.757, -0.469, 0, -0.757, -0.469,
  ]),
};

test('a missing xtb-wasm is reported with the reason, not just as a failure', async () => {
  const error = await failedLoad();

  expect(error.message.startsWith(PREFIX)).toBe(true);
  // The reason is appended, so the message is never just the sentence.
  expect(error.message.length).toBeGreaterThan(PREFIX.length);
  expect(load.attempts).toBe(1);
});

test('the failure is forgotten, so a second attempt is a second attempt', async () => {
  const error = await failedLoad();

  expect(error.message.startsWith(PREFIX)).toBe(true);
  expect(load.attempts).toBe(2);
});

test('the original failure travels as the cause', async () => {
  const error = await failedLoad();

  expect(error.cause).toBeInstanceOf(Error);
  // The cause is the thrown object itself, so nothing about it is lost on the
  // way to whatever logs it.
  expect((error.cause as Error).message).toBe(
    error.message.slice(PREFIX.length),
  );
});

/**
 * The rejection of one relaxation attempt, as an `Error`.
 * @returns What `xtbRelaxer` threw.
 */
async function failedLoad(): Promise<Error> {
  try {
    await xtbRelaxer()([water]);
  } catch (error) {
    if (error instanceof Error) return error;
    throw new TypeError(`the relaxer rejected with ${typeof error}`, {
      cause: error,
    });
  }
  throw new Error('the relaxer resolved, but xtb-wasm cannot be loaded');
}
