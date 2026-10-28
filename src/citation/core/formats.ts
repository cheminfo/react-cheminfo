import type {
  ArticleReference,
  DatasetReference,
  Reference,
  ReferenceAuthor,
} from './reference.ts';
import { doiUrl } from './reference.ts';
import { renderHtml, renderMarkdown, renderText } from './render.ts';
import type { CitationStyleId } from './segments.ts';
import { citationSegments, nameFamilyFirst, pageRange } from './segments.ts';

/** The formats the reference can be copied in. */
export type CitationFormatId =
  'text' | 'html' | 'markdown' | 'bibtex' | 'ris' | 'doi';

/** One entry of the copy menu. */
export interface CitationFormat {
  id: CitationFormatId;
  /** Name of the format. */
  label: string;
  /** Where that format is pasted, shown on the right of the entry. */
  hint: string;
  /**
   * Whether the format is written differently by each journal style, and so
   * opens the submenu of styles rather than copying straight away.
   */
  styled: boolean;
}

/**
 * Every format offered, in the order the menu lists them. Plain text is not
 * one of them: an HTML copy carries it as its second flavour, so a paste into
 * a plain editor already gives the unmarked line.
 */
export const CITATION_FORMATS = [
  { id: 'html', label: 'HTML', hint: 'Word, Docs, email', styled: true },
  { id: 'markdown', label: 'Markdown', hint: 'README, issue', styled: true },
  { id: 'bibtex', label: 'BibTeX', hint: 'LaTeX', styled: false },
  { id: 'ris', label: 'RIS', hint: 'EndNote, Zotero', styled: false },
  { id: 'doi', label: 'DOI link', hint: 'URL', styled: false },
] as const satisfies readonly CitationFormat[];

/** The style a format that has one is written in unless another is picked. */
export const DEFAULT_CITATION_STYLE: CitationStyleId = 'acs';

/** One entry of the download menu: a file a reference manager imports. */
export interface CitationDownload {
  format: CitationFormatId;
  label: string;
  hint: string;
  extension: string;
  mimeType: string;
}

/**
 * The files offered for download. Zotero, Mendeley and EndNote all import
 * both, and their connectors recognise the MIME types below on their own.
 */
export const CITATION_DOWNLOADS = [
  {
    format: 'ris',
    label: 'RIS file',
    hint: 'Zotero, Mendeley, EndNote',
    extension: 'ris',
    mimeType: 'application/x-research-info-systems',
  },
  {
    format: 'bibtex',
    label: 'BibTeX file',
    hint: 'JabRef, Overleaf',
    extension: 'bib',
    mimeType: 'application/x-bibtex',
  },
] as const satisfies readonly CitationDownload[];

/**
 * Name the saved file carries, e.g. `Vanderveen2015.ris`.
 * @param reference - Reference the file holds.
 * @param extension - Extension of the file, without its dot.
 * @returns The file name.
 */
export function citationFilename(
  reference: Reference,
  extension: string,
): string {
  return `${bibTeXKey(reference)}.${extension}`;
}

/**
 * Render a reference in one of the citation formats.
 * @param reference - Reference to render.
 * @param format - Format to render it in.
 * @param style - Journal style, for the formats that have one.
 * @returns The citation, ready to be copied to the clipboard.
 */
export function formatCitation(
  reference: Reference,
  format: CitationFormatId,
  style: CitationStyleId = DEFAULT_CITATION_STYLE,
): string {
  switch (format) {
    case 'text':
      return renderText(citationSegments(reference, style));
    case 'html':
      return renderHtml(citationSegments(reference, style));
    case 'markdown':
      return renderMarkdown(citationSegments(reference, style));
    case 'bibtex':
      return formatBibTeX(reference);
    case 'ris':
      return formatRis(reference);
    case 'doi':
      return doiUrl(reference);
    default:
      throw new Error(`unknown citation format: ${String(format)}`);
  }
}

function formatBibTeX(reference: Reference): string {
  const fields =
    reference.kind === 'dataset'
      ? datasetBibTeXFields(reference)
      : articleBibTeXFields(reference);
  const body = fields
    .map(([name, value]) => `  ${name} = {${value}},`)
    .join('\n');
  const type = reference.kind === 'dataset' ? 'misc' : 'article';
  return `@${type}{${bibTeXKey(reference)},\n${body}\n}`;
}

function articleBibTeXFields(reference: ArticleReference): Field[] {
  const { title, journal, year, volume, issue, publisher, doi } = reference;
  return [
    ['author', authorList(reference, ' and ')],
    ['title', title],
    ['journal', journal],
    ['year', String(year)],
    ['volume', volume],
    ['number', issue],
    ['pages', pageRange(reference, '--')],
    ['publisher', publisher],
    ['doi', doi],
    ['url', doiUrl(reference)],
  ];
}

/**
 * A dataset as the `@misc` entry every BibTeX style knows, its repository
 * standing as the publisher.
 * @param reference - Dataset to write.
 * @returns The fields of the entry.
 */
function datasetBibTeXFields(reference: DatasetReference): Field[] {
  const { title, repository, year, version, doi } = reference;
  return [
    ['author', authorList(reference, ' and ')],
    ['title', title],
    ['howpublished', repository],
    ['year', String(year)],
    ...(version === undefined ? [] : [['version', version] as Field]),
    ['publisher', repository],
    ['doi', doi],
    ['url', doiUrl(reference)],
  ];
}

function formatRis(reference: Reference): string {
  const lines =
    reference.kind === 'dataset'
      ? datasetRisLines(reference)
      : articleRisLines(reference);
  return lines.map(([tag, value]) => `${tag}  - ${value}`).join('\n');
}

function articleRisLines(reference: ArticleReference): Field[] {
  const { authors, title, journal, year, volume, issue } = reference;
  const { firstPage, lastPage, publisher, doi } = reference;
  return [
    ['TY', 'JOUR'],
    ...risAuthors(authors),
    ['TI', title],
    ['JO', journal],
    ['PY', String(year)],
    ['VL', volume],
    ['IS', issue],
    ['SP', firstPage],
    ['EP', lastPage],
    ['PB', publisher],
    ['DO', doi],
    ['UR', doiUrl(reference)],
    ['ER', ''],
  ];
}

/**
 * A dataset as an RIS `DATA` record, its version where reference managers
 * read one, the edition.
 * @param reference - Dataset to write.
 * @returns The lines of the record.
 */
function datasetRisLines(reference: DatasetReference): Field[] {
  const { authors, title, year, version, repository, doi } = reference;
  return [
    ['TY', 'DATA'],
    ...risAuthors(authors),
    ['TI', title],
    ['PY', String(year)],
    ...(version === undefined ? [] : [['ET', version] as Field]),
    ['PB', repository],
    ['DO', doi],
    ['UR', doiUrl(reference)],
    ['ER', ''],
  ];
}

function risAuthors(authors: readonly ReferenceAuthor[]): Field[] {
  return authors.map((author): Field => ['AU', nameFamilyFirst(author)]);
}

/** One field of a BibTeX entry, or one tagged line of an RIS record. */
type Field = [name: string, value: string];

function authorList(reference: Reference, separator: string): string {
  return reference.authors.map(nameFamilyFirst).join(separator);
}

function bibTeXKey(reference: Reference): string {
  const first = reference.authors[0];
  const family = first === undefined ? 'reference' : first.family;
  return `${family.replaceAll(/[^a-zA-Z]/g, '')}${reference.year}`;
}
