/**
 * What a translator is offered before typing: the translations already made
 * for the same English, for English that differs only where the text is not
 * language, and for English that merely looks like it.
 *
 * A table is where this earns its place. Half of 118 element names are the
 * same word in two languages and the other half differ by an ending; a column
 * of quantities is a handful of phrases repeated with one word changed. A
 * translator who is shown what was done three rows above confirms instead of
 * typing, and the column stays consistent with itself — which is the thing a
 * long table loses first.
 *
 * Nothing here invents a translation. Every suggestion is a translation
 * somebody already wrote, either as it stands or with the part that is not
 * language put back.
 */

import leven from 'leven';

/** One message already translated, which a suggestion is drawn from. */
export interface TranslatedPair {
  /** The key it is kept under, so the translator can see where it came from. */
  key: string;
  /** The English message. */
  source: string;
  /** Its translation. */
  target: string;
}

/**
 * How a suggestion was arrived at.
 *
 * - `exact` — the same English message, translated elsewhere.
 * - `pattern` — English that differs only in a part that is not language (a
 *   number, a symbol, a formula), with that part put back into the
 *   translation.
 * - `similar` — English that looks like this one; the translation is offered
 *   to be adapted, not to be taken as it is.
 */
export type SuggestionKind = 'exact' | 'pattern' | 'similar';

/** One translation offered for a message. */
export interface MessageSuggestion {
  /** What goes in the box if the translator takes it. */
  message: string;
  /** How it was arrived at. */
  kind: SuggestionKind;
  /** Between 0 and 1; 1 is the same English message. */
  score: number;
  /** The already-translated message it was drawn from. */
  from: TranslatedPair;
}

/** How suggestions are chosen. */
export interface SuggestionOptions {
  /**
   * The most suggestions to return.
   * @default 5
   */
  limit?: number;
  /**
   * How alike two English messages must be before one is offered for the
   * other, between 0 and 1.
   * @default 0.55
   */
  minimumScore?: number;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_MINIMUM = 0.55;
const KIND_ORDER: Record<SuggestionKind, number> = {
  exact: 0,
  pattern: 1,
  similar: 2,
};

/**
 * The translations worth offering for one English message.
 * @param source - The English message being translated.
 * @param pairs - Every message already translated in this language.
 * @param options - See {@link SuggestionOptions}.
 * @returns The suggestions, best first; empty when nothing is close enough.
 */
export function messageSuggestions(
  source: string,
  pairs: readonly TranslatedPair[],
  options: SuggestionOptions = {},
): MessageSuggestion[] {
  const { limit = DEFAULT_LIMIT, minimumScore = DEFAULT_MINIMUM } = options;
  if (source === '' || limit <= 0) return [];

  const found: MessageSuggestion[] = [];
  for (const pair of pairs) {
    if (pair.target === '' || pair.source === '') continue;
    const suggestion = suggestFrom(source, pair, minimumScore);
    if (suggestion !== undefined) found.push(suggestion);
  }

  found.sort(compareSuggestions);
  const best: MessageSuggestion[] = [];
  const taken = new Set<string>();
  for (const suggestion of found) {
    if (taken.has(suggestion.message)) continue;
    taken.add(suggestion.message);
    best.push(suggestion);
    if (best.length === limit) break;
  }
  return best;
}

/**
 * How alike two messages are, as the suggestions rank them.
 * @param first - One message.
 * @param second - The other.
 * @returns 1 when they are the same, 0 when they share nothing.
 */
export function messageSimilarity(first: string, second: string): number {
  const longest = Math.max(first.length, second.length);
  if (longest === 0) return 1;
  return 1 - leven(first, second) / longest;
}

/**
 * The best offer one already-translated message can make for another.
 * @param source - The English being translated.
 * @param pair - The already-translated message to draw from.
 * @param minimumScore - How alike the two must be to be worth offering.
 * @returns The suggestion, or `undefined` when the pair is too far away.
 */
function suggestFrom(
  source: string,
  pair: TranslatedPair,
  minimumScore: number,
): MessageSuggestion | undefined {
  if (pair.source === source) {
    return { message: pair.target, kind: 'exact', score: 1, from: pair };
  }

  // An edit can never be smaller than the difference in length, so a pair that
  // cannot reach the threshold is dropped before the distance is computed.
  const longest = Math.max(source.length, pair.source.length);
  const shortest = Math.min(source.length, pair.source.length);
  if (longest === 0 || shortest / longest < minimumScore) return undefined;

  const pattern = patternSuggestion(source, pair);
  if (pattern !== undefined && pattern.score >= minimumScore) return pattern;

  const score = messageSimilarity(source, pair.source);
  if (score < minimumScore) return undefined;
  return { message: pair.target, kind: 'similar', score, from: pair };
}

/**
 * A translation whose English differs from this one only in a run of text
 * that survives into the translation unchanged — a number, a symbol, a
 * formula. That run is the only thing put back, so nothing is invented.
 * @param source - The English being translated.
 * @param pair - The already-translated message to draw from.
 * @returns The suggestion, or `undefined` when the run cannot be put back.
 */
function patternSuggestion(
  source: string,
  pair: TranslatedPair,
): MessageSuggestion | undefined {
  const prefix = commonPrefix(source, pair.source);
  const suffix = commonSuffix(source.slice(prefix), pair.source.slice(prefix));
  const own = source.slice(prefix, source.length - suffix);
  const theirs = pair.source.slice(prefix, pair.source.length - suffix);
  if (theirs === '') return undefined;

  // The varying run must appear once and only once, or putting it back would
  // be a guess about which occurrence was meant.
  const at = pair.target.indexOf(theirs);
  if (at === -1 || pair.target.includes(theirs, at + 1)) return undefined;

  const message =
    pair.target.slice(0, at) + own + pair.target.slice(at + theirs.length);
  const kept = prefix + suffix;
  const score = kept / Math.max(source.length, pair.source.length);
  return { message, kind: 'pattern', score, from: pair };
}

function commonPrefix(first: string, second: string): number {
  const limit = Math.min(first.length, second.length);
  let length = 0;
  while (length < limit && first[length] === second[length]) length++;
  return length;
}

function commonSuffix(first: string, second: string): number {
  const limit = Math.min(first.length, second.length);
  let length = 0;
  while (
    length < limit &&
    first[first.length - 1 - length] === second[second.length - 1 - length]
  ) {
    length++;
  }
  return length;
}

function compareSuggestions(
  first: MessageSuggestion,
  second: MessageSuggestion,
): number {
  if (first.kind !== second.kind) {
    return KIND_ORDER[first.kind] - KIND_ORDER[second.kind];
  }
  if (first.score !== second.score) return second.score - first.score;
  return first.from.key < second.from.key ? -1 : 1;
}
