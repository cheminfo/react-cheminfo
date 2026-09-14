import { EMBED_PARAM, HIDE_PARAM } from './config.ts';
import type { ShareParamCodec } from './params.ts';
import type { QueryEntry } from './query.ts';
import { firstValues, parseQuery, serializeQuery } from './query.ts';

/**
 * One persisted user choice mirrored in the address bar: how it is read from
 * and written to a link, and how the site reads and stores it.
 */
export interface UrlPreference<Value> {
  /** How the value is read from a link and written back; its default is never written. */
  codec: ShareParamCodec<Value>;
  /**
   * The value in force.
   * @returns The current value.
   */
  get(): Value;
  /**
   * Store a value a link carries, which makes it the visitor's saved preference.
   * @param value - The value to store.
   */
  set(value: Value): void;
}

/** The preferences a site mirrors, keyed by their URL parameter name. */
export type UrlPreferences = Readonly<Record<string, UrlPreference<unknown>>>;

/** The minimal part of `window.location` the sync reads. */
export interface PreferenceLocation {
  /** The path of the address. */
  readonly pathname: string;
  /** The query string, with its leading `?` or empty. */
  readonly search: string;
  /** The fragment, with its leading `#` or empty. */
  readonly hash: string;
}

/** The minimal part of `window.history` the sync writes through. */
export interface PreferenceHistory {
  /** The state of the current entry, kept as it is. */
  readonly state: unknown;
  /**
   * Rewrite the current entry without adding one.
   * @param data - The state to keep.
   * @param unused - Ignored by browsers.
   * @param url - The new address.
   */
  replaceState(data: unknown, unused: string, url: string): void;
}

/** What {@link syncPreferencesWithUrl} is given. */
export interface SyncPreferencesOptions {
  /** The preferences to mirror, keyed by their URL parameter name. */
  preferences: UrlPreferences;
  /** Call the listener whenever any preference changes, and answer a function that stops calling it. */
  subscribe: (listener: () => void) => () => void;
  /**
   * The address to read and keep up to date.
   * @default globalThis.location
   */
  location?: PreferenceLocation;
  /**
   * The history to rewrite.
   * @default globalThis.history
   */
  history?: PreferenceHistory;
}

/**
 * Store the preferences a link carries. Only the keys present are set: a key
 * the link omits leaves the saved preference as it is. A malformed value falls
 * back to the codec's default.
 * @param search - The query string, with or without its leading `?`.
 * @param preferences - The preferences, keyed by their URL parameter name.
 * @returns The names of the preferences that were set, in declaration order.
 */
export function applyPreferencesFromSearch(
  search: string,
  preferences: UrlPreferences,
): string[] {
  assertPreferenceNames(preferences);
  const values = firstValues(parseQuery(search));
  const applied: string[] = [];
  for (const [name, preference] of Object.entries(preferences)) {
    const raw = values.get(name);
    if (raw === undefined) continue;
    preference.set(preference.codec.parse(raw));
    applied.push(name);
  }
  return applied;
}

/**
 * Write the preferences into a query string. A preference already in the
 * address keeps its place, a new one is appended, one at its default is
 * deleted; every other key keeps its value and its order.
 * @param search - The query string, with or without its leading `?`.
 * @param preferences - The preferences, keyed by their URL parameter name.
 * @returns The new query string, without its leading `?`.
 */
export function writePreferencesToSearch(
  search: string,
  preferences: UrlPreferences,
): string {
  assertPreferenceNames(preferences);
  const written = new Map<string, string | null>();
  for (const [name, preference] of Object.entries(preferences)) {
    written.set(name, preference.codec.serialize(preference.get()));
  }
  const entries: QueryEntry[] = [];
  const placed = new Set<string>();
  for (const entry of parseQuery(search)) {
    const [key] = entry;
    if (!written.has(key)) {
      entries.push(entry);
      continue;
    }
    if (placed.has(key)) continue;
    placed.add(key);
    const raw = written.get(key);
    if (raw !== null && raw !== undefined) entries.push([key, raw]);
  }
  for (const [name, raw] of written) {
    if (!placed.has(name) && raw !== null) entries.push([name, raw]);
  }
  return serializeQuery(entries);
}

/**
 * Mirror a site's preferences in the address bar. The preferences the current
 * address carries are applied once, then the address is rewritten with
 * `history.replaceState` — never a new history entry — every time one changes.
 * The path, the hash and every other query key are kept, and the address is
 * left alone when nothing in it would change.
 *
 * A site using signals subscribes with an effect reading every value:
 *
 * ```ts
 * const stop = syncPreferencesWithUrl({
 *   preferences: {
 *     strategy: {
 *       codec: enumParam(['greedy', 'exhaustive'] as const, 'greedy'),
 *       get: () => state.preferences.strategy.value,
 *       set: (value) => (state.preferences.strategy.value = value),
 *     },
 *   },
 *   subscribe: (listener) =>
 *     effect(() => {
 *       void state.preferences.strategy.value;
 *       listener();
 *     }),
 * });
 * ```
 * @param options - The preferences, how to watch them, and the address.
 * @returns A function that stops rewriting the address.
 */
export function syncPreferencesWithUrl(
  options: SyncPreferencesOptions,
): () => void {
  const {
    preferences,
    subscribe,
    location = globalThis.location,
    history = globalThis.history,
  } = options;
  assertPreferenceNames(preferences);
  applyPreferencesFromSearch(location.search, preferences);
  let active = true;
  function write(): void {
    if (!active) return;
    const current = location.search;
    const next = writePreferencesToSearch(current, preferences);
    if (sameQuery(current, next)) return;
    const query = next === '' ? '' : `?${next}`;
    history.replaceState(
      history.state,
      '',
      `${location.pathname}${query}${location.hash}`,
    );
  }
  const unsubscribe = subscribe(write);
  write();
  return () => {
    active = false;
    unsubscribe();
  };
}

const RESERVED_NAMES = new Set([EMBED_PARAM, HIDE_PARAM]);

function assertPreferenceNames(preferences: UrlPreferences): void {
  for (const name of Object.keys(preferences)) {
    if (RESERVED_NAMES.has(name)) {
      throw new Error(
        `preference "${name}" collides with a reserved share parameter`,
      );
    }
  }
}

function sameQuery(current: string, next: string): boolean {
  const before = parseQuery(current);
  const after = parseQuery(next);
  if (before.length !== after.length) return false;
  for (let index = 0; index < before.length; index++) {
    const left = before[index];
    const right = after[index];
    if (left?.[0] !== right?.[0] || left?.[1] !== right?.[1]) return false;
  }
  return true;
}
