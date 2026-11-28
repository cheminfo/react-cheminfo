/**
 * A practice site writes its addresses one way: a move carries the
 * preferences, and the row's share onto a page with the same row; a series is
 * named in its parameter; the share in `split`, inside the page.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { createSeriesRouter } from '../seriesRouter.ts';

import { installBrowser } from './browserStub.ts';

type Tab = 'mass' | 'moles' | 'cheatsheet' | 'about';
type Tool = 'mass' | 'moles';

function isTool(tab: Tab): tab is Tool {
  return tab === 'mass' || tab === 'moles';
}

function series() {
  return createSeriesRouter<Tab, Tool>({
    tabs: [
      { id: 'mass', path: '/' },
      { id: 'moles', path: '/moles' },
      { id: 'cheatsheet', path: '/cheatsheet' },
      { id: 'about', path: '/about' },
    ],
    home: 'mass',
    head: { site: 'moles', routes: [] },
    isSeriesTab: isTool,
    seriesParam: 'seed',
    serializeSplit: (_tab, share) => (share === null ? null : String(share)),
    keep: ['units'],
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a move carries the preferences, and the share only onto a tool', () => {
  const browser = installBrowser('/?units=si&split=40&seed=7');
  const site = series();
  site.navigate('moles');
  site.navigate('cheatsheet');

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/moles?units=si&split=40' },
    { kind: 'push', address: '/cheatsheet?units=si' },
  ]);
});

test('a series is named in its parameter, and a share replaces the entry, keeping the series', () => {
  const browser = installBrowser('/moles?units=si&split=40');
  const site = series();
  site.writeSeries('moles', 12, 'push');
  site.writeSplit('moles', 35);
  site.writeSplit('moles', null);

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/moles?seed=12&units=si&split=40' },
    { kind: 'replace', address: '/moles?split=35&units=si&seed=12' },
    { kind: 'replace', address: '/moles?units=si&seed=12' },
  ]);
});
