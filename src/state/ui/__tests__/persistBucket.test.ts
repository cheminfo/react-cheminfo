import { afterEach, expect, test, vi } from 'vitest';

import { persistBucket } from '../persistBucket.ts';

interface Preferences {
  quality: string;
  peaks: boolean;
  tags: string[];
}

const DEFAULTS: Preferences = { quality: 'standard', peaks: true, tags: ['a'] };

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a first visit reads the defaults and says so', () => {
  stubStorage();
  const bucket = persistBucket({ key: 'site:preferences', defaults: DEFAULTS });

  expect(bucket.storageKey).toBe('site:preferences:v1');
  expect(bucket.read()).toStrictEqual({
    value: { quality: 'standard', peaks: true, tags: ['a'] },
    firstRun: true,
  });
});

test('a bucket round-trips through storage, and a stored default is not a first visit', () => {
  const entries = stubStorage();
  const bucket = persistBucket({ key: 'site:preferences', defaults: DEFAULTS });

  bucket.write({ quality: 'standard', peaks: true, tags: ['a'] });

  expect(entries.get('site:preferences:v1')).toBe(
    '{"quality":"standard","peaks":true,"tags":["a"]}',
  );
  expect(bucket.read()).toStrictEqual({
    value: { quality: 'standard', peaks: true, tags: ['a'] },
    firstRun: false,
  });
});

test('a field added since the last save lands as its default', () => {
  stubStorage({ 'site:preferences:v1': '{"quality":"high"}' });

  expect(
    persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).read(),
  ).toStrictEqual({
    value: { quality: 'high', peaks: true, tags: ['a'] },
    firstRun: false,
  });
});

test('a stored field of the wrong shape falls back to its default', () => {
  stubStorage({ 'site:preferences:v1': '{"quality":4,"peaks":false}' });

  expect(
    persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).read().value,
  ).toStrictEqual({ quality: 'standard', peaks: false, tags: ['a'] });
});

test('malformed JSON reads as a first visit', () => {
  stubStorage({ 'site:preferences:v1': '{not json' });

  expect(
    persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).read(),
  ).toStrictEqual({ value: DEFAULTS, firstRun: true });
});

test('a payload that is not an object reads as a first visit', () => {
  stubStorage({ 'site:preferences:v1': '["high"]' });

  expect(
    persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).read(),
  ).toStrictEqual({ value: DEFAULTS, firstRun: true });
});

test('the version is part of the key, so an entry of the previous shape is ignored', () => {
  const entries = stubStorage({ 'site:preferences:v1': '{"quality":"high"}' });
  const bucket = persistBucket({
    key: 'site:preferences',
    version: 2,
    defaults: DEFAULTS,
  });

  expect(bucket.storageKey).toBe('site:preferences:v2');
  expect(bucket.read()).toStrictEqual({ value: DEFAULTS, firstRun: true });

  bucket.write({ quality: 'draft', peaks: false, tags: [] });

  expect(entries.get('site:preferences:v1')).toBe('{"quality":"high"}');
  expect(entries.get('site:preferences:v2')).toBe(
    '{"quality":"draft","peaks":false,"tags":[]}',
  );
});

test('a full store calls onQuotaExceeded once and throws nothing', () => {
  stubStorage({}, { failWrites: 'QuotaExceededError' });
  const seen: string[] = [];
  const bucket = persistBucket({
    key: 'site:preferences',
    defaults: DEFAULTS,
    onQuotaExceeded: (error) => {
      seen.push((error as Error).name);
    },
  });

  expect(() => {
    bucket.write({ quality: 'high', peaks: true, tags: [] });
  }).not.toThrow();
  expect(seen).toStrictEqual(['QuotaExceededError']);
});

test('a store that refuses the write for another reason stays silent', () => {
  stubStorage({}, { failWrites: 'SecurityError' });
  const seen: string[] = [];
  const bucket = persistBucket({
    key: 'site:preferences',
    defaults: DEFAULTS,
    onQuotaExceeded: (error) => {
      seen.push((error as Error).name);
    },
  });

  bucket.write({ quality: 'high', peaks: true, tags: [] });

  expect(seen).toStrictEqual([]);
});

test('a store that throws on read gives back the defaults', () => {
  stubStorage(
    { 'site:preferences:v1': '{"quality":"high"}' },
    {
      failReads: true,
    },
  );

  expect(
    persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).read(),
  ).toStrictEqual({ value: DEFAULTS, firstRun: true });
});

test('no storage at all is not an error', () => {
  vi.stubGlobal('localStorage', undefined);
  const bucket = persistBucket({ key: 'site:preferences', defaults: DEFAULTS });

  expect(bucket.read()).toStrictEqual({ value: DEFAULTS, firstRun: true });
  expect(() => {
    bucket.write({ quality: 'high', peaks: false, tags: [] });
    bucket.clear();
  }).not.toThrow();
});

test('clear forgets its own entry and no other', () => {
  const entries = stubStorage({
    'site:preferences:v1': '{"quality":"high"}',
    'site:exercises:v1': '{"alkanes":1}',
  });

  persistBucket({ key: 'site:preferences', defaults: DEFAULTS }).clear();

  expect(entries.get('site:preferences:v1')).toBeUndefined();
  expect(entries.get('site:exercises:v1')).toBe('{"alkanes":1}');
});

test('the value read is independent of the defaults handed to the bucket', () => {
  stubStorage();
  const defaults = { quality: 'standard', tags: ['a'] };
  const bucket = persistBucket({ key: 'site:preferences', defaults });

  bucket.read().value.tags.push('z');

  expect(defaults.tags).toStrictEqual(['a']);
  expect(bucket.read().value.tags).toStrictEqual(['a']);
});

function stubStorage(
  initial: Record<string, string> = {},
  options: { failReads?: boolean; failWrites?: string } = {},
): Map<string, string> {
  const entries = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem(key: string) {
      if (options.failReads) throw new Error('read blocked');
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (options.failWrites !== undefined) {
        const error = new Error('write refused');
        error.name = options.failWrites;
        throw error;
      }
      entries.set(key, value);
    },
    removeItem(key: string) {
      entries.delete(key);
    },
  });
  return entries;
}
