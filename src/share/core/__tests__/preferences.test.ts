import { expect, test } from 'vitest';

import { booleanParam, enumParam, numberParam } from '../params.ts';
import type {
  PreferenceHistory,
  PreferenceLocation,
  UrlPreference,
  UrlPreferences,
} from '../preferences.ts';
import {
  applyPreferencesFromSearch,
  syncPreferencesWithUrl,
  writePreferencesToSearch,
} from '../preferences.ts';
import { buildShareUrl } from '../url.ts';

import { BARE_VOCABULARY } from './vocabulary.ts';

function preference<Value>(
  codec: UrlPreference<Value>['codec'],
  initial: Value,
): UrlPreference<Value> & { value: Value } {
  let current = initial;
  return {
    codec,
    get value() {
      return current;
    },
    set value(next: Value) {
      current = next;
    },
    get: () => current,
    set: (next) => {
      current = next;
    },
  };
}

function makePreferences() {
  return {
    strategy: preference(
      enumParam(['greedy', 'exhaustive'] as const, 'greedy'),
      'greedy',
    ),
    size: preference(numberParam({ min: 0.1, max: 5, default: 1 }), 1),
    labels: preference(booleanParam(), false),
  };
}

function fakeAddress(pathname: string, search: string, hash = '') {
  const calls: string[] = [];
  const location: { -readonly [Key in keyof PreferenceLocation]: string } = {
    pathname,
    search,
    hash,
  };
  const history: PreferenceHistory = {
    state: { page: 1 },
    replaceState(data, unused, url) {
      calls.push(url);
      const [path = '', rest = ''] = url.split('#');
      const cut = path.indexOf('?');
      location.pathname = cut === -1 ? path : path.slice(0, cut);
      location.search = cut === -1 ? '' : path.slice(cut);
      location.hash = rest === '' ? '' : `#${rest}`;

      expect(data).toStrictEqual({ page: 1 });
      expect(unused).toBe('');
    },
  };
  return { location, history, calls };
}

function manualSubscription() {
  const listeners = new Set<() => void>();
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notify: () => {
      for (const listener of listeners) listener();
    },
  };
}

test('only the preferences a link carries are applied', () => {
  const preferences = makePreferences();
  preferences.size.value = 2.5;

  const applied = applyPreferencesFromSearch(
    '?smiles=CCO&strategy=exhaustive&labels',
    preferences,
  );

  expect(applied).toStrictEqual(['strategy', 'labels']);
  expect(preferences.strategy.value).toBe('exhaustive');
  expect(preferences.labels.value).toBe(true);
  expect(preferences.size.value).toBe(2.5);
});

test('a malformed preference falls back to its default through the codec', () => {
  const preferences = makePreferences();
  preferences.strategy.value = 'exhaustive';
  preferences.size.value = 3;

  applyPreferencesFromSearch('strategy=fiendish&size=big', preferences);

  expect(preferences.strategy.value).toBe('greedy');
  expect(preferences.size.value).toBe(1);
});

test('writing keeps unrelated keys in order and preferences in place', () => {
  const preferences = makePreferences();
  preferences.strategy.value = 'exhaustive';
  preferences.labels.value = true;

  const query = writePreferencesToSearch(
    '?smiles=CCO&strategy=greedy&id=7&embed=1&hide=menu,hints',
    preferences,
  );

  expect(query).toBe(
    'smiles=CCO&strategy=exhaustive&id=7&embed=1&hide=menu,hints&labels=1',
  );
});

test('a preference back at its default is deleted from the address', () => {
  const preferences = makePreferences();

  const query = writePreferencesToSearch(
    'size=2&smiles=CCO&strategy=exhaustive&strategy=greedy',
    preferences,
  );

  expect(query).toBe('smiles=CCO');
});

test('the sync applies the address, then rewrites it on every change', () => {
  const preferences = makePreferences();
  const { location, history, calls } = fakeAddress(
    '/tool',
    '?smiles=CCO&size=2.5',
    '#top',
  );
  const subscription = manualSubscription();

  syncPreferencesWithUrl({
    preferences,
    subscribe: subscription.subscribe,
    location,
    history,
  });

  expect(preferences.size.value).toBe(2.5);
  expect(calls).toStrictEqual([]);

  preferences.strategy.value = 'exhaustive';
  subscription.notify();
  preferences.size.value = 1;
  subscription.notify();

  expect(calls).toStrictEqual([
    '/tool?smiles=CCO&size=2.5&strategy=exhaustive#top',
    '/tool?smiles=CCO&strategy=exhaustive#top',
  ]);
  expect(location.search).toBe('?smiles=CCO&strategy=exhaustive');
});

test('stored preferences a link omits are written into the address on load', () => {
  const preferences = makePreferences();
  preferences.labels.value = true;
  const { location, history, calls } = fakeAddress('/', '');

  syncPreferencesWithUrl({
    preferences,
    subscribe: manualSubscription().subscribe,
    location,
    history,
  });

  expect(calls).toStrictEqual(['/?labels=1']);
});

test('the address is not rewritten when nothing in it would change', () => {
  const preferences = makePreferences();
  const { location, history, calls } = fakeAddress(
    '/tool',
    '?smiles=C%2BC&strategy=exhaustive',
  );
  const subscription = manualSubscription();

  syncPreferencesWithUrl({
    preferences,
    subscribe: subscription.subscribe,
    location,
    history,
  });
  subscription.notify();
  preferences.size.value = 1;
  subscription.notify();

  expect(calls).toStrictEqual([]);
});

test('unsubscribing stops rewriting the address', () => {
  const preferences = makePreferences();
  const { location, history, calls } = fakeAddress('/tool', '');
  let unsubscribed = 0;
  const subscription = manualSubscription();

  const stop = syncPreferencesWithUrl({
    preferences,
    subscribe(listener) {
      const remove = subscription.subscribe(listener);
      return () => {
        unsubscribed++;
        remove();
      };
    },
    location,
    history,
  });
  stop();
  preferences.labels.value = true;
  subscription.notify();

  expect(unsubscribed).toBe(1);
  expect(calls).toStrictEqual([]);
});

test('a preference named like a reserved share parameter throws at setup', () => {
  const flag = preference(booleanParam(), false);
  const preferences: UrlPreferences = { hide: flag };
  const { location, history } = fakeAddress('/', '');

  expect(() =>
    syncPreferencesWithUrl({
      preferences,
      subscribe: manualSubscription().subscribe,
      location,
      history,
    }),
  ).toThrow('preference "hide" collides with a reserved share parameter');
  expect(() => writePreferencesToSearch('', { embed: flag })).toThrow(
    'preference "embed" collides with a reserved share parameter',
  );
});

test('a share link built from the synced address carries the preferences', () => {
  const preferences = makePreferences();
  preferences.size.value = 2.5;
  const search = `?${writePreferencesToSearch('smiles=CCO', preferences)}`;

  const url = buildShareUrl({
    base: 'https://3d.cheminfo.org/tool',
    search,
    config: { embed: true, hidden: ['menu'], params: {} },
    vocabulary: BARE_VOCABULARY,
  });

  expect(url).toBe(
    'https://3d.cheminfo.org/tool?smiles=CCO&size=2.5&embed=1&hide=menu',
  );
});
