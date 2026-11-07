import { afterEach, expect, test, vi } from 'vitest';

import {
  ROUTE_CHANGE_EVENT,
  readRoute,
  subscribeToRoute,
  writeRoute,
} from '../history.ts';
import { createTabRouter } from '../tabRouter.ts';

type Tab = 'convert' | 'tutorial' | 'exercises';

const router = createTabRouter<Tab>({
  tabs: [
    'convert',
    { id: 'tutorial', takesId: true },
    { id: 'exercises', takesId: true },
  ],
  home: 'convert',
  adoptLegacyHash: true,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('moving to another tab keeps embed and hide, and pushes an entry', () => {
  const browser = installBrowser('/tutorial/2?embed&hide=hints&smiles=CCO');

  const address = writeRoute(router, { tab: 'exercises', id: 'rings' });

  expect(address).toBe('/exercises/rings?embed&hide=hints');
  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/exercises/rings?embed&hide=hints' },
  ]);
  expect(readRoute(router)).toStrictEqual({
    tab: 'exercises',
    id: 'rings',
    params: { embed: '', hide: 'hints' },
  });
});

test('a move inside a tab replaces the entry and keeps the named preferences', () => {
  const browser = installBrowser('/tutorial/2?embed=1&theme=dark&smiles=CCO');

  writeRoute(
    router,
    { tab: 'tutorial', id: '3', params: { smiles: 'CCN' } },
    { keep: ['theme'] },
  );

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/tutorial/3?smiles=CCN&embed=1&theme=dark' },
  ]);
});

test('a parameter the route names is its own, even to remove it', () => {
  const browser = installBrowser('/tutorial/2?embed=1&hide=hints');

  writeRoute(router, { tab: 'tutorial', id: '2', params: { hide: null } });

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/tutorial/2?embed=1' },
  ]);
});

test('writing the address already on screen neither moves nor notifies', () => {
  const browser = installBrowser('/exercises/rings?embed=1');
  let notified = 0;
  browser.events.addEventListener(ROUTE_CHANGE_EVENT, () => {
    notified++;
  });

  writeRoute(router, { tab: 'exercises', id: 'rings' });

  expect(browser.moves).toStrictEqual([]);
  expect(notified).toBe(0);
});

test('the history option forces a push or a replace', () => {
  const browser = installBrowser('/tutorial/2');

  writeRoute(router, { tab: 'tutorial', id: '3' }, { history: 'push' });
  writeRoute(router, { tab: 'convert' }, { history: 'replace' });

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/tutorial/3' },
    { kind: 'replace', address: '/' },
  ]);
});

test('a hash router writes the fragment and keeps the share keys inside it', () => {
  const hashRouter = createTabRouter<Tab>({
    tabs: ['convert', { id: 'tutorial', takesId: true }],
    home: 'convert',
    mode: 'hash',
  });
  const browser = installBrowser('/page?x=1#/tutorial/2?embed=1');

  writeRoute(hashRouter, { tab: 'convert' });

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '#/?embed=1' },
  ]);
  expect(browser.url.href).toBe(
    'https://smiles.cheminfo.org/page?x=1#/?embed=1',
  );
});

test('a legacy hash link is adopted once, in place', () => {
  const browser = installBrowser('/?embed#/tutorial/3');

  expect(readRoute(router)).toStrictEqual({
    tab: 'tutorial',
    id: '3',
    params: { embed: '' },
  });
  expect(readRoute(router).id).toBe('3');
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/tutorial/3?embed' },
  ]);
});

test('a subscriber hears the browser navigation and the app writes', () => {
  const browser = installBrowser('/');
  const seen: string[] = [];
  const stop = subscribeToRoute(router, (route) => {
    seen.push(`${route.tab}:${route.id ?? ''}`);
  });

  writeRoute(router, { tab: 'tutorial', id: '1' });
  browser.visit('/exercises/rings');
  stop();
  writeRoute(router, { tab: 'convert' });

  expect(seen).toStrictEqual(['tutorial:1', 'exercises:rings']);
});

test('without a browser the route is the home one and nothing is written', () => {
  expect(readRoute(router)).toStrictEqual({
    tab: 'convert',
    id: null,
    params: {},
  });
  expect(writeRoute(router, { tab: 'tutorial', id: '2' })).toBe('/tutorial/2');
  expect(() => {
    subscribeToRoute(router, () => null)();
  }).not.toThrow();
});

interface Move {
  kind: 'push' | 'replace';
  address: string;
}

// The smallest browser the binding reads: this package has no DOM
// implementation and must not grow one.
function installBrowser(address: string) {
  const url = new URL(address, 'https://smiles.cheminfo.org');
  const events = new EventTarget();
  const moves: Move[] = [];

  function move(kind: Move['kind'], next: string): void {
    moves.push({ kind, address: next });
    url.href = new URL(next, url).href;
  }

  vi.stubGlobal('location', {
    get pathname() {
      return url.pathname;
    },
    get search() {
      return url.search;
    },
    get hash() {
      return url.hash;
    },
    get origin() {
      return url.origin;
    },
  });
  vi.stubGlobal('history', {
    state: null,
    pushState: (_state: unknown, _unused: string, next: string) => {
      move('push', next);
    },
    replaceState: (_state: unknown, _unused: string, next: string) => {
      move('replace', next);
    },
  });
  vi.stubGlobal('addEventListener', events.addEventListener.bind(events));
  vi.stubGlobal('removeEventListener', events.removeEventListener.bind(events));
  vi.stubGlobal('dispatchEvent', events.dispatchEvent.bind(events));

  return {
    url,
    moves,
    events,
    visit(next: string): void {
      url.href = new URL(next, url).href;
      events.dispatchEvent(new Event('popstate'));
    },
  };
}
