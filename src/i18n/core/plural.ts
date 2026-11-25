/**
 * The plural a catalog reads without an ICU formatter: a message with
 * branches is one key per branch — `objects.kept_one`, `objects.kept_other`,
 * the suffixes i18next writes, which no dotted key can collide with — and the
 * page asks for the family, `objects.kept`, with a numeric `count`.
 * The branch is the count's CLDR category in the language asked
 * (`Intl.PluralRules`, which every browser ships), so French reads 0 and 1.5
 * as `one` where English reads them as `other`, and a language that needs a
 * `few` or a `many` adds that key in its own file. A branch a language does
 * not write reads as `other`.
 */

import type { Language } from './languages.ts';
import type { MessageValues } from './messageValues.ts';

/** The CLDR plural categories, `other` last: every family writes `other`. */
export const PLURAL_CATEGORIES = [
  'zero',
  'one',
  'two',
  'few',
  'many',
  'other',
] as const satisfies readonly Intl.LDMLPluralRule[];

/** The value a family's branch is chosen by. */
export const PLURAL_VALUE = 'count';

/** What joins a family's key to the category of one of its branches: `objects.kept_one`. */
export const PLURAL_SEPARATOR = '_';

const CATEGORIES: ReadonlySet<string> = new Set(PLURAL_CATEGORIES);
const RULES = new Map<Language, Intl.PluralRules>();

/**
 * The plural category of a count in a language.
 * @param count - The count.
 * @param language - The language.
 * @returns Its category: `one` for 1 in English, for 0 and 1.5 in French.
 */
export function pluralCategory(
  count: number,
  language: Language,
): Intl.LDMLPluralRule {
  let rules = RULES.get(language);
  if (rules === undefined) {
    rules = new Intl.PluralRules(language);
    RULES.set(language, rules);
  }
  return rules.select(count);
}

/**
 * The key of a family's `other` branch, the one every family writes.
 * @param key - The family, `objects.kept`.
 * @returns `objects.kept_other`.
 */
export function pluralOther(key: string): string {
  return `${key}${PLURAL_SEPARATOR}other`;
}

/**
 * The key a family's message is read under, for the count its values carry.
 * @param key - The family, `objects.kept`.
 * @param values - The values of the message; `count` chooses the branch.
 * @param language - The language it is read in.
 * @returns The branch, `objects.kept_one` or `objects.kept_other`: `other`
 *   when the values carry no numeric count.
 */
export function pluralBranch(
  key: string,
  values: MessageValues | undefined,
  language: Language,
): string {
  const count = values?.[PLURAL_VALUE];
  const category =
    typeof count === 'number' ? pluralCategory(count, language) : 'other';
  return `${key}${PLURAL_SEPARATOR}${category}`;
}

/**
 * The family a branch key belongs to.
 * @param key - A key, `objects.kept_few`.
 * @returns The family, `objects.kept`, or `undefined` for a key that is no branch.
 */
export function pluralFamily(key: string): string | undefined {
  const at = key.lastIndexOf(PLURAL_SEPARATOR);
  if (at <= 0) return undefined;
  const category = key.slice(at + 1);
  return CATEGORIES.has(category) ? key.slice(0, at) : undefined;
}
