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

import { createSavedDocuments } from '../createSavedDocuments.ts';
import { isStoreRefusal, refusingWrite } from '../storeRefusal.ts';

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
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function readText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

async function refusalOf(promise: Promise<unknown>) {
  try {
    await promise;
    return 'saved';
  } catch (error) {
    return isStoreRefusal(error)
      ? [error.reason, error.message, (error.cause as Error | undefined)?.name]
      : 'a defect';
  }
}

function runOutOfRoom(): void {
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
    throw new DOMException('No room', 'QuotaExceededError');
  });
}

test('a store says why it refuses: a name it cannot take, a taken one, a browser that keeps nothing', async () => {
  const notes = createSavedDocuments<string>({
    name: 'refusals',
    read: readText,
  });
  const kept = await notes.save('Aspirin', 'a');
  await notes.save('Caffeine', 'c');
  const empty = await refusalOf(notes.save('  ', 'x'));
  const taken = await refusalOf(notes.rename(kept.id, 'caffeine'));
  vi.stubGlobal('indexedDB', {
    open: () => {
      throw new DOMException('The user denied permission', 'SecurityError');
    },
  });
  const elsewhere = createSavedDocuments<string>({
    name: 'refused',
    read: readText,
  });

  expect([
    empty,
    taken,
    await refusalOf(elsewhere.save('Benzene', 'b')),
  ]).toStrictEqual([
    ['name', 'A document needs a name.', undefined],
    ['taken', 'A document is already saved as Caffeine.', undefined],
    ['unavailable', 'The user denied permission', 'SecurityError'],
  ]);
});

test('a write the browser has no room for is a full refusal, anything else it throws passes on', async () => {
  const full = refusingWrite(() =>
    Promise.reject(new DOMException('No room', 'QuotaExceededError')),
  );
  const defect = new TypeError('not a document');

  expect([
    await refusalOf(full),
    await refusingWrite(() => Promise.reject(defect)).catch(
      (error: unknown) => error,
    ),
    await refusingWrite(() => Promise.resolve(7)),
  ]).toStrictEqual([['full', 'No room', 'QuotaExceededError'], defect, 7]);
});

test('an update the browser has no room for is a full refusal, and the saved document stays', async () => {
  const notes = createSavedDocuments<string>({
    name: 'full-update',
    read: readText,
  });
  const kept = await notes.save('Aspirin', 'a');
  runOutOfRoom();

  await expect(refusalOf(notes.update(kept.id, 'b'))).resolves.toStrictEqual([
    'full',
    'No room',
    'QuotaExceededError',
  ]);
  await expect(notes.named('Aspirin')).resolves.toStrictEqual(kept);
});

test('a restore the browser has no room for is a full refusal, and takes nothing back', async () => {
  const notes = createSavedDocuments<string>({
    name: 'full-restore',
    read: readText,
  });
  runOutOfRoom();

  await expect(
    refusalOf(
      notes.restore([{ id: 'b', name: 'Benzene', savedAt: 1, data: 'b' }]),
    ),
  ).resolves.toStrictEqual(['full', 'No room', 'QuotaExceededError']);
  await expect(notes.list()).resolves.toStrictEqual([]);
});
