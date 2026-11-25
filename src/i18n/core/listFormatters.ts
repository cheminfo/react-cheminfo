/**
 * Lists written the way a language writes them (`Intl.ListFormat`, never a
 * hand-made join). The formatters of a language are made once and kept, so a
 * memo that reads them stays put until the language changes.
 */

/** How a list is written. */
export interface ListFormatters {
  /** Names in a sentence, joined as the language joins them: `a.txt and b.csv`. */
  names: (items: readonly string[]) => string;
  /** Values in a property, without a conjunction: `w1, w2, w3`. */
  values: (items: readonly string[]) => string;
  /** Short names side by side, as narrow as the language writes them: `Red Green`. */
  narrow: (items: readonly string[]) => string;
  /** Alternatives, one or the other: `an image or a mask`. */
  either: (items: readonly string[]) => string;
}

const MADE = new Map<string, ListFormatters>();

/**
 * The list formatters of a language, the same object for the same language.
 * @param language - The language, as a BCP 47 tag.
 * @returns See {@link ListFormatters}.
 */
export function listFormatters(language: string): ListFormatters {
  let kept = MADE.get(language);
  if (kept === undefined) {
    kept = formattersOf(language);
    MADE.set(language, kept);
  }
  return kept;
}

function formattersOf(language: string): ListFormatters {
  const names = new Intl.ListFormat(language, {
    style: 'long',
    type: 'conjunction',
  });
  const values = new Intl.ListFormat(language, {
    style: 'short',
    type: 'unit',
  });
  const narrow = new Intl.ListFormat(language, {
    style: 'narrow',
    type: 'unit',
  });
  const either = new Intl.ListFormat(language, {
    style: 'long',
    type: 'disjunction',
  });
  return {
    names: (items) => names.format(items),
    values: (items) => values.format(items),
    narrow: (items) => narrow.format(items),
    either: (items) => either.format(items),
  };
}
