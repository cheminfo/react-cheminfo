import { formatHiddenParts, readHiddenParts } from './config.ts';
import type { HideablePart, ShareVocabulary } from './vocabulary.ts';

/** What the share dialog can configure on one page of a site. */
export interface PageShareOptions {
  /** How the page is named in the dialog and in the iframe title. */
  title: string;
  /** What this page can switch off. */
  vocabulary: ShareVocabulary;
}

/**
 * The parts of a site's vocabulary one page offers, in the vocabulary's order.
 * @param vocabulary - The site's whole vocabulary.
 * @param keys - The keys the page offers; one the vocabulary lacks is ignored.
 * @returns The page's parts.
 */
export function pickShareParts(
  vocabulary: ShareVocabulary,
  keys: Iterable<string>,
): HideablePart[] {
  const wanted = new Set(keys);
  const parts: HideablePart[] = [];
  for (const part of vocabulary.parts) {
    if (wanted.has(part.key)) parts.push(part);
  }
  return parts;
}

/** The `hide` parameter of a site, read and written as its own part ids. */
export interface HiddenParts<TId extends string> {
  /**
   * Read the hidden parts out of a `hide` parameter. A name the site does not
   * know is dropped, so a hand-written link cannot hide what it cannot name.
   * @param value - Raw parameter, comma separated.
   * @returns The parts to leave out, in the site's order.
   */
  parseHidden: (value: string | undefined) => TId[];
  /**
   * Write a `hide` parameter, in the site's order, so one selection always
   * produces one link.
   * @param hidden - The parts to leave out.
   * @returns The parameter value, or an empty string when nothing is hidden.
   */
  serializeHidden: (hidden: readonly TId[]) => string;
  /**
   * Whether a string names one of the site's parts.
   * @param value - Candidate name.
   * @returns True when it is one of the ids.
   */
  isPartId: (value: string) => value is TId;
}

/**
 * The `hide` parameter of a site whose parts are a record by id.
 * @param ids - Every part id, in the order `?hide=` lists them.
 * @param parts - The part each id names.
 * @returns The reader, the writer and the guard.
 */
export function createHiddenParts<TId extends string>(
  ids: readonly TId[],
  parts: Readonly<Record<TId, HideablePart>>,
): HiddenParts<TId> {
  const siteParts: HideablePart[] = [];
  for (const id of ids) siteParts.push(parts[id]);
  const known = new Set<string>(ids);
  const isPartId = (value: string): value is TId => known.has(value);
  return {
    parseHidden(value) {
      const hidden: TId[] = [];
      for (const key of readHiddenParts(value, siteParts)) {
        if (isPartId(key)) hidden.push(key);
      }
      return hidden;
    },
    serializeHidden: (hidden) => formatHiddenParts(hidden, siteParts),
    isPartId,
  };
}
