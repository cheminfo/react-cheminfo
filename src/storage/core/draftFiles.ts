import type { DraftFile } from './createDraftStore.ts';
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
