import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';

import type { ArchiveEntry } from './backupFiles.ts';
import { backupFileName, readArchive, writeArchive } from './backupFiles.ts';
import type { BackupManifest } from './backupManifest.ts';
import {
  BACKUP_MANIFEST,
  readBackupManifest,
  readJson,
} from './backupManifest.ts';
import type { Draft, DraftStore } from './createDraftStore.ts';
import type { SavedDocuments } from './createSavedDocuments.ts';
import type { DraftSession } from './draftSessionTypes.ts';

/** The drafts a site keeps several of, for a backup to carry. */
export interface BackupDrafts<D> {
  /** Where they are kept. */
  store: DraftStore<D>;
  /** The session keeping the one on screen. */
  session: DraftSession;
  /** The draft on screen, or null. */
  current: () => string | null;
}

/** What a site backs up. */
export interface SiteBackupOptions<D> {
  /** Names the archive, `<stem>-backup-<date>.zip`, e.g. `write-cheminfo`. */
  stem: string;
  /** Who writes it, kept in its table of contents, e.g. `write.cheminfo.org`. */
  generator: string;
  /** The documents saved in this browser under a name. */
  documents: SavedDocuments<D>;
  /**
   * The drafts, for a site that keeps several of them.
   * @default undefined — the backup holds the saved documents alone
   */
  drafts?: BackupDrafts<D>;
}

/** How many of each came back from a backup. */
export interface RestoredBackup {
  /** The documents saved under a name. */
  documents: number;
  /** The drafts. */
  drafts: number;
  /** The drafts open in another tab, which came back as copies of their own. */
  copies: number;
}

/** A site's backup: everything it keeps in this browser, as one file. */
export interface SiteBackup {
  /**
   * The archive.
   * @returns It, or undefined while nothing is kept.
   */
  write: () => Promise<Blob | undefined>;
  /**
   * Take everything in an archive back.
   * @returns How many came back; undefined when the file is a ZIP archive
   * but no backup.
   * @throws {Error} When the file is not a ZIP archive.
   */
  read: (file: Blob) => Promise<RestoredBackup | undefined>;
  /** The name the archive is downloaded under, dated today. */
  fileName: () => string;
}

/**
 * Everything a site keeps in this browser — the documents saved under a name
 * and, where it keeps several, its drafts — out as one ZIP archive, and the
 * same archive back in. Each document is the JSON the site stores, read again
 * by the site's own reader on the way back, so a backup taken by an older
 * build cannot break the page. Restoring twice changes nothing: a document
 * replaces the one of its name, a draft the one of its identifier.
 * @param options - See {@link SiteBackupOptions}.
 * @returns See {@link SiteBackup}.
 */
export function createSiteBackup<D>(options: SiteBackupOptions<D>): SiteBackup {
  const { stem, generator, documents, drafts } = options;
  return {
    write: async () => {
      if (drafts) await drafts.session.flush();
      const saved = (await documents.isAvailable())
        ? await documents.list()
        : [];
      const kept =
        drafts && (await drafts.store.isAvailable())
          ? await drafts.store.list()
          : [];
      if (saved.length === 0 && kept.length === 0) return undefined;
      const manifest: BackupManifest = {
        generator,
        version: 1,
        exportedAt: Date.now(),
        documents: [],
        drafts: [],
      };
      const entries: ArchiveEntry[] = [];
      for (const [index, document] of saved.entries()) {
        const path = `documents/${numbered(index, document.name, 'document')}`;
        entries.push({ path, content: JSON.stringify(document.data) });
        manifest.documents.push({
          id: document.id,
          name: document.name,
          savedAt: document.savedAt,
          path,
        });
      }
      for (const [index, draft] of kept.entries()) {
        const name = draft.file?.name;
        const path = `drafts/${numbered(index, name ?? '', 'draft')}`;
        entries.push({ path, content: JSON.stringify(draft.document) });
        manifest.drafts.push({
          id: draft.id,
          ...(name ? { name } : {}),
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          path,
        });
      }
      entries.unshift({
        path: BACKUP_MANIFEST,
        content: JSON.stringify(manifest, null, 2),
      });
      return writeArchive(entries);
    },
    read: async (file) => {
      const files = await readArchive(file);
      const contents = readBackupManifest(files);
      if (!contents) return undefined;
      const { manifest, folder } = contents;
      const byPath = new Map(files.map((entry) => [entry.path, entry]));
      const json = (path: string) => readJson(byPath.get(folder + path));
      const restored = await documents.restore(
        manifest.documents.map((entry) => ({
          id: entry.id,
          name: entry.name,
          savedAt: entry.savedAt,
          data: json(entry.path),
        })),
      );
      const result: RestoredBackup = {
        documents: restored,
        drafts: 0,
        copies: 0,
      };
      if (!drafts || manifest.drafts.length === 0) return result;
      const incoming: Array<Draft<D>> = [];
      for (const entry of manifest.drafts) {
        const document = json(entry.path);
        if (document === undefined) continue;
        incoming.push({
          id: entry.id,
          document: document as D,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          // The file it was kept in is on another computer: Save asks again.
          ...(entry.name ? { file: { name: entry.name, modified: true } } : {}),
        });
      }
      return { ...result, ...(await restoreDrafts(drafts, incoming)) };
    },
    fileName: () => backupFileName(stem, 'zip'),
  };
}

async function restoreDrafts<D>(
  drafts: BackupDrafts<D>,
  incoming: Array<Draft<D>>,
): Promise<{ drafts: number; copies: number }> {
  const { store, session } = drafts;
  if (incoming.length === 0) return { drafts: 0, copies: 0 };
  const elsewhere = await session.heldElsewhere();
  const current = drafts.current();
  let copies = 0;
  const restored = incoming.map((draft) => {
    if (!elsewhere.has(draft.id)) return draft;
    copies++;
    return { ...draft, id: crypto.randomUUID() };
  });
  const replacesCurrent =
    current !== null && restored.some((draft) => draft.id === current);
  if (replacesCurrent) session.discardPending();
  else await session.flush();
  await store.putMany(restored);
  session.changed();
  if (replacesCurrent && current !== null) {
    await session.open(current, { force: true });
  }
  return { drafts: restored.length, copies };
}

function numbered(index: number, name: string, fallback: string): string {
  const stem = sanitizeFileName(name.replace(/\.[^.]+$/, ''), fallback);
  return `${String(index + 1).padStart(3, '0')}-${stem}.json`;
}
