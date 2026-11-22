/**
 * The display settings of the 3D viewer held by a site as one signal each —
 * persisted, written into the address, carried by a figure — read, written
 * and linked here once, so a setting the viewer gains reaches every site
 * without a site naming it.
 */

import type { ShareParamCodec } from '../../share/core/params.ts';
import {
  booleanParam,
  enumParam,
  numberParam,
  stringParam,
} from '../../share/core/params.ts';
import type { UrlPreferences } from '../../share/core/preferences.ts';

import type { Molecule3DSettings, RepresentationId } from './settings.ts';
import {
  DEFAULT_MOLECULE_3D_SETTINGS,
  MOLECULE_3D_RANGES,
  REPRESENTATIONS,
  SURFACE_COLORINGS,
  normalizeMolecule3DSettings,
  representationSizes,
} from './settings.ts';

/** A writable value, as a signal of any `@preact/signals` flavour is. */
export interface SettingSignal<Value> {
  value: Value;
}

/**
 * One writable value per setting a site keeps. A setting it does not keep
 * reads as its default and is never written.
 */
export type Molecule3DSettingSignals = {
  [Key in keyof Molecule3DSettings]?: SettingSignal<Molecule3DSettings[Key]>;
};

/** Every setting, in the order of the record. */
const SETTING_KEYS = Object.keys(DEFAULT_MOLECULE_3D_SETTINGS) as ReadonlyArray<
  keyof Molecule3DSettings
>;

/**
 * The settings the signals hold, repaired: a value a stored record or a link
 * got wrong falls back to its default. Reads every `value`, so an effect or a
 * computed running this follows each of them.
 * @param signals - The site's signals.
 * @returns The settings.
 */
export function readMolecule3DSettings(
  signals: Molecule3DSettingSignals,
): Molecule3DSettings {
  const values: Partial<Record<keyof Molecule3DSettings, unknown>> = {};
  for (const key of SETTING_KEYS) values[key] = signals[key]?.value;
  return normalizeMolecule3DSettings(values as Partial<Molecule3DSettings>);
}

/**
 * Write settings into the signals, repaired first. Wrap the call in the
 * signals' own `batch` so the view redraws once.
 * @param signals - The site's signals.
 * @param settings - From the options panel, a figure or a reset.
 */
export function writeMolecule3DSettings(
  signals: Molecule3DSettingSignals,
  settings: Partial<Molecule3DSettings>,
): void {
  const repaired = normalizeMolecule3DSettings(settings);
  for (const key of SETTING_KEYS) {
    const signal = signals[key] as SettingSignal<unknown> | undefined;
    if (signal !== undefined) signal.value = repaired[key];
  }
}

/** The settings a link may carry. */
export type LinkedMolecule3DSetting = Exclude<
  keyof Molecule3DSettings,
  'partialBonds' | 'partialBondLengths'
>;

/** What {@link molecule3DSettingsParams} is configured with. */
export interface Molecule3DSettingsParamsOptions {
  /**
   * What the site opens on: a value equal to it is never written, and a value
   * a link gets wrong falls back to it.
   * @default DEFAULT_MOLECULE_3D_SETTINGS
   */
  defaults?: Molecule3DSettings;
  /**
   * The parameter a setting is written under, where it is not the usual one.
   * @default `surface` for `showSurface`, and each other setting's own name
   */
  names?: Partial<Record<LinkedMolecule3DSetting, string>>;
}

/**
 * The address parameters of the settings the signals hold, for
 * `applyPreferencesFromSearch` and `writePreferencesToSearch`: opening a link
 * makes each value it names the visitor's own, and a value at its default is
 * never written. Sliders keep two decimals and their span.
 *
 * The sizes follow the representation, as in the options panel: a link
 * switching it draws the new one at its own sizes, and a size equal to the
 * preset of the representation on screen is left out of the address.
 * @param signals - The site's signals; a setting without one is not linked.
 * @param options - See {@link Molecule3DSettingsParamsOptions}.
 * @returns The preferences, keyed by parameter name.
 */
