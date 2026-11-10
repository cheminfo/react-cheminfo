import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBRequest,
  IDBTransaction,
} from 'fake-indexeddb';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createSavedDocuments, nameKey } from '../createSavedDocuments.ts';

beforeEach(() => {
  // idb recognises what it wraps by these classes, read off the globals.
  const classes = {
    IDBCursor,
    IDBCursorWithValue,
    IDBDatabase,
    IDBIndex,
    IDBKeyRange,
    IDBObjectStore,
    IDBRequest,
    IDBTransaction,
  };
  for (const [name, value] of Object.entries(classes)) {
    vi.stubGlobal(name, value);
  }
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(1_000);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

interface Note {
  text: string;
}

function readNote(value: unknown): Note | undefined {
  return typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof value.text === 'string'
    ? { text: value.text }
    : undefined;
}

function openNotes() {
  return createSavedDocuments<Note>({ name: 'notes-test', read: readNote });
}

test('a document saved under a name is listed by it, the latest first', async () => {
  const notes = openNotes();
  await notes.save('Aspirin', { text: 'acetylsalicylic acid' });
  vi.setSystemTime(2_000);
  await notes.save('  Caffeine ', { text: 'a purine' });

  const listed = await notes.list();

  expect(
    listed.map(({ name, savedAt, data }) => ({ name, savedAt, data })),
  ).toStrictEqual([
    { name: 'Caffeine', savedAt: 2_000, data: { text: 'a purine' } },
    { name: 'Aspirin', savedAt: 1_000, data: { text: 'acetylsalicylic acid' } },
  ]);
});

test('saving under a name already taken replaces that document and keeps its id', async () => {
  const notes = openNotes();
  const first = await notes.save('Aspirin', { text: 'first' });
  vi.setSystemTime(5_000);
  const second = await notes.save('aspirin', { text: 'second' });

  expect(second.id).toBe(first.id);
  await expect(notes.list()).resolves.toStrictEqual([
    { id: first.id, name: 'aspirin', savedAt: 5_000, data: { text: 'second' } },
  ]);
});

test('a rename keeps the document, and refuses a name another one holds', async () => {
  const notes = openNotes();
  const aspirin = await notes.save('Aspirin', { text: 'a' });
  await notes.save('Caffeine', { text: 'c' });

  await notes.rename(aspirin.id, 'Acetylsalicylic acid');

  const renamed = await notes.named('acetylsalicylic ACID');

  expect(renamed?.data).toStrictEqual({ text: 'a' });
  await expect(notes.rename(aspirin.id, 'CAFFEINE')).rejects.toThrow(
    'A document is already saved as Caffeine.',
  );
});

test('an empty or overlong name is refused', async () => {
  const notes = openNotes();

  await expect(notes.save(' '.repeat(3), { text: '' })).rejects.toThrow(
    'A document needs a name.',
  );
  await expect(notes.save('x'.repeat(121), { text: '' })).rejects.toThrow(
    'A name is at most 120 characters long; this one has 121.',
  );
});

test('a removed document is gone, and every change is told to the listeners', async () => {
  const notes = openNotes();
  const listener = vi.fn();
  const stop = notes.subscribe(listener);
  const aspirin = await notes.save('Aspirin', { text: 'a' });
  await notes.rename(aspirin.id, 'ASA');
  await notes.remove(aspirin.id);
  stop();
  await notes.save('Caffeine', { text: 'c' });

  const listed = await notes.list();

  expect(listener).toHaveBeenCalledTimes(3);
  expect(listed.map(({ name }) => name)).toStrictEqual(['Caffeine']);
});

test('a row the site cannot read is left out of the list', async () => {
  const notes = openNotes();
  await notes.save('Aspirin', { text: 'a' });
  const strict = createSavedDocuments<Note>({
    name: 'notes-test',
    read: () => undefined,
  });

  await expect(strict.list()).resolves.toStrictEqual([]);
  expect(nameKey('  Aspirin ')).toBe('aspirin');
});
