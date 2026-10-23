import { afterEach, expect, test, vi } from 'vitest';

import { persistBucket } from '../persistBucket.ts';
import { persistSignalBucket } from '../persistSignalBucket.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('an unversioned entry is adopted once under the versioned key, and forgotten', () => {
  const store = stubStorage({
    'chemcalc:preferences': '{"chart":{"fwhm":0.02}}',
  });

  const bucket = persistBucket({
    key: 'chemcalc:preferences',
    defaults: { chart: { fwhm: 0.01, peaks: true } },
    legacyKeys: ['chemcalc:preferences'],
    forgetLegacyKeys: true,
  });

  expect(bucket.storageKey).toBe('chemcalc:preferences:v1');
  expect([...store.entries.entries()]).toStrictEqual([
    ['chemcalc:preferences:v1', '{"chart":{"fwhm":0.02}}'],
  ]);
  expect(bucket.read()).toStrictEqual({
    value: { chart: { fwhm: 0.02, peaks: true } },
    firstRun: false,
  });
});

test('the first legacy entry holding something wins, and the old ones stay by default', () => {
  const store = stubStorage({
    'mixonat:preferences': '{"search":{"limit":5}}',
  });

  persistBucket({
    key: 'derepflow:preferences',
    defaults: { search: { limit: 10 } },
    legacyKeys: ['derepflow:preferences', 'mixonat:preferences'],
  });

  expect(store.entries.get('derepflow:preferences:v1')).toBe(
    '{"search":{"limit":5}}',
  );
  expect(store.entries.get('mixonat:preferences')).toBe(
    '{"search":{"limit":5}}',
  );
});

test('a versioned entry is never overwritten by a legacy one', () => {
  const store = stubStorage({
    'polycarp:preferences:v1': '{"unit":"nm"}',
    'polycarp:preferences': '{"unit":"cm"}',
  });

  persistBucket({
    key: 'polycarp:preferences',
    defaults: { unit: 'cm' },
    legacyKeys: ['polycarp:preferences'],
    forgetLegacyKeys: true,
  });

  expect([...store.entries.entries()]).toStrictEqual([
    ['polycarp:preferences:v1', '{"unit":"nm"}'],
  ]);
});

test('a legacy shape is migrated, and an unreadable one adopts nothing', () => {
  const store = stubStorage({
    storage: '{"settings":{"chart":{"fwhm":0.05}}}',
    broken: '{not json',
  });

  persistBucket({
    key: 'chemcalc:preferences',
    defaults: { chart: { fwhm: 0.01, widthMode: 'resolution' } },
    legacyKeys: [
      { key: 'broken', migrate },
      { key: 'storage', migrate },
    ],
    forgetLegacyKeys: true,
  });

  expect([...store.entries.entries()]).toStrictEqual([
    ['chemcalc:preferences:v1', '{"chart":{"fwhm":0.05,"widthMode":"fwhm"}}'],
  ]);
});

test('a bucket hears another tab store it, and never its own removal', () => {
  const store = stubStorage({});
  const bucket = persistBucket({ key: 'lcao:preferences', defaults: { n: 1 } });
  const heard: unknown[] = [];
  const stop = bucket.subscribe((read) => heard.push(read));

  store.entries.set('lcao:preferences:v1', '{"n":3}');
  store.fire('lcao:preferences:v1', '{"n":3}');
  store.fire('lcao:preferences:v1', null);
  store.fire('3d:preferences:v1', '{"n":4}');
  stop();
  store.fire('lcao:preferences:v1', '{"n":3}');

  expect(heard).toStrictEqual([{ value: { n: 3 }, firstRun: false }]);
});

test('a synced signal bucket takes on another tab and writes nothing back', () => {
  const store = stubStorage({});
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'chemcalc:exercises',
    effect: reactive.effect,
    syncAcrossTabs: true,
    bucket: {
      level: reactive.signal(1),
      series: reactive.signal<string[]>([]),
    },
  });

  const written = '{"level":3,"series":["C6H6","H2O"]}';
  store.entries.set('chemcalc:exercises:v1', written);
  store.fire('chemcalc:exercises:v1', written);

  expect(bucket.level.value).toBe(3);
  expect(bucket.series.value).toStrictEqual(['C6H6', 'H2O']);
  expect(store.writes).toStrictEqual([]);

  bucket.level.value = 3;
  bucket.level.value = 2;

  expect(store.writes).toStrictEqual([
    ['chemcalc:exercises:v1', '{"level":2,"series":["C6H6","H2O"]}'],
  ]);
});

test('a sync rule keeps the work a tab already holds', () => {
  const store = stubStorage({});
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'chemcalc:series',
    effect: reactive.effect,
    syncAcrossTabs: (held) => held.series.value.length === 0,
    bucket: { series: reactive.signal<string[]>(['CO2']) },
  });

  store.entries.set('chemcalc:series:v1', '{"series":["NH3"]}');
  store.fire('chemcalc:series:v1', '{"series":["NH3"]}');

  expect(bucket.series.value).toStrictEqual(['CO2']);
});

test('an unsynced signal bucket keeps writing whatever changes, as before', () => {
  const store = stubStorage({ 'vcl:preferences:v1': '{"size":2}' });
  const reactive = createReactiveSystem();
  const bucket = persistSignalBucket({
    key: 'vcl:preferences',
    effect: reactive.effect,
    legacyKeys: ['vcl-preferences'],
    bucket: { size: reactive.signal(1) },
  });

  store.fire('vcl:preferences:v1', '{"size":7}');
  bucket.size.value = 2;

  expect(bucket.size.value).toBe(2);
  expect(store.writes).toStrictEqual([['vcl:preferences:v1', '{"size":2}']]);
});

function migrate(stored: unknown) {
  const chart = (stored as { settings: { chart: { fwhm: number } } }).settings
    .chart;
  return { chart: { fwhm: chart.fwhm, widthMode: 'fwhm' } };
}

interface FakeSignal<T> {
  value: T;
  peek: () => T;
  subscribe: () => () => void;
}

function createReactiveSystem() {
  const effects: Array<() => void> = [];
  const effect = (callback: () => void): void => {
    effects.push(callback);
    callback();
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

function stubStorage(initial: Record<string, string>) {
  const entries = new Map(Object.entries(initial));
  const writes: Array<[string, string]> = [];
  const events = new EventTarget();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes.push([key, value]);
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  });
  vi.stubGlobal('addEventListener', events.addEventListener.bind(events));
  vi.stubGlobal('removeEventListener', events.removeEventListener.bind(events));
  return {
    entries,
    writes,
    fire(key: string, newValue: string | null): void {
      events.dispatchEvent(
        Object.assign(new Event('storage'), { key, newValue }),
      );
    },
  };
}
