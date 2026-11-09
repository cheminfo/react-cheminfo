/**
 * The figure a file opened on a site holds: the file itself, an SVG, or the
 * figure of a document of a site, the first SVG among its data.
 */

import type { ArchiveFile } from './backupFiles.ts';
import { isArchive } from './backupFiles.ts';
import type { SiteDocument } from './siteDocument.ts';
import { readSiteDocument } from './siteDocument.ts';

/**
 * The figure a file holds, as an SVG document.
 * @param file - The file: an SVG, or a document of a site.
 * @returns The SVG, or `undefined` for a document that holds none.
 */
export async function openedFigureSvg(file: Blob): Promise<string | undefined> {
  if (!(await isArchive(file))) return file.text();
  try {
    return documentFigure(await readSiteDocument(file))?.text();
  } catch {
    return undefined;
  }
}

/**
 * The figure among a document's data files: the first SVG.
 * @param document - The document.
 * @returns The file, or `undefined` when it holds no SVG.
 */
export function documentFigure(
  document: SiteDocument,
): ArchiveFile | undefined {
  return document.data.find(({ path }) => path.toLowerCase().endsWith('.svg'));
}
