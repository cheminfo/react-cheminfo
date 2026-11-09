/**
 * The paper a visitor most likely prints on. No browser says what is in the
 * printer, so it is read from where the visitor is.
 */

import { getCountryForTimezone } from 'countries-and-timezones';

import { A4, US_LETTER } from './pages.ts';
import type { DrawPage } from './types.ts';

/**
 * The territories that print on US Letter, as the `paperSize` table of CLDR's
 * supplemental measurement data lists them. Everywhere else prints on A4.
 */
const LETTER_TERRITORIES: ReadonlySet<string> = new Set([
  'BZ',
  'CA',
  'CL',
  'CO',
  'CR',
  'GT',
  'MX',
  'NI',
  'PA',
  'PH',
  'PR',
  'SV',
  'US',
  'VE',
]);

/**
 * The paper for a time zone and a list of languages. The time zone decides: it
 * says where the printer is, whereas `en-US` is what an English browser says
 * almost anywhere. The language's region only answers for a zone that names no
 * place, such as the UTC of a virtual machine or a private browser.
 * @param timeZone - The IANA time zone.
 * @param languages - The browser's languages, the preferred first.
 * @returns The paper, upright.
 */
export function paperFor(
  timeZone: string | undefined,
  languages: readonly string[],
): DrawPage {
  const territory =
    territoryOfZone(timeZone) ?? territoryOfLanguages(languages);
  return territory && LETTER_TERRITORIES.has(territory) ? US_LETTER : A4;
}

/**
 * The paper this browser most likely prints on.
 * @returns The paper, upright.
 */
export function localPaper(): DrawPage {
  return paperFor(
    new Intl.DateTimeFormat().resolvedOptions().timeZone,
    globalThis.navigator?.languages ?? [],
  );
}

function territoryOfZone(timeZone: string | undefined): string | undefined {
  if (!timeZone) return undefined;
  return getCountryForTimezone(timeZone)?.id;
}

function territoryOfLanguages(languages: readonly string[]) {
  for (const language of languages) {
    const region = regionOf(language);
    if (region) return region;
  }
  return undefined;
}

function regionOf(language: string): string | undefined {
  try {
    return new Intl.Locale(language).region;
  } catch {
    return undefined;
  }
}
