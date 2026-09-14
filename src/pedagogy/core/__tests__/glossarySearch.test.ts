import { expect, test } from 'vitest';

import type { Glossary } from '../glossary.ts';
import { listGlossary } from '../glossarySearch.ts';

const GLOSSARY: Glossary = {
  'ring closure': {
    title: 'Ring closure',
    summary: 'A digit that joins two atoms.',
    examples: [{ code: 'c1ccccc1', note: 'benzene' }],
  },
  anchor: {
    title: 'Anchor',
    summary: 'Matches a position rather than a character.',
    examples: [{ code: '^cat' }],
  },
  branch: {
    title: 'Branch',
    summary: 'A side chain between parentheses.',
    examples: [],
  },
};

test('a blank query lists every entry in alphabetical order of title', () => {
  expect(listGlossary(GLOSSARY).map((listing) => listing.key)).toStrictEqual([
    'anchor',
    'branch',
    'ring closure',
  ]);
  expect(listGlossary(GLOSSARY, ' \t ')).toHaveLength(3);
  expect(listGlossary(GLOSSARY)[0]?.entry).toBe(GLOSSARY.anchor);
});

test('a query matches the key, title, summary or example text, whatever its case', () => {
  expect(keysMatching('C1CCCCC1')).toStrictEqual(['ring closure']);
  expect(keysMatching('BENZENE')).toStrictEqual(['ring closure']);
  expect(keysMatching('parentheses')).toStrictEqual(['branch']);
  expect(keysMatching(' ANCHOR ')).toStrictEqual(['anchor']);
  expect(keysMatching('anch')).toStrictEqual(['anchor', 'branch']);
  expect(keysMatching('a')).toStrictEqual(['anchor', 'branch', 'ring closure']);
  expect(keysMatching('xyz')).toStrictEqual([]);
});

function keysMatching(query: string): string[] {
  return listGlossary(GLOSSARY, query).map((listing) => listing.key);
}

test('an example of a shape of its own is searched through its string fields', () => {
  const glossary: Glossary<{ layer: string; depth: number } | string> = {
    fixed: {
      title: 'Fixed hydrogen',
      summary: 'A layer.',
      examples: [{ layer: '/f', depth: 3 }, 'plain text'],
    },
  };

  expect(listGlossary(glossary, '/f')).toHaveLength(1);
  expect(listGlossary(glossary, 'plain')).toHaveLength(1);
  expect(listGlossary(glossary, '3')).toHaveLength(0);
});
