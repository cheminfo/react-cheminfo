/**
 * The languages the family speaks.
 *
 * Four, decided together rather than site by site: a visitor who switches to
 * German on one tool and follows a link to the next must land in German there
 * too, and a list that differs between two sites makes that impossible.
 */

/** Every language a site of the family is written in. */
export const LANGUAGES = ['en', 'fr', 'de', 'es'] as const;

/** One of {@link LANGUAGES}. */
export type Language = (typeof LANGUAGES)[number];

/**
 * The language the catalogs are written in first, and the one every site opens
 * in: an address naming it carries nothing, and a message a translation does
 * not hold falls back to it.
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * What a language switch writes behind each entry.
 *
 * A language names itself, in its own words: `Deutsch`, never `German`. A
 * reader looking for their own language recognises it written their way, and
 * would have to know English to find it written the other.
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

/**
 * Whether a string is one of the languages the family speaks.
 * @param value - Candidate tag, typically read off an address.
 * @returns True when a catalog can be written in it.
 */
export function isLanguage(value: string): value is Language {
  for (const language of LANGUAGES) {
    if (language === value) return true;
  }
  return false;
}
