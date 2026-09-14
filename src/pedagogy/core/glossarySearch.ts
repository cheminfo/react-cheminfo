import type { Glossary, GlossaryEntry, GlossaryExample } from './glossary.ts';

/** One entry of a glossary, with the key it is stored under. */
export interface GlossaryListing<TExample = GlossaryExample> {
  /** The lowercased marker text the entry is keyed by. */
  key: string;
  /** The entry itself. */
  entry: GlossaryEntry<TExample>;
}

/**
 * Every entry of a glossary in alphabetical order of title, or only the ones
 * a search names.
 *
 * A query matches, whatever its case, the key, the title, the summary, or any
 * text an example carries — its code, its input and its note, or whichever
 * text fields a tool's own example shape has. That is what a student types
 * when they remember `c1ccccc1` but not that it was filed under `aromatic
 * atom`.
 * @param glossary - The terms the site defines.
 * @param query - What the student typed; blank lists every entry.
 * @returns The matching entries, sorted by title.
 */
export function listGlossary<TExample>(
  glossary: Glossary<TExample>,
  query = '',
): Array<GlossaryListing<TExample>> {
  const needle = query.trim().toLowerCase();
  const listings: Array<GlossaryListing<TExample>> = [];
  for (const [key, entry] of Object.entries(glossary)) {
    if (needle === '' || entryMatches(key, entry, needle)) {
      listings.push({ key, entry });
    }
  }
  return listings.toSorted((first, second) =>
    first.entry.title.localeCompare(second.entry.title, 'en'),
  );
}

function entryMatches(
  key: string,
  entry: GlossaryEntry<unknown>,
  needle: string,
): boolean {
  if (key.includes(needle)) return true;
  if (includesNeedle(entry.title, needle)) return true;
  if (includesNeedle(entry.summary, needle)) return true;
  for (const example of entry.examples) {
    if (exampleMatches(example, needle)) return true;
  }
  return false;
}

function exampleMatches(example: unknown, needle: string): boolean {
  if (typeof example === 'string') return includesNeedle(example, needle);
  if (typeof example !== 'object' || example === null) return false;
  for (const value of Object.values(example)) {
    if (typeof value === 'string' && includesNeedle(value, needle)) {
      return true;
    }
  }
  return false;
}

function includesNeedle(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle);
}
