import { downloadBlob } from '../../download/core/downloadBlob.ts';

import type { CitationDownload } from './formats.ts';
import type { Reference } from './reference.ts';
import { citationsFilename, formatCitations } from './works.ts';

/**
 * Save every reference a site asks for as the one file a reference manager
 * imports — both formats hold several entries, so a site asking for two works
 * hands out one file with both. The MIME type is the one Zotero, Mendeley and
 * EndNote recognise, so opening the saved file hands it to whichever of them is
 * installed.
 * @param references - References to save, in reading order.
 * @param download - File to write, from `CITATION_DOWNLOADS`.
 */
export function downloadCitations(
  references: readonly Reference[],
  download: CitationDownload,
): void {
  const content = formatCitations(references, download.format);
  downloadBlob(
    new Blob([content], { type: download.mimeType }),
    citationsFilename(references, download.extension),
  );
}

/**
 * Save one reference as the file a reference manager imports.
 * @param reference - Reference to save.
 * @param download - File to write, from `CITATION_DOWNLOADS`.
 */
export function downloadCitation(
  reference: Reference,
  download: CitationDownload,
): void {
  downloadCitations([reference], download);
}
