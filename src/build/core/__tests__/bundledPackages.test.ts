import { expect, test } from 'vitest';

import { readBundledPackages } from '../bundledPackages.ts';

test('a package list reads as itself, with or without a licence', () => {
  const list = [
    { name: 'ml-matrix', version: '6.12.1', license: 'MIT', own: true },
    { name: 'fft.js', version: '4.0.4', own: false },
  ];

  expect(readBundledPackages(list)).toStrictEqual(list);
});

test('anything else reads as no list rather than throwing', () => {
  expect(readBundledPackages({ packages: [] })).toBeUndefined();
  expect(readBundledPackages(null)).toBeUndefined();
  expect(readBundledPackages([{ name: 'react' }])).toBeUndefined();
  expect(
    readBundledPackages([{ name: 'react', version: '19.3.1', own: 'no' }]),
  ).toBeUndefined();
  expect(
    readBundledPackages([
      { name: 'react', version: '19.3.1', license: 1, own: false },
    ]),
  ).toBeUndefined();
});
