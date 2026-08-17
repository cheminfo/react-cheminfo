import { expect, test } from 'vitest';

import { adoptLegacyHashAddress, pathFromLegacyHash } from '../legacyHash.ts';

test('an old hash link names the path it always meant', () => {
  expect(pathFromLegacyHash('/#/tutorial/3')).toBe('/tutorial/3');
  expect(pathFromLegacyHash('#/exercises')).toBe('/exercises');
  expect(pathFromLegacyHash('https://x.org/#/tutorial/3')).toBe('/tutorial/3');
});

test('the query of the address is carried over unless asked otherwise', () => {
  expect(pathFromLegacyHash('/?embed=1#/tutorial/3')).toBe(
    '/tutorial/3?embed=1',
  );
  expect(
    pathFromLegacyHash('/?embed=1#/tutorial/3', { keepSearch: false }),
  ).toBe('/tutorial/3');
});

test('a query written inside the fragment wins over the outer one', () => {
  expect(pathFromLegacyHash('/?embed=1#/titration?analyte=CO3--')).toBe(
    '/titration?analyte=CO3--',
  );
});

test('an anchor and an address without a fragment name no page', () => {
  expect(pathFromLegacyHash('/tutorial')).toBeNull();
  expect(pathFromLegacyHash('/tutorial#results')).toBeNull();
  expect(pathFromLegacyHash('/#/')).toBeNull();
  expect(pathFromLegacyHash('/#')).toBeNull();
  expect(pathFromLegacyHash('')).toBeNull();
});

test('only a visitor sitting on the root is moved', () => {
  expect(adoptLegacyHashAddress('/?embed=1#/tutorial/3')).toBe(
    '/tutorial/3?embed=1',
  );
  expect(adoptLegacyHashAddress('#/tutorial/3')).toBe('/tutorial/3');
  expect(adoptLegacyHashAddress('/convert#/tutorial/3')).toBeNull();
  expect(adoptLegacyHashAddress('/convert')).toBeNull();
});

test('a site under a mount path adopts the link under that path', () => {
  expect(
    adoptLegacyHashAddress('/surge/#/exercises?hide=hints', {
      basePath: '/surge',
    }),
  ).toBe('/surge/exercises?hide=hints');
  expect(
    adoptLegacyHashAddress('/other/#/exercises', { basePath: '/surge' }),
  ).toBeNull();
});
