import { expect, test } from 'vitest';

import {
  applyPreferencesFromSearch,
  writePreferencesToSearch,
} from '../../../share/core/preferences.ts';
import type { Molecule3DSettingSignals } from '../settingSignals.ts';
import {
  molecule3DSettingsParams,
  readMolecule3DSettings,
  writeMolecule3DSettings,
} from '../settingSignals.ts';
import type { Molecule3DSettings } from '../settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../settings.ts';

/**
 * Plain writable boxes, standing for a site's signals.
 * @param settings - What they hold.
 * @returns One box per linked setting.
 */
function boxes(settings: Molecule3DSettings) {
  return {
    representation: { value: settings.representation },
    sizeFactor: { value: settings.sizeFactor },
    bondSizeFactor: { value: settings.bondSizeFactor },
    showSurface: { value: settings.showSurface },
    surfaceAlpha: { value: settings.surfaceAlpha },
    probeRadius: { value: settings.probeRadius },
    surfaceColoring: { value: settings.surfaceColoring },
    surfaceColor: { value: settings.surfaceColor },
  } satisfies Molecule3DSettingSignals;
}

const STICKS: Molecule3DSettings = {
  ...DEFAULT_MOLECULE_3D_SETTINGS,
  representation: 'stick',
  sizeFactor: 0.4,
};

test('settings are written into the signals repaired, and read back whole', () => {
  const signals = boxes(DEFAULT_MOLECULE_3D_SETTINGS);
  writeMolecule3DSettings(signals, { ...STICKS, sizeFactor: 9 });

  expect(signals.sizeFactor.value).toBe(2);
  expect(readMolecule3DSettings(signals)).toStrictEqual({
    ...STICKS,
    sizeFactor: 2,
  });
});

test('a setting a site does not keep reads as its default', () => {
  expect(readMolecule3DSettings({ sizeFactor: { value: 0.4 } })).toStrictEqual({
    ...DEFAULT_MOLECULE_3D_SETTINGS,
    sizeFactor: 0.4,
  });
});

test('the address carries what differs from the site defaults, and a link sets it', () => {
  const signals = boxes(STICKS);
  const params = molecule3DSettingsParams(signals, {
    defaults: STICKS,
    names: { showSurface: 'molecularSurface' },
  });

  expect(writePreferencesToSearch('', params)).toBe('');

  signals.bondSizeFactor.value = 1.5;
  signals.showSurface.value = true;

  expect(writePreferencesToSearch('', params)).toBe(
    'bondSizeFactor=1.5&molecularSurface=1',
  );

  applyPreferencesFromSearch(
    '?representation=spacefill&sizeFactor=40&surfaceColor=red',
    params,
  );

  expect(signals.representation.value).toBe('spacefill');
  expect(signals.sizeFactor.value).toBe(2);
  expect(signals.surfaceColor.value).toBe('#94a3b8');
});

test('the surface is written as `surface` unless a site names it otherwise', () => {
  const signals = boxes({ ...DEFAULT_MOLECULE_3D_SETTINGS, showSurface: true });

  expect(writePreferencesToSearch('', molecule3DSettingsParams(signals))).toBe(
    'surface=1',
  );
});

test('a link switching the representation draws it at its own sizes', () => {
  const signals = boxes(STICKS);
  const params = molecule3DSettingsParams(signals, { defaults: STICKS });

  applyPreferencesFromSearch('?representation=ball-and-stick', params);

  expect(signals.representation.value).toBe('ball-and-stick');
  expect(signals.sizeFactor.value).toBe(1);
  expect(signals.bondSizeFactor.value).toBe(1);
  expect(writePreferencesToSearch('', params)).toBe(
    'representation=ball-and-stick',
  );

  signals.sizeFactor.value = 0.4;

  expect(writePreferencesToSearch('', params)).toBe(
    'representation=ball-and-stick&sizeFactor=0.4',
  );

  const visitor = boxes(STICKS);
  applyPreferencesFromSearch(
    '?representation=ball-and-stick&sizeFactor=0.4',
    molecule3DSettingsParams(visitor, { defaults: STICKS }),
  );

  expect(readMolecule3DSettings(visitor)).toStrictEqual({
    ...STICKS,
    representation: 'ball-and-stick',
    sizeFactor: 0.4,
  });
});

test('a link naming the representation on screen keeps the chosen sizes', () => {
  const signals = boxes({
    ...DEFAULT_MOLECULE_3D_SETTINGS,
    sizeFactor: 0.7,
    bondSizeFactor: 1.3,
  });
  const params = molecule3DSettingsParams(signals);

  applyPreferencesFromSearch(
    '?representation=ball-and-stick&sizeFactor=0.7&bondSizeFactor=1.3',
    params,
  );

  expect(signals.sizeFactor.value).toBe(0.7);
  expect(signals.bondSizeFactor.value).toBe(1.3);
});
