import { expect, test } from 'vitest';

import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import {
  linkedMolecule3DSettings,
  molecule3DSettingSignals,
} from '../linkedSettings.ts';
import { readMolecule3DSettings } from '../settingSignals.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../settings.ts';

test('the eight linked settings start on the site’s defaults', () => {
  const { signal } = createReactiveSystem();
  const signals = molecule3DSettingSignals(signal, {
    ...DEFAULT_MOLECULE_3D_SETTINGS,
    showSurface: true,
  });

  expect(Object.keys(signals)).toStrictEqual([
    'representation',
    'sizeFactor',
    'bondSizeFactor',
    'showSurface',
    'surfaceAlpha',
    'probeRadius',
    'surfaceColoring',
    'surfaceColor',
  ]);
  expect(signals.showSurface.value).toBe(true);
  expect(readMolecule3DSettings(signals).representation).toBe(
    DEFAULT_MOLECULE_3D_SETTINGS.representation,
  );
});

test('a link names only what is away from its default, and opens on it', () => {
  const { signal } = createReactiveSystem();
  const signals = molecule3DSettingSignals(signal);
  const linked = linkedMolecule3DSettings(signals);

  expect(linked.query()).toStrictEqual({});

  linked.apply({ surface: '1', surfaceColor: '#ff0000' });

  expect(signals.showSurface.value).toBe(true);
  expect(signals.surfaceColor.value).toBe('#ff0000');
  expect(linked.query()).toStrictEqual({
    surface: '1',
    surfaceColor: '#ff0000',
  });
});

test('a site renames a parameter where the family’s one is taken', () => {
  const { signal } = createReactiveSystem();
  const signals = molecule3DSettingSignals(signal);
  const linked = linkedMolecule3DSettings(signals, {
    names: { showSurface: 'molecularSurface' },
  });
  linked.apply({ molecularSurface: '1', surface: '0.5' });

  expect(signals.showSurface.value).toBe(true);
  expect(linked.query()).toStrictEqual({ molecularSurface: '1' });
});
