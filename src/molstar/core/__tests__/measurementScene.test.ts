/**
 * Measurements drawn over a real structure — acetone, as molstar reads the
 * molfile the viewer loads — with the plugin around it stood in for: which
 * atoms a drawn measurement names, what is skipped, and what is cleared.
 */

import type {
  ElementIndex,
  Structure,
} from 'molstar/lib/mol-model/structure.js';
import { beforeAll, expect, test } from 'vitest';

import type { Measurement } from '../../../molecule3d/core/measurement.ts';
import {
  atomReferenceOf,
  clearMeasurements,
  renderMeasurements,
} from '../measurements.ts';

import { acetoneStructure } from './acetone.ts';
import { atom, scenePlugin } from './measurementStandIn.ts';

let acetone: Structure;

beforeAll(async () => {
  acetone = await acetoneStructure();
});

test('an atom is addressed by its unit and its place in it', () => {
  expect(atomReferenceOf(acetone, 4 as ElementIndex)).toStrictEqual({
    unit: 0,
    element: 4,
  });
  expect(atomReferenceOf(acetone, 10 as ElementIndex)).toBeUndefined();
});

test('drawing measurements clears the old ones, then adds each over the atoms it names', async () => {
  const { plugin, log } = scenePlugin({ measured: true });

  await renderMeasurements(
    plugin,
    [
      { kind: 'distance', atoms: [atom(1), atom(2)] },
      { kind: 'dihedral', atoms: [atom(4), atom(0), atom(1), atom(3)] },
    ],
    () => acetone,
  );

  expect(log).toStrictEqual([
    'delete measurement-group',
    'addDistance 1-2',
    'addDihedral 4-0-1-3',
  ]);
});

test('a measurement naming an atom the structure lacks is skipped, not drawn short', async () => {
  const { plugin, log } = scenePlugin({ measured: false });
  const measurements: Measurement[] = [
    { kind: 'angle', atoms: [atom(0), atom(1), atom(10)] },
    { kind: 'distance', atoms: [{ unit: 3, element: 0 }, atom(1)] },
    { kind: 'angle', atoms: [atom(0), atom(1), atom(2)] },
  ];

  await renderMeasurements(plugin, measurements, () => acetone);

  expect(log).toStrictEqual(['addAngle 0-1-2']);
});

test('with no structure on screen, measurements are only cleared', async () => {
  const { plugin, log } = scenePlugin({ measured: true });

  await renderMeasurements(
    plugin,
    [{ kind: 'distance', atoms: [atom(0), atom(1)] }],
    () => undefined,
  );

  expect(log).toStrictEqual(['delete measurement-group']);
});

test('clearing a scene with no measurement commits nothing', async () => {
  const { plugin, log } = scenePlugin({ measured: false });

  await clearMeasurements(plugin);

  expect(log).toStrictEqual([]);
});
