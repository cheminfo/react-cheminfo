/**
 * The saved documents of a site, as the browser holds them: whether it holds
 * any at all, a rename of a document another tab removed, and a row written by
 * something else than this store.
 */

import { openDB } from 'idb';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createSavedDocuments } from '../createSavedDocuments.ts';

import { stubIndexedDB } from './fakeIndexedDB.ts';

beforeEach(() => {
  stubIndexedDB();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function openNotes() {
  return createSavedDocuments<string>({
    name: 'rows-test',
    read: (value) => (typeof value === 'string' ? value : undefined),
  });
}

test('a browser with IndexedDB keeps documents, one refusing it keeps none', async () => {
  await expect(openNotes().isAvailable()).resolves.toBe(true);

  vi.stubGlobal('indexedDB', {
    open: () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    },
  });

  await expect(openNotes().isAvailable()).resolves.toBe(false);
});

test('renaming a document another tab removed changes nothing and tells nobody', async () => {
  const notes = openNotes();
  const aspirin = await notes.save('Aspirin', 'CC(=O)Oc1ccccc1C(=O)O');
  await notes.remove(aspirin.id);
  const listener = vi.fn();
  notes.subscribe(listener);

  await notes.rename(aspirin.id, 'Acetylsalicylic acid');

  expect(listener).not.toHaveBeenCalled();
  await expect(notes.list()).resolves.toStrictEqual([]);
});

test('a row lacking a name or a date is left out of the list', async () => {
  const notes = openNotes();
  const aspirin = await notes.save('Aspirin', 'CC(=O)Oc1ccccc1C(=O)O');
  const db = await openDB('rows-test-documents', 1);
  await db.put('documents', { id: 'n', name: 7, savedAt: 1, data: 'C' });
  await db.put('documents', { id: 'd', name: 'Methane', data: 'C' });
  db.close();

  await expect(notes.list()).resolves.toStrictEqual([aspirin]);
});
