import type { SavedDocuments } from './createSavedDocuments.ts';
import { nameKey } from './createSavedDocuments.ts';
import type { DocumentFile } from './documentFile.ts';
import type { SaveOutcome } from './documentSaverTypes.ts';

/**
 * Keep a document in this browser under a name: in place of itself when it
 * was kept there before, else under the name asked for, numbered when another
 * document already goes by it — never over somebody else's work.
 * @param store - The site's documents in this browser.
 * @param wanted - The name asked for.
 * @param document - The document.
 * @param ownId - The saved document it is, if it is one.
 * @returns What was done, and the file the document is now kept in.
 */
export async function saveInBrowser<D>(
  store: SavedDocuments<D>,
  wanted: string,
  document: D,
  ownId: string | undefined,
): Promise<{ outcome: SaveOutcome; kept: DocumentFile<D> }> {
  const listed = await store.list();
  const taken = new Set<string>();
  for (const saved of listed) {
    if (saved.id !== ownId) taken.add(nameKey(saved.name));
  }
  const name = freeName(wanted, taken);
  const saved = await store.save(name, document);
  const kept = { name: saved.name, savedId: saved.id, saved: document };
  const outcome: SaveOutcome =
    name === wanted.trim()
      ? { kind: 'saved', target: 'browser', name: saved.name }
      : { kind: 'saved', target: 'browser', name: saved.name, wanted };
  return { outcome, kept };
}

// The name asked for, else the same followed by (2), (3)… as a copy would be.
function freeName(wanted: string, taken: ReadonlySet<string>): string {
  const name = wanted.trim();
  if (!taken.has(nameKey(name))) return name;
  for (let copy = 2; ; copy++) {
    const candidate = `${name} (${copy})`;
    if (!taken.has(nameKey(candidate))) return candidate;
  }
}
