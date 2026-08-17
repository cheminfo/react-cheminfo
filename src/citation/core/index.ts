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
export type { Reference, ReferenceAuthor } from './reference.ts';
export { doiUrl } from './reference.ts';
export type {
  CitationSegment,
  CitationStyle,
  CitationStyleId,
} from './segments.ts';
export { CITATION_STYLES, citationSegments } from './segments.ts';
export type { CitedWork } from './works.ts';
export {
  citationsFilename,
  citedReferences,
  formatCitations,
} from './works.ts';
