import { afterEach, expect, test, vi } from 'vitest';

import {
  readStorageEntry,
  removeStorageEntry,
  versionedStorageKey,
  writeStorageEntry,
} from '../storageEntry.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the version is appended to the key', () => {
  expect(versionedStorageKey('smiles:exercises', 3)).toBe(
    'smiles:exercises:v3',
  );
});

test('an entry reads back as whatever JSON was written, arrays included', () => {
  const entries = stubStorage();

  writeStorageEntry('elucidation:history:v1', [{ id: 'a' }, { id: 'b' }]);

  expect(entries.get('elucidation:history:v1')).toBe('[{"id":"a"},{"id":"b"}]');
  expect(readStorageEntry('elucidation:history:v1')).toStrictEqual([
    { id: 'a' },
    { id: 'b' },
  ]);
});

test('a missing entry, corrupt JSON and a blocked store all read as nothing', () => {
  stubStorage({ 'site:corrupt:v1': '{nope' });

  expect(readStorageEntry('site:missing:v1')).toBeUndefined();
  expect(readStorageEntry('site:corrupt:v1')).toBeUndefined();

  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('blocked');
    },
  });

  expect(readStorageEntry('site:corrupt:v1')).toBeUndefined();
});

test('a value that cannot be serialised is not written and does not throw', () => {
  const entries = stubStorage();
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;

  expect(() => {
    writeStorageEntry('site:cyclic:v1', cyclic);
  }).not.toThrow();
  expect(entries.size).toBe(0);
});

test('only a full store reaches onQuotaExceeded, and a throwing callback is contained', () => {
  const seen: string[] = [];
  stubStorage({}, 'NS_ERROR_DOM_QUOTA_REACHED');

  expect(() => {
    writeStorageEntry('site:a:v1', { a: 1 }, (error) => {
      seen.push((error as Error).name);
      throw new Error('the reporter failed too');
    });
  }).not.toThrow();

  stubStorage({}, 'SecurityError');
  writeStorageEntry('site:a:v1', { a: 1 }, (error) => {
    seen.push((error as Error).name);
  });

  expect(seen).toStrictEqual(['NS_ERROR_DOM_QUOTA_REACHED']);
});

test('removing an entry forgets it, and an absent store is not an error', () => {
  const entries = stubStorage({ 'site:a:v1': '1', 'site:b:v1': '2' });

  removeStorageEntry('site:a:v1');

  expect([...entries.keys()]).toStrictEqual(['site:b:v1']);

  vi.stubGlobal('localStorage', undefined);

  expect(() => {
    removeStorageEntry('site:b:v1');
  }).not.toThrow();
});

function stubStorage(
  initial: Record<string, string> = {},
  failWrites?: string,
): Map<string, string> {
  const entries = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failWrites !== undefined) {
        const error = new Error('write refused');
        error.name = failWrites;
        throw error;
      }
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  });
  return entries;
}
