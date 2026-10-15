import { expect, test } from 'vitest';

import type { CreditEntry } from '../credits.ts';
import { CREDITS, creditOf, credits } from '../credits.ts';

test('the works come back in the order they were asked for', () => {
  const listed = credits(['molstar', 'openchemlib', 'blueprint']);

  expect(listed.map((entry) => entry.name)).toStrictEqual([
    'Mol*',
    'OpenChemLib',
    'Blueprint',
  ]);
});

test('an entry carries its name, address, sentence and licence', () => {
  expect(credits(['openchemlib'])).toStrictEqual([
    {
      id: 'openchemlib',
      name: 'OpenChemLib',
      href: 'https://github.com/cheminfo/openchemlib-js',
      description:
        'reads and writes structures, and computes their properties in the browser.',
      license: 'BSD-3-Clause',
    },
  ]);
});

test('wikidata credits its sources, its reader and its search', () => {
  expect(
    credits(['wikipedia', 'wikidata', 'wtf-wikipedia', 'openchemlib-sqlite']),
  ).toStrictEqual([
    {
      id: 'wikipedia',
      name: 'Wikipedia',
      href: 'https://en.wikipedia.org/',
      description:
        'the articles, and the Chembox and Drugbox infoboxes every value is read from.',
      license: 'CC-BY-SA-4.0',
    },
    {
      id: 'wikidata',
      name: 'Wikidata',
      href: 'https://www.wikidata.org/',
      description:
        'the name of every compound in every language, and its article in each Wikipedia.',
      license: 'CC0-1.0',
    },
    {
      id: 'wtf-wikipedia',
      name: 'wtf_wikipedia',
      href: 'https://github.com/spencermountain/wtf_wikipedia',
      description:
        'reads the wikitext of an article and its templates into plain values.',
      license: 'MIT',
    },
    {
      id: 'openchemlib-sqlite',
      name: 'openchemlib-sqlite',
      href: 'https://github.com/cheminfo/openchemlib-sqlite',
      description: 'the substructure and similarity search, inside SQLite.',
      license: 'MIT',
    },
  ]);
});

test('an unknown work is reported rather than quietly dropped', () => {
  // @ts-expect-error the registry has no such work, which is the point.
  expect(() => credits(['jsmol'])).toThrow('unknown credit: jsmol');
});

test('asking for nothing lists nothing', () => {
  expect(credits([])).toStrictEqual([]);
});

test('the same work asked for twice is listed twice', () => {
  expect(credits(['nivo', 'nivo']).map((entry) => entry.id)).toStrictEqual([
    'nivo',
    'nivo',
  ]);
});

test('react-ocl and react-mf are published by zakodium-oss', () => {
  expect(creditOf('react-ocl')?.href).toBe(
    'https://github.com/zakodium-oss/react-ocl',
  );
  expect(creditOf('react-mf')?.href).toBe(
    'https://github.com/zakodium-oss/react-mf',
  );
  expect(creditOf('react-science')?.href).toBe(
    'https://github.com/zakodium-oss/react-science',
  );
});

test('the works every site borrows are all in the registry', () => {
  const ids = CREDITS.map((entry) => entry.id);

  for (const id of [
    'openchemlib',
    'react-ocl',
    'react-mf',
    'molstar',
    'blueprint',
    'react-science',
    'nivo',
    'mathjax',
  ]) {
    expect(ids).toContain(id);
  }
});

test('no work is registered twice, and each one is reachable', () => {
  const ids = CREDITS.map((entry) => entry.id);

  expect(new Set(ids).size).toBe(ids.length);
  expect(CREDITS).toHaveLength(39);
});

test('every entry names a work, an address and what it does', () => {
  // Read through the interface: a work with no licence of its own — a data
  // source rather than a package — is allowed, and `CreditsList` already omits
  // the line for it.
  for (const entry of CREDITS as readonly CreditEntry[]) {
    expect(entry.name).not.toBe('');
    expect(entry.href.startsWith('https://')).toBe(true);
    expect(entry.description.endsWith('.')).toBe(true);
    expect(entry.license).not.toBe('');
  }
});

test('a work the registry does not hold comes back as undefined', () => {
  expect(creditOf('jsmol')).toBeUndefined();
});
