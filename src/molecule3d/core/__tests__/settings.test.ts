import { expect, test } from 'vitest';

import {
  DEFAULT_MOLECULE_3D_SETTINGS,
  isRepresentationId,
  isSurfaceColoringId,
  normalizeMolecule3DSettings,
  resolveMolecule3DTools,
} from '../settings.ts';

test('nothing given is the default settings', () => {
  expect(normalizeMolecule3DSettings()).toStrictEqual(
    DEFAULT_MOLECULE_3D_SETTINGS,
  );
});

test('stored settings are repaired rather than dropped', () => {
  expect(
    normalizeMolecule3DSettings({
      representation: 'cartoon' as never,
      sizeFactor: 9,
      showSurface: true,
      surfaceAlpha: Number.NaN,
      probeRadius: 0.2,
      surfaceColoring: 'rainbow' as never,
      surfaceColor: 'red',
    }),
  ).toStrictEqual({
    representation: 'ball-and-stick',
    sizeFactor: 2,
    showSurface: true,
    surfaceAlpha: 0.5,
    probeRadius: 1,
    surfaceColoring: 'uniform',
    surfaceColor: '#94a3b8',
  });
});

test('a valid surface colouring is kept', () => {
  expect(
    normalizeMolecule3DSettings({ surfaceColoring: 'polarity' })
      .surfaceColoring,
  ).toBe('polarity');
  expect(isSurfaceColoringId('element')).toBe(true);
  expect(isSurfaceColoringId('hydrophobicity')).toBe(false);
});

test('a valid representation is kept', () => {
  expect(
    normalizeMolecule3DSettings({ representation: 'stick' }),
  ).toStrictEqual({ ...DEFAULT_MOLECULE_3D_SETTINGS, representation: 'stick' });
  expect(isRepresentationId('spacefill')).toBe(true);
  expect(isRepresentationId('cartoon')).toBe(false);
});

test('tools not named stay on', () => {
  expect(resolveMolecule3DTools({ measure: false, spin: false })).toStrictEqual(
    {
      measure: false,
      options: true,
      spin: false,
      surface: true,
      reset: true,
      export: true,
      help: true,
    },
  );
});
