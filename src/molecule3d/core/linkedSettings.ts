/**
 * The display settings of the 3D viewer as a site keeps them: one signal each,
 * made here from the site's own `signal`, and the address they are carried in.
 */

import { parseQueryString } from '../../router/core/query.ts';
import {
  applyPreferencesFromSearch,
  writePreferencesToSearch,
} from '../../share/core/preferences.ts';
import type { Cell } from '../../state/core/cells.ts';

import type {
  Molecule3DSettingSignals,
  Molecule3DSettingsParamsOptions,
} from './settingSignals.ts';
import { molecule3DSettingsParams } from './settingSignals.ts';
import type {
  Molecule3DSettings,
  RepresentationId,
  SurfaceColoringId,
} from './settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from './settings.ts';

/** The eight settings a link carries, one signal each. */
export interface Molecule3DSettingCells {
  /** How the atoms are drawn. */
  representation: Cell<RepresentationId>;
  /** The size of the atoms. */
  sizeFactor: Cell<number>;
  /** The size of the bonds. */
  bondSizeFactor: Cell<number>;
  /** Whether the molecular surface is shown. */
  showSurface: Cell<boolean>;
  /** How opaque the surface is. */
  surfaceAlpha: Cell<number>;
  /** The probe the surface is rolled with, Å. */
  probeRadius: Cell<number>;
  /** How the surface is coloured. */
  surfaceColoring: Cell<SurfaceColoringId>;
  /** The surface's colour when it is uniform. */
  surfaceColor: Cell<string>;
}

/**
 * One signal per setting a link carries, at the site's defaults, for a
 * `persistSignalBucket` bucket. A site drawing partial bonds adds its two
 * signals beside them.
 * @param signal - `signal` from the site's signals.
 * @param defaults - What the site opens on.
 * @default defaults DEFAULT_MOLECULE_3D_SETTINGS
 * @returns The signals.
 */
export function molecule3DSettingSignals(
  signal: <T>(value: T) => Cell<T>,
  defaults: Molecule3DSettings = DEFAULT_MOLECULE_3D_SETTINGS,
): Molecule3DSettingCells {
  return {
    representation: signal(defaults.representation),
    sizeFactor: signal(defaults.sizeFactor),
    bondSizeFactor: signal(defaults.bondSizeFactor),
    showSurface: signal(defaults.showSurface),
    surfaceAlpha: signal(defaults.surfaceAlpha),
    probeRadius: signal(defaults.probeRadius),
    surfaceColoring: signal(defaults.surfaceColoring),
    surfaceColor: signal(defaults.surfaceColor),
  };
}

/** The settings as a link carries them. */
export interface LinkedMolecule3DSettings {
  /**
   * Store how a link says the atoms are drawn; what it does not name keeps
   * its value.
   * @param query - The decoded query of the address.
   */
  apply: (query: Readonly<Record<string, string>>) => void;
  /**
   * The settings away from their default, as decoded query entries. Reads the
   * signals, so the effect writing the address rewrites it when one moves.
   * @returns One entry per setting away from its default.
   */
  query: () => Record<string, string>;
}

/**
 * The settings the signals hold, read from a link and written into one.
 * @param signals - The site's signals.
 * @param options - The site's defaults and parameter names.
 * @returns The reader and the writer.
 */
export function linkedMolecule3DSettings(
  signals: Molecule3DSettingSignals,
  options: Molecule3DSettingsParamsOptions = {},
): LinkedMolecule3DSettings {
  const params = molecule3DSettingsParams(signals, options);
  return {
    apply(query) {
      applyPreferencesFromSearch(query, params);
    },
    query: () => parseQueryString(writePreferencesToSearch('', params)),
  };
}
