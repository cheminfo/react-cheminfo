/**
 * What the scene drawer asks of the viewer for each change of the props: the
 * whole scene for another molecule or style, the measurements alone when only
 * they change. The viewer is a stand-in writing down each call, in order.
 */

import { expect, test } from 'vitest';

import type { Molecule3DCamera } from '../../core/camera.ts';
import type { Measurement } from '../../core/measurement.ts';
import type { Molecule3DFile } from '../../core/settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import type { SceneRequest } from '../sceneDrawer.ts';

import { drawnStandIn, gate, nextTask, standIn } from './sceneStandIn.ts';

const ETHANOL: Molecule3DFile = { format: 'mol', data: 'ethanol' };
const PROPANE: Molecule3DFile = { format: 'mol', data: 'propane' };
const C_O: Measurement = { kind: 'distance', atoms: atoms(1, 2) };
const C_C_O: Measurement = { kind: 'angle', atoms: atoms(0, 1, 2) };

test('a new molecule is drawn whole, its measurements over it, then framed', async () => {
  const { drawer, calls } = standIn();

  await drawer.draw(scene({ measurements: [C_O] }));

  expect(calls).toStrictEqual([
    'model ethanol ball-and-stick',
    'measurements distance 1-2',
    'frame',
  ]);
});

test('a change of the measurements alone draws them and nothing else', async () => {
  const { drawer, calls } = await drawnStandIn(scene());

  await drawer.draw(scene({ measurements: [C_O] }));
  await drawer.draw(scene({ measurements: [C_O, C_C_O] }));
  await drawer.draw(scene({ measurements: [C_C_O] }));
  await drawer.draw(scene({ measurements: [] }));

  expect(calls).toStrictEqual([
    'measurements distance 1-2',
    'measurements distance 1-2, angle 0-1-2',
    'measurements angle 0-1-2',
    'measurements none',
  ]);
});

test('after a change that failed, the measurements shown before are drawn again', async () => {
  const { drawer, calls, fail } = await drawnStandIn(
    scene({ measurements: [C_O] }),
  );
  fail.measurements = 1;

  await expect(drawer.draw(scene({ measurements: [C_C_O] }))).rejects.toThrow(
    'no label',
  );

  await drawer.draw(scene({ measurements: [C_O] }));

  expect(calls).toStrictEqual([
    'measurements angle 0-1-2',
    'measurements distance 1-2',
  ]);
});

test('the same molecule, settings and measurements in new objects draw nothing', async () => {
  const { drawer, calls } = await drawnStandIn(scene({ measurements: [C_O] }));

  await drawer.draw({
    molfile: { ...ETHANOL },
    settings: { ...DEFAULT_MOLECULE_3D_SETTINGS },
    measurements: structuredClone([C_O]),
    frameNewMolecule: 'front',
  });

  expect(calls).toStrictEqual([]);
});

test('another style draws the model again, without moving the camera', async () => {
  const { drawer, calls } = await drawnStandIn(scene({ measurements: [C_O] }));
  const settings = {
    ...DEFAULT_MOLECULE_3D_SETTINGS,
    representation: 'spacefill' as const,
    showSurface: true,
  };

  await drawer.draw(scene({ settings, measurements: [C_O] }));

  expect(calls).toStrictEqual([
    'model ethanol spacefill',
    'surface',
    'measurements distance 1-2',
  ]);
});

test('another molecule is framed, from the front when asked', async () => {
  const { drawer, calls } = await drawnStandIn(scene());

  await drawer.draw(scene({ molfile: PROPANE, frameNewMolecule: 'front' }));

  expect(calls).toStrictEqual([
    'model propane ball-and-stick',
    'measurements none',
    'frame from the front',
  ]);
});

test('measurements asked while the model is drawn land after it, the last ones only', async () => {
  const model = gate();
  const { drawer, calls } = standIn({ modelDrawn: model.opened });

  const drawn = drawer.draw(scene());
  await nextTask();
  const picked = drawer.draw(scene({ measurements: [C_O] }));
  const swapped = drawer.draw(scene({ measurements: [C_C_O] }));
  model.open();
  await Promise.all([drawn, picked, swapped]);

  expect(calls).toStrictEqual([
    'model ethanol ball-and-stick',
    'measurements none',
    'frame',
    'measurements angle 0-1-2',
  ]);
});

test('a camera a link carries stands in for framing the first molecule only', async () => {
  const linked: Molecule3DCamera[] = [
    { rotation: [0, 0, 0, 1], zoom: 2, offset: [0, 0, 0] },
  ];
  const { drawer, calls } = standIn({
    takeLinkedCamera: () => linked.pop() ?? null,
  });

  await drawer.draw(scene());
  await drawer.draw(scene({ molfile: PROPANE }));

  expect(calls).toStrictEqual([
    'model ethanol ball-and-stick',
    'measurements none',
    'linked camera',
    'model propane ball-and-stick',
    'measurements none',
    'frame',
  ]);
});

test('a draw that failed is drawn again by the next change, without framing again', async () => {
  const { drawer, calls } = standIn({ modelFailures: 1 });

  await expect(drawer.draw(scene())).rejects.toThrow('no atoms');

  await drawer.draw(scene({ measurements: [C_O] }));

  expect(calls).toStrictEqual([
    'model ethanol ball-and-stick',
    'model ethanol ball-and-stick',
    'measurements distance 1-2',
  ]);
});

test('an empty scene keeps the measurements for the molecule to come', async () => {
  const { drawer, calls } = standIn();

  await drawer.draw(scene({ molfile: null, measurements: [C_O] }));
  await drawer.draw(scene({ molfile: null, measurements: [C_C_O] }));
  await drawer.draw(scene({ measurements: [C_C_O] }));

  expect(calls).toStrictEqual([
    'empty',
    'model ethanol ball-and-stick',
    'measurements angle 0-1-2',
    'frame',
  ]);
});

function scene(overrides: Partial<SceneRequest> = {}): SceneRequest {
  return {
    molfile: ETHANOL,
    settings: DEFAULT_MOLECULE_3D_SETTINGS,
    measurements: [],
    frameNewMolecule: 'keep',
    ...overrides,
  };
}

function atoms(...elements: number[]): Measurement['atoms'] {
  return elements.map((element) => ({ unit: 0, element }));
}
