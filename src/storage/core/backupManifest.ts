import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { ArchiveFile } from './backupFiles.ts';

/** The name a backup's table of contents is written under. */
export const BACKUP_MANIFEST = 'manifest.json';

/** A backup's table of contents: what each file of the archive is. */
export interface BackupManifest {
  /** The site that wrote it. */
  generator: string;
  /** The version of this table of contents. */
  version: number;
  /** When the backup was taken, in milliseconds since 1970. */
  exportedAt: number;
  /** The documents saved under a name. */
  documents: Array<{ id: string; name: string; savedAt: number; path: string }>;
  /** The drafts; `name` is the file a draft was kept in. */
  drafts: Array<{
    id: string;
    name?: string;
    createdAt: number;
    updatedAt: number;
    path: string;
  }>;
}

/**
 * The table of contents nearest the top of an archive, in any folder, so a
 * backup unzipped and zipped again inside a folder still restores.
 * @param files - The files of the archive.
 * @returns It, with the folder its paths start from; undefined when the
 * archive has none that reads.
 */
export function readBackupManifest(
  files: readonly ArchiveFile[],
): { manifest: BackupManifest; folder: string } | undefined {
  let found: ArchiveFile | undefined;
  for (const file of files) {
    const named =
      file.path === BACKUP_MANIFEST ||
      file.path.endsWith(`/${BACKUP_MANIFEST}`);
    if (named && (!found || file.path.length < found.path.length)) {
      found = file;
    }
  }
  if (!found) return undefined;
  const manifest = manifestFrom(readJson(found));
  return manifest
    ? { manifest, folder: found.path.slice(0, -BACKUP_MANIFEST.length) }
    : undefined;
}

/**
 * A file of the archive read as JSON.
 * @param file - The file, or nothing.
 * @returns What it holds; undefined when it is missing or not JSON.
 */
export function readJson(file: ArchiveFile | undefined): unknown {
  if (!file) return undefined;
  try {
    return JSON.parse(file.text());
  } catch {
    return undefined;
  }
}

function manifestFrom(value: unknown): BackupManifest | undefined {
  if (!isPlainRecord(value)) return undefined;
  const documents = Array.isArray(value.documents) ? value.documents : [];
  const drafts = Array.isArray(value.drafts) ? value.drafts : [];
  return {
    generator: typeof value.generator === 'string' ? value.generator : '',
    version: typeof value.version === 'number' ? value.version : 1,
    exportedAt: finiteOr(value.exportedAt),
    documents: documents.flatMap((entry: unknown) =>
      isPlainRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.name === 'string' &&
      typeof entry.path === 'string'
        ? [
            {
              id: entry.id,
              name: entry.name,
              path: entry.path,
              savedAt: finiteOr(entry.savedAt),
            },
          ]
        : [],
    ),
    drafts: drafts.flatMap((entry: unknown) =>
      isPlainRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.path === 'string'
        ? [
            {
              id: entry.id,
              ...(typeof entry.name === 'string' ? { name: entry.name } : {}),
              path: entry.path,
              createdAt: finiteOr(entry.createdAt),
              updatedAt: finiteOr(entry.updatedAt),
            },
          ]
        : [],
    ),
  };
}

function finiteOr(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : Date.now();
}
