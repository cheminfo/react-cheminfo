import { expect, test } from 'vitest';

import {
  DEFAULT_MOLECULE_3D_SETTINGS,
  isRepresentationId,
  isSurfaceColoringId,
  normalizeMolecule3DSettings,
  resetMolecule3DSettings,
  resolveMolecule3DTools,
  sameMolecule3DSettings,
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

test('a reset returns to the defaults but leaves the surface toggle alone', () => {
  const changed = {
    representation: 'spacefill',
    sizeFactor: 1.6,
    showSurface: true,
    surfaceAlpha: 0.8,
    probeRadius: 2.2,
    surfaceColoring: 'polarity',
    surfaceColor: '#332288',
  } as const;

  expect(resetMolecule3DSettings(changed)).toStrictEqual({
    ...DEFAULT_MOLECULE_3D_SETTINGS,
    showSurface: true,
  });

  const siteDefaults = normalizeMolecule3DSettings({ sizeFactor: 0.6 });

  expect(resetMolecule3DSettings(changed, siteDefaults)).toStrictEqual({
    ...siteDefaults,
    showSurface: true,
  });
});

test('settings compare equal only when every field does', () => {
  const settings = DEFAULT_MOLECULE_3D_SETTINGS;

  expect(sameMolecule3DSettings(settings, { ...settings })).toBe(true);
  expect(
    sameMolecule3DSettings(settings, { ...settings, probeRadius: 1.5 }),
  ).toBe(false);
  expect(
    sameMolecule3DSettings(settings, { ...settings, surfaceColor: '#000000' }),
  ).toBe(false);
});
