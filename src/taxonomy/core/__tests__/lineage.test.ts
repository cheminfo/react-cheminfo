import { expect, test } from 'vitest';

import type { Taxon, TaxonNode } from '../lineage.ts';
import {
  genusOrBelow,
  isPlaceholderTaxon,
  lineageFromNodes,
  lineageFromRanks,
  principalLineage,
} from '../lineage.ts';
import { ncbiTaxonomyUrl } from '../ncbi.ts';

// Penicillium chrysogenum as the NCBI dump of 2025 files it, root included.
const NODES: Record<string, TaxonNode> = {
  '1': { name: 'root', rank: 'no rank', parentId: 1 },
  '131567': { name: 'cellular organisms', rank: 'cellular root', parentId: 1 },
  '2759': { name: 'Eukaryota', rank: 'domain', parentId: 131_567 },
  '33154': { name: 'Opisthokonta', rank: 'clade', parentId: 2759 },
  '4751': { name: 'Fungi', rank: 'kingdom', parentId: 33_154 },
  '4890': { name: 'Ascomycota', rank: 'phylum', parentId: 4751 },
  '147545': { name: 'Eurotiomycetes', rank: 'class', parentId: 4890 },
  '5042': { name: 'Eurotiales', rank: 'order', parentId: 147_545 },
  '1131492': { name: 'Aspergillaceae', rank: 'family', parentId: 5042 },
  '5073': { name: 'Penicillium', rank: 'genus', parentId: 1_131_492 },
  '5076': {
    name: 'Penicillium chrysogenum',
    rank: 'species',
    parentId: 5073,
  },
  '500485': {
    name: 'Penicillium chrysogenum Wisconsin 54-1255',
    rank: 'strain',
    parentId: 5076,
  },
};

test('a lineage is walked up the nodes to the root, and read from the top', () => {
  const lineage = lineageFromNodes(NODES, 5076);

  expect(lineage.map((taxon) => taxon.taxId)).toStrictEqual([
    1, 131_567, 2759, 33_154, 4751, 4890, 147_545, 5042, 1_131_492, 5073, 5076,
  ]);
  expect(lineage[2]).toStrictEqual({
    rank: 'domain',
    name: 'Eukaryota',
    taxId: 2759,
  } satisfies Taxon);
});

test('a map keyed by number walks the same way', () => {
  const map = new Map(
    Object.entries(NODES).map(([id, node]) => [Number(id), node]),
  );

  expect(lineageFromNodes(map, 5073)).toStrictEqual(
    lineageFromNodes(NODES, 5073),
  );
});

test('an unknown taxon has no lineage, and a cycle ends the walk', () => {
  expect(lineageFromNodes(NODES, 42)).toStrictEqual([]);

  const looped: Record<string, TaxonNode> = {
    '10': { name: 'A', rank: 'genus', parentId: 11 },
    '11': { name: 'B', rank: 'family', parentId: 10 },
  };

  expect(lineageFromNodes(looped, 10).map((taxon) => taxon.name)).toStrictEqual(
    ['B', 'A'],
  );
});

test('the principal ranks are kept, the root and the clades left out', () => {
  const lineage = principalLineage(lineageFromNodes(NODES, 5076));

  expect(lineage.map((taxon) => `${taxon.rank}:${taxon.name}`)).toStrictEqual([
    'domain:Eukaryota',
    'kingdom:Fungi',
    'phylum:Ascomycota',
    'class:Eurotiomycetes',
    'order:Eurotiales',
    'family:Aspergillaceae',
    'genus:Penicillium',
    'species:Penicillium chrysogenum',
  ]);
});

test('the leaf is kept whatever its rank', () => {
  const strain = principalLineage(lineageFromNodes(NODES, 500_485));
  const clade = principalLineage(lineageFromNodes(NODES, 33_154));

  expect(strain.at(-1)?.name).toBe('Penicillium chrysogenum Wisconsin 54-1255');
  expect(strain).toHaveLength(9);
  expect(clade.map((taxon) => taxon.name)).toStrictEqual([
    'Eukaryota',
    'Opisthokonta',
  ]);
  expect(principalLineage([])).toStrictEqual([]);
});

test('an NCBI placeholder shows as its genus', () => {
  // Streptomyces sp. as NCBI files it, under 'unclassified Streptomyces'.
  const nodes: Record<string, TaxonNode> = {
    '1': { name: 'root', rank: 'no rank', parentId: 1 },
    '131567': {
      name: 'cellular organisms',
      rank: 'cellular root',
      parentId: 1,
    },
    '2': { name: 'Bacteria', rank: 'domain', parentId: 131_567 },
    '1883': { name: 'Streptomyces', rank: 'genus', parentId: 2 },
    '2593676': {
      name: 'unclassified Streptomyces',
      rank: 'no rank',
      parentId: 1883,
    },
    '1931': { name: 'Streptomyces sp.', rank: 'species', parentId: 2_593_676 },
    '1286771': {
      name: 'Streptomyces sp. CNQ-509',
      rank: 'species',
      parentId: 2_593_676,
    },
  };

  expect(
    principalLineage(lineageFromNodes(nodes, 1931)).map((taxon) => taxon.name),
  ).toStrictEqual(['Bacteria', 'Streptomyces']);
  expect(
    principalLineage(lineageFromNodes(nodes, 1_286_771)).map(
      (taxon) => taxon.name,
    ),
  ).toStrictEqual(['Bacteria', 'Streptomyces', 'Streptomyces sp. CNQ-509']);
  expect(lineageFromNodes(nodes, 1931)).toHaveLength(6);
  expect(
    isPlaceholderTaxon({ rank: 'species', name: 'Streptomyces sp.' }),
  ).toBe(true);
  expect(
    isPlaceholderTaxon({ rank: 'species', name: 'Streptomyces sp. CNQ-509' }),
  ).toBe(false);
  expect(isPlaceholderTaxon({ rank: 'genus', name: 'Foo sp.' })).toBe(false);
});

test('a record of names by rank reads as a lineage, as octochemdb stores it', () => {
  expect(
    lineageFromRanks({
      species: 'Penicillium chrysogenum',
      superKingdom: 'Eukaryota',
      kingdom: 'Fungi',
      phylum: '',
      genus: 'Penicillium',
      family: 'Aspergillaceae',
      colour: 'green',
      order: undefined,
    }),
  ).toStrictEqual([
    { rank: 'superkingdom', name: 'Eukaryota' },
    { rank: 'kingdom', name: 'Fungi' },
    { rank: 'family', name: 'Aspergillaceae' },
    { rank: 'genus', name: 'Penicillium' },
    { rank: 'species', name: 'Penicillium chrysogenum' },
  ] satisfies Taxon[]);
});

test('the taxa under a genus are the ones written in italics', () => {
  const lineage = lineageFromNodes(NODES, 500_485);

  expect(genusOrBelow(lineage)).toStrictEqual([
    false, // root
    false, // cellular organisms
    false, // Eukaryota
    false, // Opisthokonta, a clade above the genus
    false,
    false,
    false,
    false,
    false,
    true, // Penicillium
    true,
    true, // the strain
  ]);
  expect(
    genusOrBelow([
      { rank: 'genus', name: 'Penicillium' },
      { rank: 'no rank', name: 'unclassified Penicillium' },
    ]),
  ).toStrictEqual([true, true]);
});

test('a taxon links to its page in the NCBI Taxonomy Browser', () => {
  expect(ncbiTaxonomyUrl(5076)).toBe(
    'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=5076',
  );
});