export function molecule3DSettingsParams(
  signals: Molecule3DSettingSignals,
  options: Molecule3DSettingsParamsOptions = {},
): UrlPreferences {
  const { defaults = DEFAULT_MOLECULE_3D_SETTINGS, names = {} } = options;
  const sizeDefaults = (): Molecule3DSettings => ({
    ...defaults,
    ...representationSizes(
      signals.representation?.value ?? defaults.representation,
      defaults,
    ),
  });
  const codecs = {
    representation: enumParam(REPRESENTATIONS, defaults.representation),
    sizeFactor: presetSlider('sizeFactor', sizeDefaults),
    bondSizeFactor: presetSlider('bondSizeFactor', sizeDefaults),
    showSurface: booleanParam({ default: defaults.showSurface }),
    surfaceAlpha: slider('surfaceAlpha', defaults),
    probeRadius: slider('probeRadius', defaults),
    surfaceColoring: enumParam(SURFACE_COLORINGS, defaults.surfaceColoring),
    surfaceColor: stringParam({ default: defaults.surfaceColor, maxLength: 7 }),
  };
  const preferences: Record<string, UrlPreferences[string]> = {};
  for (const key of Object.keys(codecs) as LinkedMolecule3DSetting[]) {
    const signal = signals[key] as SettingSignal<unknown> | undefined;
    if (signal === undefined) continue;
    preferences[names[key] ?? DEFAULT_NAMES[key] ?? key] = {
      codec: codecs[key],
      get: () => signal.value,
      set:
        key === 'representation'
          ? (value) => {
              showRepresentation(signals, value as RepresentationId, defaults);
            }
          : (value) => {
              // A colour that is no colour falls back, as a stored one does.
              signal.value = normalizeMolecule3DSettings({
                ...defaults,
                [key]: value,
              })[key];
            },
    };
  }
  return preferences;
}

/**
 * Switch the representation a link names, and draw it at its own sizes. A
 * link naming the one on screen changes nothing, so the sizes a visitor chose
 * survive the site re-reading its own address.
 * @param signals - The site's signals.
 * @param representation - The representation the link names.
 * @param defaults - What the site opens on.
 */
function showRepresentation(
  signals: Molecule3DSettingSignals,
  representation: RepresentationId,
  defaults: Molecule3DSettings,
): void {
  const { representation: current, sizeFactor, bondSizeFactor } = signals;
  if (current === undefined || current.value === representation) return;
  current.value = representation;
  const sizes = representationSizes(representation, defaults);
  if (sizeFactor !== undefined) sizeFactor.value = sizes.sizeFactor;
  if (bondSizeFactor !== undefined) bondSizeFactor.value = sizes.bondSizeFactor;
}

/** The parameter names that are not the setting's own. */
const DEFAULT_NAMES: Partial<Record<LinkedMolecule3DSetting, string>> = {
  showSurface: 'surface',
};

/** Decimals a slider keeps, so an address never carries 0.30000000000000004. */
const SLIDER_DECIMALS = 2;

/**
 * A size, read and written against the preset of the representation on
 * screen when the link is read or written.
 * @param key - The size.
 * @param defaults - The settings in force, sizes at their preset.
 * @returns The codec.
 */
function presetSlider(
  key: 'sizeFactor' | 'bondSizeFactor',
  defaults: () => Molecule3DSettings,
): ShareParamCodec<number> {
  return {
    parse: (raw) => slider(key, defaults()).parse(raw),
    serialize: (value) => slider(key, defaults()).serialize(value),
  };
}

function slider(
  key: keyof typeof MOLECULE_3D_RANGES,
  defaults: Molecule3DSettings,
) {
  const { minimum, maximum } = MOLECULE_3D_RANGES[key];
  return numberParam({
    min: minimum,
    max: maximum,
    default: defaults[key],
    decimals: SLIDER_DECIMALS,
  });
}
