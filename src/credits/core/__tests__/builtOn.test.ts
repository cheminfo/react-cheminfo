import { expect, test } from 'vitest';

import { builtOnGroups } from '../builtOn.ts';
import { credits } from '../credits.ts';

test('the works a site credits split into ours and others, in its order', () => {
  const { own, others } = builtOnGroups(
    credits(['react', 'openchemlib', 'blueprint', 'react-cheminfo']),
    [],
  );

  expect(own.works.map((work) => work.id)).toStrictEqual([
    'openchemlib',
    'react-cheminfo',
  ]);
  expect(others.works.map((work) => work.id)).toStrictEqual([
    'react',
    'blueprint',
  ]);
  expect(own.packages).toStrictEqual([]);
  expect(others.packages).toStrictEqual([]);
});

test('the rest of the build follows, each package linked to npm', () => {
  const { own, others } = builtOnGroups(credits(['openchemlib']), [
    { name: 'mf-parser', version: '3.1.0', license: 'MIT', own: true },
    { name: 'zod', version: '4.0.0', own: false },
  ]);

  expect(own.packages).toStrictEqual([
    {
      name: 'mf-parser',
      href: 'https://www.npmjs.com/package/mf-parser',
      versions: '3.1.0',
      license: 'MIT',
    },
  ]);
  expect(others.packages).toStrictEqual([
    {
      name: 'zod',
      href: 'https://www.npmjs.com/package/zod',
      versions: '4.0.0',
    },
  ]);
});

test('a package the site already credits is not written twice', () => {
  const { own, others } = builtOnGroups(credits(['openchemlib', 'blueprint']), [
    {
      name: 'openchemlib',
      version: '9.0.0',
      license: 'BSD-3-Clause',
      own: true,
    },
    {
      name: '@blueprintjs/core',
      version: '6.0.0',
      license: 'Apache-2.0',
      own: false,
    },
    {
      name: '@blueprintjs/icons',
      version: '6.0.0',
      license: 'Apache-2.0',
      own: false,
    },
  ]);

  expect(own.packages).toStrictEqual([]);
  expect(others.packages.map((row) => row.name)).toStrictEqual([
    '@blueprintjs/icons',
  ]);
});

test('two versions of a package are one row naming both', () => {
  const { others } = builtOnGroups(
    [],
    [
      { name: 'pako', version: '1.0.11', license: 'MIT', own: false },
      { name: 'pako', version: '2.1.0', license: 'MIT', own: false },
    ],
  );

  expect(others.packages).toStrictEqual([
    {
      name: 'pako',
      href: 'https://www.npmjs.com/package/pako',
      versions: '1.0.11, 2.1.0',
      license: 'MIT',
    },
  ]);
});
