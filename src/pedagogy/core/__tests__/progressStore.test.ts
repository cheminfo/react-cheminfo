import { afterEach, expect, test } from 'vitest';

import type { ProgressRecords } from '../progress.ts';
import { emptyProgress, localStorageProgressStore } from '../progress.ts';

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage');
});

test('the store writes one namespaced and versioned entry', () => {
  const entries = installStorage();
  const store = localStorageProgressStore({
    key: 'smiles:exercises',
    version: 2,
    defaults: emptyProgress(),
  });
  void store.save({
    w1: { ...emptyProgress(), status: 'solved', answer: 'CCO' },
  });

  expect([...entries.keys()]).toStrictEqual(['smiles:exercises:v2']);
  expect(store.load()).toStrictEqual({
    w1: {
      status: 'solved',
      answer: 'CCO',
      hintsRevealed: 0,
      showSolution: false,
    },
  });
  expect(store.name).toBe('this browser');
});

test('the version defaults to 1', () => {
  const entries = installStorage();
  void localStorageProgressStore({ key: 'tex:exercises' }).save({});

  expect([...entries.keys()]).toStrictEqual(['tex:exercises:v1']);
});

test('a stored record is read over the defaults, and nonsense is dropped', () => {
  const entries = installStorage();
  entries.set(
    'tex:exercises:v1',
    JSON.stringify({ 'x-squared': { answer: 'x^2' }, broken: null }),
  );
  const store = localStorageProgressStore({
    key: 'tex:exercises',
    defaults: emptyProgress(),
  });

  expect(store.load()).toStrictEqual({
    'x-squared': { ...emptyProgress(), answer: 'x^2' },
  });
});

test('without defaults every entry shaped like a record is kept as stored', () => {
  const entries = installStorage();
  entries.set(
    'surge:exercises:v1',
    JSON.stringify({ C5H12: { found: ['a'] }, broken: 7 }),
  );

  expect(
    localStorageProgressStore<{ found: string[] }>({
      key: 'surge:exercises',
    }).load(),
  ).toStrictEqual({ C5H12: { found: ['a'] } });
});

test('a corrupt entry reads as nothing stored', () => {
  const entries = installStorage();
  entries.set('tex:exercises:v1', 'not json at all');

  expect(
    localStorageProgressStore({ key: 'tex:exercises' }).load(),
  ).toStrictEqual({});

  entries.set('tex:exercises:v1', '[1,2,3]');

  expect(
    localStorageProgressStore({ key: 'tex:exercises' }).load(),
  ).toStrictEqual({});
});

test('a page with no storage at all still loads and saves', () => {
  const store = localStorageProgressStore({ key: 'tex:exercises' });

  expect(store.load()).toStrictEqual({});
  expect(() => store.save({})).not.toThrow();
});

test('a full quota loses the work rather than the page', () => {
  installStorage(() => {
    throw new Error('QuotaExceededError');
  });
  const store = localStorageProgressStore({ key: 'tex:exercises' });

  expect(() => store.save({ w1: emptyProgress() })).not.toThrow();
});

test('a full quota is reported, so the page can say the work is not kept', () => {
  installStorage(() => {
    const error = new Error('write refused');
    error.name = 'QuotaExceededError';
    throw error;
  });
  const seen: string[] = [];
  const store = localStorageProgressStore({
    key: 'tex:exercises',
    onQuotaExceeded: (error) => {
      seen.push((error as Error).name);
    },
  });

  void store.save({ w1: emptyProgress() });

  expect(seen).toStrictEqual(['QuotaExceededError']);
});

test('a stored record keeps the fields its defaults do not name, and a nested one field by field', () => {
  const entries = installStorage();
  entries.set(
    'surge:exercises:v1',
    JSON.stringify({
      C5H12: { found: ['CCCCC'], drawings: { a: 'x' }, retired: true },
      C4H10: { found: 'CCCC', gaveUp: 'yes' },
    }),
  );
  const defaults = { found: [] as string[], drawings: {}, gaveUp: false };
  const records = localStorageProgressStore({
    key: 'surge:exercises',
    defaults,
  }).load() as ProgressRecords<typeof defaults>;

  expect(records).toStrictEqual({
    C5H12: {
      found: ['CCCCC'],
      drawings: { a: 'x' },
      gaveUp: false,
      retired: true,
    },
    C4H10: { found: [], drawings: {}, gaveUp: false },
  });

  records.C4H10?.found.push('CCCC');

  expect(defaults.found).toStrictEqual([]);
});

test('the binding may be named after the course holding the work', () => {
  installStorage();

  expect(
    localStorageProgressStore({ key: 'tex:exercises', name: 'the course' })
      .name,
  ).toBe('the course');
});

function installStorage(onWrite?: (key: string) => void): Map<string, string> {
  const entries = new Map<string, string>();
  const storage = {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => {
      onWrite?.(key);
      entries.set(key, value);
    },
  } satisfies Storage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
    writable: true,
  });
  return entries;
}
