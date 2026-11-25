/**
 * The manifest of a saved document of the family (`siteDocument.ts`): the
 * family's envelope at the root of a ZIP, with the paths of the files it
 * holds. It is found wherever the archive keeps it — the shallowest
 * `manifest.json` that reads as one —, so a document unzipped and zipped again
 * inside a folder still opens. {@link readArchiveManifest} reads it from the
 * archive's directory and that one entry, so asking whether a ZIP is a
 * document never inflates the images of one that is not.
 */

import {
  SOURCE_FORMAT,
  SOURCE_VERSION,
} from '../../download/core/sourceEnvelope.ts';
import { isPlainRecord } from '../../state/core/mergeStored.ts';

import { ZIP_OPTIONS, isArchive, loadZip } from './backupFiles.ts';

/** The name of a document's manifest. */
export const MANIFEST = 'manifest.json';

/** The manifest at the root of a document. */
export interface DocumentManifest {
  /** The family's envelope format. */
  format: typeof SOURCE_FORMAT;
  /** Its version. */
  version: typeof SOURCE_VERSION;
  /** The site that saved it. */
  site: string;
  /**
   * The build that saved it.
   * @default unnamed
   */
  generator?: string;
  /** When it was saved, ISO 8601; `''` when not said. */
  savedAt: string;
  /** The paths of its data files. */
  data: string[];
  /**
   * The path of its view.
   * @default none
   */
  view?: string;
  /**
   * The path of its preferences.
   * @default none
   */
  preferences?: string;
  /**
   * The paths of the files it carries beside, inside `files/`.
   * @default none
   */
  attachments?: string[];
}

/**
 * The manifest a parsed `manifest.json` holds.
 * @param value - The parsed JSON.
 * @returns The manifest, or `undefined` when it is not the family's.
 */
export function readManifest(value: unknown): DocumentManifest | undefined {
  if (
    !isPlainRecord(value) ||
    value.format !== SOURCE_FORMAT ||
    value.version !== SOURCE_VERSION
  ) {
    return undefined;
  }
  const { site, generator, savedAt, data, view, preferences } = value;
  if (typeof site !== 'string' || !Array.isArray(data)) return undefined;
  return {
    format: SOURCE_FORMAT,
    version: SOURCE_VERSION,
    site,
    ...(typeof generator === 'string' ? { generator } : {}),
    savedAt: typeof savedAt === 'string' ? savedAt : '',
    data: data.filter((path): path is string => typeof path === 'string'),
    ...(typeof view === 'string' ? { view } : {}),
    ...(typeof preferences === 'string' ? { preferences } : {}),
  };
}

/**
 * The entries of an archive that may be its manifest, the shallowest first.
 * @param entries - The archive's entries, by path.
 * @returns The ones named `manifest.json`, at the root or in a folder.
 */
export function manifestCandidates<TEntry extends { path: string }>(
  entries: readonly TEntry[],
): TEntry[] {
  return entries
    .filter(({ path }) => path === MANIFEST || path.endsWith(`/${MANIFEST}`))
    .toSorted((a, b) => a.path.length - b.path.length);
}

/**
 * The text of an entry as JSON, or `undefined` when it is no JSON at all: a
 * `manifest.json` of somebody else's archive is not a document's.
 * @param text - The entry's text.
 * @returns The parsed value.
 * @throws {Error} What parsing threw, when it is not a syntax error.
 */
export function parsedManifestText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) return undefined;
    throw error;
  }
}

/**
 * The manifest of the document a file is, read from the archive's directory
 * and its manifest alone.
 * @param file - The file: any file, a ZIP or not.
 * @returns The manifest, or `undefined` when the file is no ZIP or no
 *   document of the family.
 * @throws {Error} When the file starts like a ZIP but its directory cannot be read.
 */
export async function readArchiveManifest(
  file: Blob,
): Promise<DocumentManifest | undefined> {
  if (!(await isArchive(file))) return undefined;
  const { BlobReader, TextWriter, ZipReader } = await loadZip();
  const reader = new ZipReader(new BlobReader(file), ZIP_OPTIONS);
  try {
    const entries = await reader.getEntries();
    const files = [];
    for (const entry of entries) {
      if (!entry.directory) files.push({ path: entry.filename, entry });
    }
    for (const { entry } of manifestCandidates(files)) {
      // eslint-disable-next-line no-await-in-loop -- the shallowest manifest that reads wins, so they are read in order
      const text = await entry.getData(new TextWriter());
      const manifest = readManifest(parsedManifestText(text));
      if (manifest !== undefined) return manifest;
    }
    return undefined;
  } finally {
    await reader.close();
  }
}
