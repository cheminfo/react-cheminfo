import { afterEach, expect, test, vi } from 'vitest';

import { readRoute, writeRoute } from '../history.ts';
import {
  holdPageAddress,
  isPageAddressHeld,
  pageHistory,
  pageLocation,
  releasePageAddress,
} from '../pageAddress.ts';
import { createTabRouter } from '../tabRouter.ts';

afterEach(() => {
  releasePageAddress();
  vi.unstubAllGlobals();
});

test('with nothing held, the page reads the browser', () => {
  const location = { pathname: '/a', search: '?x=1', hash: '' };
  vi.stubGlobal('location', location);

  expect(isPageAddressHeld()).toBe(false);
  expect(pageLocation()).toBe(location);
});

test('a held address is read in its parts', () => {
  holdPageAddress('/fr/exercises?formulas=C4H10O,C5H12&embed=1#top');

  expect(isPageAddressHeld()).toBe(true);

  const location = pageLocation();

  expect(location?.pathname).toBe('/fr/exercises');
  expect(location?.search).toBe('?formulas=C4H10O,C5H12&embed=1');
  expect(location?.hash).toBe('#top');
});

test('writes resolve against the held address and keep their state', () => {
  holdPageAddress('/exercises/rings?embed=1#top');
  const history = pageHistory();

  history?.replaceState({ step: 1 }, '', '?embed=1&hide=hints');

  expect(pageLocation()?.pathname).toBe('/exercises/rings');
  expect(pageLocation()?.search).toBe('?embed=1&hide=hints');
  expect(pageLocation()?.hash).toBe('');
  expect(history?.state).toStrictEqual({ step: 1 });

  history?.pushState(null, '', 'chains');

  expect(pageLocation()?.pathname).toBe('/exercises/chains');
  expect(pageLocation()?.search).toBe('');
});

test('a plus and a comma survive a write as they were written', () => {
  holdPageAddress('/');

  pageHistory()?.replaceState(null, '', '/?hide=a,b&smiles=CC%5BN%2B%5D&q=C+H');

  expect(pageLocation()?.search).toBe('?hide=a,b&smiles=CC%5BN%2B%5D&q=C+H');
});

test('the router moves inside a held address and never touches the browser', () => {
  const pushState = vi.fn();
  const replaceState = vi.fn();
  vi.stubGlobal('location', {
    pathname: '/tutorial/2',
    search: '?s=e1.token',
    hash: '',
  });
  vi.stubGlobal('history', { state: null, pushState, replaceState });
  const router = createTabRouter<'tutorial' | 'exercises'>({
    tabs: [
      { id: 'tutorial', takesId: true },
      { id: 'exercises', takesId: true },
    ],
    home: 'tutorial',
  });
  holdPageAddress('/tutorial/2?embed=1&hide=hints&smiles=CCO');

  const address = writeRoute(router, { tab: 'exercises', id: 'rings' });

  expect(address).toBe('/exercises/rings?embed=1&hide=hints');
  expect(readRoute(router)).toStrictEqual({
    tab: 'exercises',
    id: 'rings',
    params: { embed: '1', hide: 'hints' },
  });
  expect(pushState).not.toHaveBeenCalled();
  expect(replaceState).not.toHaveBeenCalled();
});
