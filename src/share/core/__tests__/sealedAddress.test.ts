import { afterEach, expect, test } from 'vitest';

import {
  isPageAddressHeld,
  pageHistory,
  pageLocation,
  releasePageAddress,
} from '../../../router/core/pageAddress.ts';
import { sealQuery } from '../seal.ts';
import { canOpenSealedAddresses, openSealedAddress } from '../sealedAddress.ts';

afterEach(() => {
  releasePageAddress();
});

test('a plain address is left to the browser', async () => {
  const opened = await openSealedAddress({
    pathname: '/exercises',
    search: '?embed=1&formulas=C4H10O',
    hash: '',
  });

  expect(opened).toStrictEqual({ status: 'plain' });
  expect(isPageAddressHeld()).toBe(false);
  expect(canOpenSealedAddresses()).toBe(true);
});

test('a sealed address is read as what it carries, and held there', async () => {
  const token = await sealQuery('formulas=C4H10O,C5H12&hide=answers&embed=1');

  const opened = await openSealedAddress({
    pathname: '/fr/exercises',
    search: `?s=${token}`,
    hash: '',
  });

  expect(opened).toStrictEqual({ status: 'sealed' });
  expect(isPageAddressHeld()).toBe(true);
  expect(pageLocation()?.pathname).toBe('/fr/exercises');
  expect(pageLocation()?.search).toBe(
    '?formulas=C4H10O,C5H12&hide=answers&embed=1',
  );

  pageHistory()?.pushState(null, '', '/fr/generate?mf=C6H6&embed=1');

  expect(pageLocation()?.pathname).toBe('/fr/generate');
  expect(pageLocation()?.search).toBe('?mf=C6H6&embed=1');
});

test('an edited token opens nothing and holds nothing', async () => {
  const token = await sealQuery('seed=42&embed=1');
  const edited = `${token.slice(0, -6)}AAAAAA`;

  const opened = await openSealedAddress({
    pathname: '/exercises',
    search: `?s=${edited}`,
    hash: '',
  });

  expect(opened).toStrictEqual({ status: 'refused', problem: 'tampered' });
  expect(isPageAddressHeld()).toBe(false);
});

test('without a browser the page is plain', async () => {
  await expect(openSealedAddress(undefined)).resolves.toStrictEqual({
    status: 'plain',
  });
});
