/** One author of a reference, as the citation styles need them. */
export interface ReferenceAuthor {
  /** Initials or first name, e.g. `J. R.`; empty for an organisation. */
  given: string;
  /** Family name, e.g. `Vanderveen`, or the organisation's name. */
  family: string;
}

/** A journal article, with everything the citation formats need. */
export interface ArticleReference {
  /**
   * What the work is.
   * @default 'article'
   */
  kind?: 'article';
  authors: readonly ReferenceAuthor[];
  title: string;
  /** Full journal name, e.g. `Green Chemistry`. */
  journal: string;
  /** Abbreviated journal name, e.g. `Green Chem.`. */
  journalAbbreviation: string;
  year: number;
  volume: string;
  issue: string;
  firstPage: string;
  lastPage: string;
  doi: string;
  publisher: string;
}

/**
 * A dataset deposited in a repository, with everything the citation formats
 * need: it has no journal, no volume and no pages, and a repository instead.
 */
export interface DatasetReference {
  /** What the work is. */
  kind: 'dataset';
  authors: readonly ReferenceAuthor[];
  title: string;
  /** The repository holding it, e.g. `Zenodo`. */
  repository: string;
  year: number;
  /**
   * The version deposited, when the repository records one.
   * @default undefined
   */
  version?: string;
  doi: string;
}

/** A work the citation formats write: a journal article, or a dataset. */
export type Reference = ArticleReference | DatasetReference;

/**
 * Resolvable address of a reference.
 * @param reference - Reference to link to.
 * @returns The `https://doi.org/…` URL.
 */
export function doiUrl(reference: Reference): string {
  return `https://doi.org/${reference.doi}`;
}

/**
 * Where a work was published, as a menu names it beside its year: the
 * abbreviated journal of an article, the repository of a dataset.
 * @param reference - The work.
 * @returns The journal or the repository.
 */
export function referenceVenue(reference: Reference): string {
  return reference.kind === 'dataset'
    ? reference.repository
    : reference.journalAbbreviation;
}
