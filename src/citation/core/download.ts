import { downloadBlob } from '../../download/core/downloadBlob.ts';

import type { CitationDownload } from './formats.ts';
import { citationFilename, formatCitation } from './formats.ts';
import type { Reference } from './reference.ts';

/**
 * Save the reference as the file a reference manager imports. The MIME type
 * is the one Zotero, Mendeley and EndNote recognise, so opening the saved
 * file hands it to whichever of them is installed.
 * @param reference - Reference to save.
 * @param download - File to write, from `CITATION_DOWNLOADS`.
 */
export function downloadCitation(
  reference: Reference,
  download: CitationDownload,
): void {
  const content = formatCitation(reference, download.format);
  downloadBlob(
    new Blob([content], { type: download.mimeType }),
    citationFilename(reference, download.extension),
  );
}
