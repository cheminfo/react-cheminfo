import { afterEach, expect, test, vi } from 'vitest';

import { persistSignalBucket } from '../persistSignalBucket.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a first visit keeps the declared values and writes nothing until a leaf changes', () => {
  const entries = stubStorage();
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'vcl:preferences',
    effect: reactive.effect,
    bucket: {
      quality: reactive.signal('standard'),
      display: { peaks: reactive.signal(true), tags: reactive.signal(['a']) },
    },
  });

  expect(bucket.quality.value).toBe('standard');
  expect(entries.size).toBe(0);

  bucket.display.peaks.value = false;

  expect(entries.get('vcl:preferences:v1')).toBe(
    '{"quality":"standard","display":{"peaks":false,"tags":["a"]}}',
  );
});

test('a stored tree is written back into its leaves, wrong shapes and missing leaves keeping their defaults', () => {
  stubStorage({
    'surge:generator:v3': JSON.stringify({
      mf: 'C5H12',
      limits: { count: 'many', tags: ['x', 'y'] },
      retired: 42,
    }),
  });
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'surge:generator',
    version: 3,
    effect: reactive.effect,
    bucket: {
      mf: reactive.signal('C6H10O'),
      limits: {
        count: reactive.signal(100),
        tags: reactive.signal<string[]>([]),
        fresh: reactive.signal(true),
      },
    },
  });

  expect(bucket.mf.value).toBe('C5H12');
  expect(bucket.limits.count.value).toBe(100);
  expect(bucket.limits.tags.value).toStrictEqual(['x', 'y']);
  expect(bucket.limits.fresh.value).toBe(true);
});

test('a member that is neither a signal nor a group is left out of the entry', () => {
  const entries = stubStorage();
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'lcao:preferences',
    effect: reactive.effect,
    bucket: {
      label: 'not stored',
      reset: () => null,
      selectedAtom: reactive.signal<number | null>(null),
    },
  });

  bucket.selectedAtom.value = 3;

  expect(entries.get('lcao:preferences:v1')).toBe('{"selectedAtom":3}');
  expect(bucket.label).toBe('not stored');
});

test('a full store is reported through onQuotaExceeded', () => {
  stubStorage({}, 'QuotaExceededError');
  const reactive = createReactiveSystem();
  const seen: string[] = [];
  const bucket = persistSignalBucket({
    key: 'tex:preferences',
    effect: reactive.effect,
    onQuotaExceeded: (error) => {
      seen.push((error as Error).name);
    },
    bucket: { source: reactive.signal('x^2') },
  });

  bucket.source.value = 'x^3';

  expect(seen).toStrictEqual(['QuotaExceededError']);
});

interface FakeSignal<T> {
  value: T;
  peek: () => T;
  subscribe: (listener: (value: T) => void) => () => void;
}

function createReactiveSystem() {
  const effects: Array<() => void> = [];
  const effect = (callback: () => void): (() => void) => {
    effects.push(callback);
    callback();
    return () => {
      effects.splice(effects.indexOf(callback), 1);
    };
  };
  const signal = <T>(initial: T): FakeSignal<T> => {
    let current = initial;
    return {
      get value() {
        return current;
      },
      set value(next: T) {
        current = next;
        for (const listener of effects) listener();
      },
      peek: () => current,
      subscribe: () => unsubscribe,
    };
  };
  return { effect, signal };
}

function unsubscribe(): void {
  // The fake signals keep no subscriber list, so there is nothing to release.
}

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
