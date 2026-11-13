import equal from 'fast-deep-equal/es6/index.js';

import type { DraftFile, DraftStore } from './createDraftStore.ts';
import type { DocumentFile } from './documentFile.ts';

/**
 * What a draft keeps of the file its document is kept in.
 * @param file - The file.
 * @param document - The document on screen.
 * @param keepSaved - Whether the saved document is kept beside it.
 * @returns The draft's file: the saved document only when it differs.
 */
export function draftFile<D>(
  file: DocumentFile<D>,
  document: D,
  keepSaved: boolean,
): DraftFile<D> {
  const modified = file.saved !== document;
  const kept: DraftFile<D> = { name: file.name, modified };
  if (file.handle) kept.handle = file.handle;
  if (file.savedId) kept.savedId = file.savedId;
  if (modified && keepSaved) kept.saved = file.saved;
  if (file.parts) kept.parts = file.parts;
  return kept;
}

/**
 * The file a document is kept in, read back from its draft.
 * @param file - The draft's file.
 * @param document - The draft's document.
 * @param empty - An empty document, for a file whose content was not kept.
 * @returns The file, or null for a draft kept in none.
 */
export function documentFile<D>(
  file: DraftFile<D> | undefined,
  document: D,
  empty: () => D,
): DocumentFile<D> | null {
  if (!file) return null;
  const saved = file.modified ? (file.saved ?? empty()) : document;
  return {
    name: file.name,
    ...(file.handle ? { handle: file.handle } : {}),
    ...(file.savedId ? { savedId: file.savedId } : {}),
    saved,
    ...(file.parts ? { parts: file.parts } : {}),
  };
}

/**
 * Run once the page has painted what it was given.
 * @param callback - What to run.
 */
export function afterPaint(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/** How many drafts a site keeps unless it says otherwise. */
export const DRAFT_LIMIT = 20;

/**
 * Whether a draft holds a saved document left as it was saved.
 * @param draft - The draft.
 * @param draft.file - The file it is kept in.
 * @param draft.file.modified - Whether the document changed since it was saved.
 * @returns True when the file already holds what the draft does.
 */
export function isSavedAsIs(draft: { file?: { modified: boolean } }): boolean {
  return draft.file !== undefined && !draft.file.modified;
}

/**
 * The drafts to forget once there are more than a site keeps: none a tab
 * holds; a saved document left unchanged first, since its file holds it
 * already, then the oldest of the work kept nowhere else.
 * @param drafts - Every draft, the most recently changed first.
 * @param held - The drafts a tab holds.
 * @param limit - How many are kept.
 * @returns The identifiers to forget.
 */
export function draftsToForget(
  drafts: ReadonlyArray<{
    id: string;
    file?: { modified: boolean };
  }>,
  held: ReadonlySet<string>,
  limit: number,
): string[] {
  const extra = drafts.length - limit;
  if (extra <= 0) return [];
  const oldestFirst = drafts
    .filter((draft) => !held.has(draft.id))
    .toReversed();
  return [
    ...oldestFirst.filter((draft) => isSavedAsIs(draft)),
    ...oldestFirst.filter((draft) => !isSavedAsIs(draft)),
  ]
    .slice(0, extra)
    .map((draft) => draft.id);
}

/**
 * The drafts holding the same document as another, under the same file name,
 * which are forgotten so a document is never kept twice. A draft that stays —
 * the one just written, one a tab holds — keeps its document; otherwise the
 * most recent of the copies does.
 * @param drafts - Every draft, the most recently changed first.
 * @param stays - The drafts that are never forgotten.
 * @returns The identifiers to forget.
 */
export function duplicateDrafts(
  drafts: ReadonlyArray<{
    id: string;
    document: unknown;
    file?: { name: string };
  }>,
  stays: ReadonlySet<string>,
): string[] {
  const kept = drafts.filter((draft) => stays.has(draft.id));
  const forgotten: string[] = [];
  for (const draft of drafts) {
    if (stays.has(draft.id)) continue;
    const copy = kept.some(
      (other) =>
        other.file?.name === draft.file?.name &&
        equal(other.document, draft.document),
    );
    if (copy) forgotten.push(draft.id);
    else kept.push(draft);
  }
  return forgotten;
}

/**
 * Forget the drafts a site no longer needs: a second copy of a document, and
 * past the limit the oldest, never one in `stays`.
 * @param store - Where the drafts are.
 * @param stays - The drafts that are never forgotten: the one on screen, and
 * those a tab holds.
 * @param limit - How many are kept.
 * @returns Whether any was forgotten.
 */
export async function tidyDrafts<D>(
  store: Pick<DraftStore<D>, 'list' | 'delete'>,
  stays: ReadonlySet<string>,
  limit: number,
): Promise<boolean> {
  const drafts = await store.list();
  const copies = new Set(duplicateDrafts(drafts, stays));
  const left = drafts.filter((draft) => !copies.has(draft.id));
  const forgotten = [
    ...copies,
    ...(Number.isFinite(limit) ? draftsToForget(left, stays, limit) : []),
  ];
  await Promise.all(forgotten.map((id) => store.delete(id)));
  return forgotten.length > 0;
}

/** A document a draft session keeps, with its draft and its file. */
export interface KeptDraft<D> {
  /** The draft. */
  id: string;
  /** The document. */
  document: D;
  /** The file it is kept in. */
  file: DocumentFile<D> | null;
  /** When the draft was made, in epoch milliseconds. */
  createdAt: number;
}
