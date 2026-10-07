/**
 * The ranks of the NCBI Taxonomy, from the top of the tree down.
 *
 * NCBI also files taxa under ranks that are not steps of a hierarchy — `no
 * rank`, `clade`, the two roots — and those are deliberately absent here: a
 * clade can sit anywhere, so it has no place in an order.
 */

/**
 * Every rank NCBI places in its hierarchy, from the top down.
 *
 * `realm` heads the viruses and `domain` the cellular organisms, the name NCBI
 * gave in 2025 to what it called `superkingdom` before; all three stand at the
 * top, so a lineage read from an older dump sorts the same way.
 */
export const TAXON_RANKS = [
  'realm',
  'domain',
  'superkingdom',
  'kingdom',
  'subkingdom',
  'superphylum',
  'phylum',
  'subphylum',
  'superclass',
  'class',
  'subclass',
  'infraclass',
  'cohort',
  'subcohort',
  'superorder',
  'order',
  'suborder',
  'infraorder',
  'parvorder',
  'superfamily',
  'family',
  'subfamily',
  'tribe',
  'subtribe',
  'genus',
  'subgenus',
  'section',
  'subsection',
  'series',
  'subseries',
  'species group',
  'species subgroup',
  'species',
  'forma specialis',
  'subspecies',
  'varietas',
  'subvariety',
  'forma',
  'pathogroup',
  'serogroup',
  'serotype',
  'biotype',
  'genotype',
  'morph',
  'strain',
  'isolate',
] as const;

/** A rank of the NCBI hierarchy. */
export type TaxonRank = (typeof TAXON_RANKS)[number];

/**
 * The ranks a lineage is summarised by: the eight a textbook names, with the
 * three names the top of the tree goes by.
 */
export const PRINCIPAL_RANKS = [
  'realm',
  'domain',
  'superkingdom',
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'species',
] as const satisfies readonly TaxonRank[];

const ORDER = new Map<string, number>();
for (let index = 0; index < TAXON_RANKS.length; index++) {
  ORDER.set(TAXON_RANKS[index] as string, index);
}

const PRINCIPAL = new Set<string>(PRINCIPAL_RANKS);

const GENUS = ORDER.get('genus') ?? 0;

/**
 * Where a rank stands in the hierarchy.
 * @param rank - The rank, as NCBI writes it.
 * @returns Its position from the top, 0 for `realm`, or `undefined` for a
 * rank that is not a step of the hierarchy (`no rank`, `clade`).
 */
export function rankOrder(rank: string): number | undefined {
  return ORDER.get(rank);
}

/**
 * Whether a rank is one a lineage is summarised by.
 * @param rank - The rank, as NCBI writes it.
 * @returns Whether it is one of {@link PRINCIPAL_RANKS}.
 */
export function isPrincipalRank(rank: string): boolean {
  return PRINCIPAL.has(rank);
}

/**
 * Whether a rank is the genus or one under it — the ranks whose names
 * nomenclature sets in italics.
 * @param rank - The rank, as NCBI writes it.
 * @returns `false` for a rank above the genus and for one with no place in the
 * hierarchy.
 */
export function isGenusOrBelow(rank: string): boolean {
  const order = ORDER.get(rank);
  return order !== undefined && order >= GENUS;
}

/**
 * Whether a rank stands above the genus, so its name is set upright.
 * @param rank - The rank, as NCBI writes it.
 * @returns `false` for the genus and below, and for a rank with no place in
 * the hierarchy.
 */
export function isAboveGenus(rank: string): boolean {
  const order = ORDER.get(rank);
  return order !== undefined && order < GENUS;
}
