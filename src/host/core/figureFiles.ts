/**
 * Telling a dropped or picked file that is a figure of the site from the data
 * the site reads, the moment it arrives: an SVG, or a document of the site.
 */

import {
  readSiteDocument,
  siteDocumentExtension,
} from '../../storage/core/siteDocument.ts';

/**
 * Whether a file may be a figure of one of the sites, judged by its name: an
 * SVG, or a document named for one of them.
 * @param file - The file, or its name.
 * @param sites - The sites whose documents it may be, e.g. `['nmr', 'nmrium']`.
 * @returns True for `.svg` and `.<site>.zip`.
 */
export function mayBeFigureFile(
  file: Pick<File, 'name'>,
  sites: readonly string[],
): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.svg')) return true;
  for (const site of sites) {
    if (name.endsWith(siteDocumentExtension(site))) return true;
  }
  return false;
}

/**
 * The figure among files dropped or picked: the first SVG, or the first zip
 * named for one of the sites that is a document of the family. A zip of
 * another program carries no manifest, and goes to the site's reader with the
 * rest.
 * @param files - The files.
 * @param sites - The sites whose documents a figure may come in.
 * @returns The figure, or `undefined` when none of them is one.
 */
export function findFigureFile(
  files: readonly File[],
  sites: readonly string[],
): Promise<File | undefined> {
  return figureFrom(files, sites, 0);
}

// One file after the other: the first figure found is opened, so the rest are
// never read.
async function figureFrom(
  files: readonly File[],
  sites: readonly string[],
  index: number,
): Promise<File | undefined> {
  const file = files[index];
  if (file === undefined) return undefined;
  if (mayBeFigureFile(file, sites)) {
    if (file.name.toLowerCase().endsWith('.svg')) return file;
    if (await isFamilyDocument(file)) return file;
  }
  return figureFrom(files, sites, index + 1);
}

async function isFamilyDocument(file: File): Promise<boolean> {
  try {
    await readSiteDocument(file);
    return true;
  } catch {
    return false;
  }
}
