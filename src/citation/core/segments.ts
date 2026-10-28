import type {
  ArticleReference,
  DatasetReference,
  Reference,
  ReferenceAuthor,
} from './reference.ts';
import { doiUrl } from './reference.ts';

/** One piece of a written reference, with the emphasis its style asks for. */
export type CitationSegment =
  | { kind: 'text' | 'italic' | 'bold'; text: string }
  | { kind: 'link'; text: string; href: string };

/** The journal styles the reference can be written in. */
export type CitationStyleId = 'acs' | 'nature' | 'rsc' | 'wiley';

/** One entry of the style submenu. */
export interface CitationStyle {
  id: CitationStyleId;
  /** Name of the style. */
  label: string;
  /** Journals that ask for it, shown on the right of the entry. */
  hint: string;
}

/** Every style offered, in the order the menu lists them. */
export const CITATION_STYLES = [
  { id: 'acs', label: 'ACS', hint: 'JACS, Org. Lett.' },
  { id: 'nature', label: 'Nature', hint: 'Nature, Nat. Chem.' },
  { id: 'rsc', label: 'RSC', hint: 'Chem. Sci., Green Chem.' },
  { id: 'wiley', label: 'Wiley', hint: 'Angew. Chem., Chem. Eur. J.' },
] as const satisfies readonly CitationStyle[];

/**
 * Write a reference in one journal style, as the pieces every output format
 * then renders with its own emphasis.
 * @param reference - Reference to write.
 * @param style - Style to write it in.
 * @returns The segments of the citation, in reading order.
 */
export function citationSegments(
  reference: Reference,
  style: CitationStyleId,
): CitationSegment[] {
  if (reference.kind === 'dataset') return datasetSegments(reference, style);
  switch (style) {
    case 'acs':
      return acs(reference);
    case 'nature':
      return nature(reference);
    case 'rsc':
      return rsc(reference);
    case 'wiley':
      return wiley(reference);
    default:
      throw new Error(`unknown citation style: ${String(style)}`);
  }
}

/**
 * A dataset as each style writes one: the repository stands where the journal
 * would, and there is neither a volume nor pages. The title is kept by every
 * style, the RSC one included, since it is what tells two datasets of the same
 * authors and year apart.
 * @param reference - Dataset to write.
 * @param style - Style to write it in.
 * @returns The segments of the citation, in reading order.
 */
function datasetSegments(
  reference: DatasetReference,
  style: CitationStyleId,
): CitationSegment[] {
  const { repository, year, version } = reference;
  const title =
    version === undefined
      ? reference.title
      : `${reference.title}, version ${version}`;
  switch (style) {
    case 'acs':
      return [
        text(`${withPeriod(familyFirst(reference, '; '))} ${title}; `),
        italic(repository),
        text(`, ${year}. `),
        doiLink(reference),
      ];
    case 'nature':
      return [
        text(`${withPeriod(familyFirstAmpersand(reference))} ${title}. `),
        italic(repository),
        text(` (${year}). `),
        doiLink(reference),
      ];
    case 'rsc':
      return [
        text(`${initialsFirst(reference, ' and ')}, ${title}, `),
        italic(repository),
        text(`, ${year}. `),
        doiLink(reference),
      ];
    case 'wiley':
      return [
        text(`${initialsFirst(reference, ', ')}, ${title}, `),
        italic(repository),
        text(`, ${year}. `),
        doiLink(reference),
      ];
    default:
      throw new Error(`unknown citation style: ${String(style)}`);
  }
}

function acs(reference: ArticleReference): CitationSegment[] {
  const { title, journalAbbreviation, year, volume } = reference;
  return [
    text(`${withPeriod(familyFirst(reference, '; '))} ${title}. `),
    italic(journalAbbreviation),
    text(' '),
    bold(String(year)),
    text(', '),
    italic(volume),
    text(`, ${pageRange(reference)}. `),
    doiLink(reference),
  ];
}

