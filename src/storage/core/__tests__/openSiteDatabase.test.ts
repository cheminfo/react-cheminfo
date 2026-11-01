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

import { openSiteDatabase } from '../openSiteDatabase.ts';

interface NotesSchema {
  notes: { key: string; value: { id: string; text: string } };
}

function notesDatabase(version = 1) {
  return openSiteDatabase<NotesSchema>({
    name: 'notes',
    version,
    upgrade: (db) => {
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
    },
  });
}

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
  vi.unstubAllGlobals();
});

test('the database is opened once, and what is written is read back', async () => {
  const database = notesDatabase();
  const db = await database.open();
  await db.put('notes', { id: 'a', text: 'benzene' });

  await expect(database.open()).resolves.toBe(db);
  await expect(db.get('notes', 'a')).resolves.toStrictEqual({
    id: 'a',
    text: 'benzene',
  });
  await expect(database.isAvailable()).resolves.toBe(true);

  database.close();
});

test('a browser refusing storage is reported, and the next open tries again', async () => {
  const database = notesDatabase();
  const refusing = {
    open: () => {
      throw new DOMException('The user denied permission', 'SecurityError');
    },
  };
  vi.stubGlobal('indexedDB', refusing);

  await expect(database.open()).rejects.toThrow('The user denied permission');
  await expect(database.isAvailable()).resolves.toBe(false);

  vi.stubGlobal('indexedDB', new IDBFactory());

  await expect(database.isAvailable()).resolves.toBe(true);

  database.close();
});

test('a newer version asked for elsewhere closes this connection, and open reconnects', async () => {
  const first = notesDatabase(1);
  const before = await first.open();
  await before.put('notes', { id: 'a', text: 'kept' });

  const second = notesDatabase(2);
  const upgraded = await second.open();

  expect(upgraded.version).toBe(2);
  await expect(upgraded.get('notes', 'a')).resolves.toStrictEqual({
    id: 'a',
    text: 'kept',
  });

  second.close();
});

test('an upgrade blocked by a connection that does not let go is refused', async () => {
  const stubborn = await new Promise<IDBDatabase>((resolve) => {
    const request = indexedDB.open('notes', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('notes', { keyPath: 'id' });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  await expect(notesDatabase(2).open()).rejects.toThrow(
    'notes is open at an older version in another tab: close it, then reload this one',
  );

  stubborn.close();
});
