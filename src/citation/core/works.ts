import type { CitationFormatId } from './formats.ts';
import { citationFilename, formatCitation } from './formats.ts';
import type { Reference } from './reference.ts';
import type { CitationStyleId } from './segments.ts';

/**
 * One of the works a site asks to be cited, with the words that say which part
 * of the site it covers: a reader handed two references has to be told what is
 * what before they can pick one.
 */
export interface CitedWork {
  /** The bibliographic record. */
  reference: Reference;
  /** What the work is, in a few words, e.g. `The isomer generator`. */
  what: string;
  /**
   * One sentence saying what citing it credits, read under `what`.
   * @default undefined
   */
  note?: string;
}

/**
 * What separates two citations written at once: a line for the formats that
 * read as a list, a blank line for the ones whose entries are paragraphs.
 */
const SEPARATORS: Record<CitationFormatId, string> = {
  text: '\n',
  html: '<br>',
  markdown: '\n\n',
  bibtex: '\n\n',
  ris: '\n',
  doi: '\n',
};

/** What the file holding several references is called, before its extension. */
const SET_FILENAME = 'references';

/**
 * The references of a list of works, in the order the site names them.
 * @param works - The works being cited.
 * @returns Their bibliographic records.
 */
export function citedReferences(works: readonly CitedWork[]): Reference[] {
  return works.map((work) => work.reference);
}

/**
 * Render several references in one of the citation formats, as the one value a
 * paste or a saved file holds: an RIS or BibTeX file takes every entry, and a
 * written citation takes one reference per line.
 * @param references - References to render, in reading order.
 * @param format - Format to render them in.
 * @param style - Journal style, for the formats that have one.
 * @returns The citations, ready to be copied to the clipboard or saved.
 */
export function formatCitations(
  references: readonly Reference[],
  format: CitationFormatId,
  style?: CitationStyleId,
): string {
  return references
    .map((reference) => formatCitation(reference, format, style))
    .join(SEPARATORS[format]);
}

/**
 * Name the saved file carries: the author and the year of the work when there
 * is one, and a plain `references` when the site asks for several.
 * @param references - References the file holds.
 * @param extension - Extension of the file, without its dot.
 * @returns The file name.
 */
export function citationsFilename(
  references: readonly Reference[],
  extension: string,
): string {
  const only = references.length === 1 ? references[0] : undefined;
  if (only === undefined) return `${SET_FILENAME}.${extension}`;
  return citationFilename(only, extension);
}