function nature(reference: ArticleReference): CitationSegment[] {
  const { title, journalAbbreviation, year, volume } = reference;
  return [
    text(`${withPeriod(familyFirstAmpersand(reference))} ${title}. `),
    italic(journalAbbreviation),
    text(' '),
    bold(volume),
    text(`, ${pageRange(reference)} (${year}). `),
    doiLink(reference),
  ];
}

function rsc(reference: ArticleReference): CitationSegment[] {
  const { journalAbbreviation, year, volume } = reference;
  return [
    text(`${initialsFirst(reference, ' and ')}, `),
    italic(journalAbbreviation),
    text(`, ${year}, `),
    bold(volume),
    text(`, ${pageRange(reference)}. `),
    doiLink(reference),
  ];
}

function wiley(reference: ArticleReference): CitationSegment[] {
  const { journalAbbreviation, year, volume } = reference;
  return [
    text(`${initialsFirst(reference, ', ')}, `),
    italic(journalAbbreviation),
    text(' '),
    bold(String(year)),
    text(', '),
    italic(volume),
    text(`, ${pageRange(reference)}. `),
    doiLink(reference),
  ];
}

function text(value: string): CitationSegment {
  return { kind: 'text', text: value };
}

function italic(value: string): CitationSegment {
  return { kind: 'italic', text: value };
}

function bold(value: string): CitationSegment {
  return { kind: 'bold', text: value };
}

function doiLink(reference: Reference): CitationSegment {
  return {
    kind: 'link',
    text: `doi:${reference.doi}`,
    href: doiUrl(reference),
  };
}

/**
 * The author list closed by a full stop. A person's name already ends on the
 * one of their last initial; an organisation's name needs its own.
 * @param authors - The author list.
 * @returns It, ending with a full stop.
 */
function withPeriod(authors: string): string {
  return authors.endsWith('.') ? authors : `${authors}.`;
}

/**
 * `Vanderveen, J. R.; Patiny, L.` — the family name leads.
 * @param reference - The work being written.
 * @param separator - What goes between two authors.
 * @returns The authors, as one string.
 */
function familyFirst(reference: Reference, separator: string): string {
  return reference.authors.map(nameFamilyFirst).join(separator);
}

/**
 * The same, with the last author introduced by an ampersand.
 * @param reference - The work being written.
 * @returns The authors, as one string.
 */
function familyFirstAmpersand(reference: Reference): string {
  const names = reference.authors.map(nameFamilyFirst);
  const last = names.at(-1);
  if (names.length < 2 || last === undefined) return names.join(', ');
  return `${names.slice(0, -1).join(', ')} & ${last}`;
}

/**
 * `J. R. Vanderveen, L. Patiny` — the initials lead.
 * @param reference - The work being written.
 * @param lastSeparator - What introduces the last author.
 * @returns The authors, as one string.
 */
function initialsFirst(reference: Reference, lastSeparator: string): string {
  const names = reference.authors.map((author) =>
    author.given === '' ? author.family : `${author.given} ${author.family}`,
  );
  const last = names.at(-1);
  if (names.length < 2 || last === undefined) return names.join(', ');
  return `${names.slice(0, -1).join(', ')}${lastSeparator}${last}`;
}

/**
 * The pages of a work, as its styles write them.
 * @param reference - The work being written.
 * @param dash - What joins the two ends, an en dash in every style but BibTeX.
 * @returns One number for a journal that paginates by article number, the
 * range otherwise.
 */
export function pageRange(reference: ArticleReference, dash = '–'): string {
  const { firstPage, lastPage } = reference;
  if (firstPage === lastPage) return firstPage;
  return `${firstPage}${dash}${lastPage}`;
}

/**
 * An author with the family name first, `Vanderveen, J. R.`, or the name of an
 * organisation alone.
 * @param author - The author.
 * @returns The name, as a reference list writes it.
 */
export function nameFamilyFirst(author: ReferenceAuthor): string {
  return author.given === ''
    ? author.family
    : `${author.family}, ${author.given}`;
}
