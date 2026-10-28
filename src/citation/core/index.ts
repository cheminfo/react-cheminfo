export { copyCitation, copyCitations } from './clipboard.ts';
export { downloadCitation, downloadCitations } from './download.ts';
export type {
  CitationDownload,
  CitationFormat,
  CitationFormatId,
} from './formats.ts';
export {
  CITATION_DOWNLOADS,
  CITATION_FORMATS,
  DEFAULT_CITATION_STYLE,
  citationFilename,
  formatCitation,
} from './formats.ts';
export { GFN2_XTB_PAPER, GFN2_XTB_WORK } from './gfn2Paper.ts';
export {
  OPEN_CHEMISTRY_PAPER,
  OPEN_CHEMISTRY_WORK,
} from './openChemistryPaper.ts';
export { OPENCHEMLIB_PAPER, OPENCHEMLIB_WORK } from './openchemlibPaper.ts';
export { PLATFORM_PAPER, PLATFORM_WORK } from './platformPaper.ts';
export type {
  ArticleReference,
  DatasetReference,
  Reference,
  ReferenceAuthor,
} from './reference.ts';
export { doiUrl, referenceVenue } from './reference.ts';
export type {
  CitationSegment,
  CitationStyle,
  CitationStyleId,
} from './segments.ts';
export { CITATION_STYLES, citationSegments } from './segments.ts';
export { TEACHING_PAPER, TEACHING_WORK } from './teachingPaper.ts';
export type { CitedWork } from './works.ts';
export {
  citationsFilename,
  citedReferences,
  formatCitations,
} from './works.ts';
