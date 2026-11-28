import type { FigureStates } from '../../download/core/figureState.ts';
import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';

/** What {@link carriedValue} checks a carried state against. */
export interface CarriedValueOptions {
  /** The version of the state this site reads. */
  version: number;
  /** The site, as the family names it, e.g. `uv-vis`. */
  site: string;
  /**
   * Which state of the figure is read.
   * @default 'data'
   */
  part?: 'data' | 'view' | 'preferences';
  /**
   * The host the refusal names.
   * @default `<site>.cheminfo.org`
   */
  host?: string;
  /**
   * The sentence a figure carrying no such state is refused with, in the
   * site's own words (`This holds no spectra to open.`).
   * @default undefined — refused as a state of another version
   */
  missing?: string;
  /**
   * The language a refusal is said in.
   * @default 'en'
   */
  language?: Language;
}

/**
 * The value a figure carries for the site, once its version is the one the
 * site reads: what opening a figure starts with, before the site's own checks
 * of its shape.
 * @param states - The states the figure carries.
 * @param options - The version and the site, and what to say otherwise.
 * @returns The carried value.
 * @throws {Error} When the state is absent or of another version.
 */
export function carriedValue(
  states: FigureStates,
  options: CarriedValueOptions,
): unknown {
  const { version, site, part = 'data', missing, language, host } = options;
  const carried = states[part];
  if (carried === undefined && missing !== undefined) {
    throw new Error(missing);
  }
  if (carried?.version !== version) {
    throw new Error(
      CHROME_CATALOG.translate(
        'figure.otherVersion',
        language ?? DEFAULT_LANGUAGE,
        { values: { host: host ?? `${site}.cheminfo.org` } },
      ),
    );
  }
  return carried.value;
}
