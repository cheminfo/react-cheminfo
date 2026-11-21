/**
 * A work the family cites — its own papers, the datasets behind them — as the
 * CSL JSON a style formats, under the key its DOI gives it, so it is the same
 * work as the copy Zotero or doi.org would hand over.
 */

import type {
  ArticleReference,
  DatasetReference,
  Reference,
  ReferenceAuthor,
} from '../../citation/core/reference.ts';

import type { CslItem, CslName } from './cslItems.ts';

/**
 * A reference as CSL JSON.
 * @param reference - An article or a dataset.
 * @returns The work, keyed `doi:<its DOI>`.
 */
export function referenceToCsl(reference: Reference): CslItem {
  return reference.kind === 'dataset'
    ? datasetItem(reference)
    : articleItem(reference);
}

function articleItem(reference: ArticleReference): CslItem {
  const { authors, title, journal, journalAbbreviation, year, volume } =
    reference;
  const { issue, firstPage, lastPage, doi, publisher } = reference;
  // An article number is one page, never a range from it to itself.
  const page =
    lastPage === '' || lastPage === firstPage
      ? firstPage
      : `${firstPage}-${lastPage}`;
  return {
    id: keyOf(doi),
    type: 'article-journal',
    title,
    'container-title': journal,
    'container-title-short': journalAbbreviation,
    author: authors.map(nameOf),
    issued: { 'date-parts': [[year]] },
    volume,
    ...(issue === undefined ? {} : { issue }),
    page,
    publisher,
    DOI: doi,
  };
}

function datasetItem(reference: DatasetReference): CslItem {
  const { authors, title, repository, year, version, doi } = reference;
  return {
    id: keyOf(doi),
    type: 'dataset',
    title,
    publisher: repository,
    author: authors.map(nameOf),
    issued: { 'date-parts': [[year]] },
    ...(version === undefined ? {} : { version }),
    DOI: doi,
  };
}

// An organisation has no given name, and is written whole.
function nameOf(author: ReferenceAuthor): CslName {
  return author.given === ''
    ? { literal: author.family }
    : { family: author.family, given: author.given };
}

function keyOf(doi: string): string {
  return `doi:${doi.toLowerCase()}`;
}
