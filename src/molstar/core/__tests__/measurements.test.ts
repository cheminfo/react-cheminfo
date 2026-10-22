import type { StructureElement } from 'molstar/lib/mol-model/structure.js';
import { expect, test } from 'vitest';

import { addMeasurement } from '../measurements.ts';

interface AddCall {
  method: string;
  atoms: number;
  options: unknown;
}

test('every measurement label is drawn in front of the atoms it names', async () => {
  const { calls, manager } = recordingManager();
  const [a, b, c, d] = [atom(0), atom(1), atom(2), atom(3)];

  await addMeasurement(manager, 'distance', [a, b]);
  await addMeasurement(manager, 'angle', [a, b, c]);
  await addMeasurement(manager, 'dihedral', [a, b, c, d]);

  const lifted = { labelParams: { offsetZ: 0.75 } };

  expect(calls).toStrictEqual([
    { method: 'addDistance', atoms: 2, options: lifted },
    { method: 'addAngle', atoms: 3, options: lifted },
    { method: 'addDihedral', atoms: 4, options: lifted },
  ]);
});

test('a measurement short of an atom adds nothing', async () => {
  const { calls, manager } = recordingManager();

  await addMeasurement(manager, 'angle', [atom(0), atom(1)]);

  expect(calls).toStrictEqual([]);
});

function atom(index: number): StructureElement.Loci {
  return { index } as unknown as StructureElement.Loci;
}

function recordingManager() {
  const calls: AddCall[] = [];
  function record(method: string) {
    return async (...args: unknown[]) => {
      calls.push({ method, atoms: args.length - 1, options: args.at(-1) });
    };
  }
  const manager = {
    addDistance: record('addDistance'),
    addAngle: record('addAngle'),
    addDihedral: record('addDihedral'),
  } as unknown as Parameters<typeof addMeasurement>[0];
  return { calls, manager };
}
