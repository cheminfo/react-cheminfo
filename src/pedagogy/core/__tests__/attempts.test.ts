import { afterEach, expect, test } from 'vitest';

import type { Attempt } from '../attempts.ts';
import { attemptKey, createAttemptStore, emptyAttempt } from '../attempts.ts';
import type { ProgressRecords, ProgressStore } from '../progress.ts';

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage');
});

test('an attempt is kept under the tool, the series and the question', () => {
  expect(attemptKey('electrons', 4271, 'Fe3+')).toBe('electrons/4271/Fe3+');
});

test('the attempts and the seeds keep the keys the sites already wrote', () => {
  const entries = installStorage();
  const store = createAttemptStore({ key: 'atoms' });
  store.updateAttempt('electrons/1/Na', { answers: { electrons: '11' } });
  store.storeSeed('electrons', 1);

  expect([...entries.keys()].toSorted()).toStrictEqual([
    'atoms:attempts:v1',
    'atoms:seeds:v1',
  ]);
  expect(JSON.parse(entries.get('atoms:seeds:v1') ?? '')).toStrictEqual({
    electrons: 1,
  });
  expect(
    createAttemptStore({ key: 'atoms' }).attemptFor('electrons/1/Na'),
  ).toStrictEqual({
    ...emptyAttempt(),
    answers: { electrons: '11' },
  });
  expect(createAttemptStore({ key: 'atoms' }).storedSeed('electrons')).toBe(1);
  expect(createAttemptStore({ key: 'atoms' }).storedSeed('lewis')).toBeNull();
});

test('every change is told to the subscribers, with a new record set', () => {
  installStorage();
  const store = createAttemptStore({ key: 'moles' });
  const before = store.records();
  let told = 0;
  const stop = store.subscribe(() => {
    told++;
  });
  store.updateAttempt('grams/2/H2O', { status: 'solved' });
  stop();
  store.updateAttempt('grams/2/H2O', { status: 'attempted' });

  expect(told).toBe(1);
  expect(store.records()).not.toBe(before);
  expect(store.attemptFor('grams/2/H2O').status).toBe('attempted');
});

test('clearing forgets the questions named and nothing else', () => {
  installStorage();
  const store = createAttemptStore({ key: 'moles' });
  store.updateAttempt('grams/2/a', { status: 'solved' });
  store.updateAttempt('grams/2/b', { status: 'attempted' });
  store.clearAttempts(['grams/2/a']);

  expect(Object.keys(store.records())).toStrictEqual(['grams/2/b']);
});

test('a new series forgets the tool’s other series, never another tool’s', () => {
  installStorage();
  const store = createAttemptStore({ key: 'moles' });
  store.updateAttempt('grams/1/a', { status: 'solved' });
  store.updateAttempt('grams/2/a', { status: 'solved' });
  store.updateAttempt('percent/1/a', { status: 'solved' });
  store.forgetOtherSeries('grams', 2);

  expect(Object.keys(store.records()).toSorted()).toStrictEqual([
    'grams/2/a',
    'percent/1/a',
  ]);
});

test('a page with no storage at all still keeps its attempts in memory', () => {
  const store = createAttemptStore({ key: 'atoms' });
  store.updateAttempt('lewis/3/CO2', { hintsRevealed: 2 });

  store.storeSeed('lewis', 3);

  expect(store.attemptFor('lewis/3/CO2').hintsRevealed).toBe(2);
  expect(store.storedSeed('lewis')).toBe(3);
  expect(createAttemptStore({ key: 'atoms' }).storedSeed('lewis')).toBeNull();
});

test('a binding that answers later replaces what the page started from', async () => {
  const saved: Array<ProgressRecords<Attempt>> = [];
  const remote: ProgressStore<Attempt> = {
    name: 'the course',
    load: () =>
      Promise.resolve({ 'grams/5/a': { ...emptyAttempt(), status: 'solved' } }),
    save: (records) => {
      saved.push(records);
    },
  };
  const store = createAttemptStore({ key: 'moles', binding: remote });

  expect(store.records()).toStrictEqual({});

  await Promise.resolve();
  await Promise.resolve();

  expect(store.attemptFor('grams/5/a').status).toBe('solved');

  store.updateAttempt('grams/5/b', { status: 'attempted' });

  expect(Object.keys(saved.at(-1) ?? {})).toStrictEqual([
    'grams/5/a',
    'grams/5/b',
  ]);
});

function installStorage(): Map<string, string> {
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
