/**
 * When the scene drawer asks the viewer for the partial bonds: by default for
 * an XYZ file, whose bonds are guessed, and never for a molfile, unless the
 * settings say otherwise; never in spacefill, which draws no bonds at all.
 */

import { expect, test } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import type { Molecule3DSettings } from '../../core/settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import type { SceneRequest } from '../sceneDrawer.ts';

import { drawnStandIn, standIn } from './sceneStandIn.ts';

const TRANSITION_STATE: Molecule3DFile = { format: 'xyz', data: 'ts' };
const MOLFILE: Molecule3DFile = { format: 'mol', data: 'ethanol' };

test('an XYZ file has its partial bonds drawn over the model, labelled', async () => {
  const { drawer, calls } = standIn();

  await drawer.draw(scene(TRANSITION_STATE));

  expect(calls).toStrictEqual([
    'model ts ball-and-stick',
    'partial bonds with lengths',
    'measurements none',
    'frame',
  ]);
});

test('a molfile has none, unless they are switched on', async () => {
  const { drawer, calls } = standIn();

  await drawer.draw(scene(MOLFILE));
  await drawer.draw(scene(MOLFILE, { partialBonds: 'on' }));

  expect(calls).toStrictEqual([
    'model ethanol ball-and-stick',
    'measurements none',
    'frame',
    'model ethanol ball-and-stick',
    'partial bonds with lengths',
    'measurements none',
  ]);
});

test('switched off, or without their lengths, the model is drawn again', async () => {
  const { drawer, calls } = await drawnStandIn(scene(TRANSITION_STATE));

  await drawer.draw(scene(TRANSITION_STATE, { partialBondLengths: false }));
  await drawer.draw(scene(TRANSITION_STATE, { partialBonds: 'off' }));

  expect(calls).toStrictEqual([
    'model ts ball-and-stick',
    'partial bonds',
    'measurements none',
    'model ts ball-and-stick',
    'measurements none',
  ]);
});

test('spacefill draws no bonds, and so no partial ones', async () => {
  const { drawer, calls } = standIn();

  await drawer.draw(
    scene(TRANSITION_STATE, {
      representation: 'spacefill',
      partialBonds: 'on',
    }),
  );

  expect(calls).toStrictEqual([
    'model ts spacefill',
    'measurements none',
    'frame',
  ]);
});

function scene(
  molfile: Molecule3DFile,
  settings: Partial<Molecule3DSettings> = {},
): SceneRequest {
  return {
    molfile,
    settings: { ...DEFAULT_MOLECULE_3D_SETTINGS, ...settings },
    measurements: [],
    frameNewMolecule: 'keep',
  };
}
