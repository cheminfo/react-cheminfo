/**
 * A lineage: the taxa from the top of the tree of life down to one of them.
 *
 * It is read three ways, because the family meets it in three shapes: a map of
 * NCBI nodes each pointing at its parent (what a database built on the NCBI
 * dump answers), a record of names by rank (what octochemdb stores), or a list
 * already in order.
 */

import {
  TAXON_RANKS,
  isGenusOrBelow,
  isPrincipalRank,
  rankOrder,
} from './ranks.ts';

/** One taxon of a lineage. */
export interface Taxon {
  /** The rank, as NCBI writes it: `genus`, `no rank`, `clade`… */
  rank: string;
  /** The scientific name. */
  name: string;
  /**
   * The NCBI Taxonomy id.
   * @default undefined — the taxon is known by its name alone
   */
  taxId?: number;
}

/** The taxa from the top of the tree down to one of them, in that order. */
export type TaxonLineage = readonly Taxon[];

/** A taxon of the NCBI tree, as a map of nodes holds it. */
export interface TaxonNode {
  /** The scientific name. */
  name: string;
  /** The rank, as NCBI writes it. */
  rank: string;
  /** The id of the taxon above; the root is its own parent. */
  parentId: number;
}

/**
 * The taxa a lineage is summarised by: those of a principal rank (domain,
 * kingdom, phylum, class, order, family, genus, species), and the last one
 * whatever its rank, since it is the taxon the lineage leads to.
 *
 * An NCBI placeholder for an unidentified species ('Streptomyces sp.') says
 * no more than its genus, so it is left out and the genus is the leaf. The
 * root, 'cellular organisms', the clades and the steps of no rank above the
 * leaf never show.
 * @param lineage - The lineage, from the top down.
 * @returns The taxa kept, in the same order.
 */
export function principalLineage(lineage: TaxonLineage): Taxon[] {
  const kept: Taxon[] = [];
  let last = lineage.length - 1;
  if (last > 0 && isPlaceholderTaxon(lineage[last] as Taxon)) {
    // The genus becomes the leaf, past 'unclassified Streptomyces'.
    last--;
    while (last > 0 && !isPrincipalRank((lineage[last] as Taxon).rank)) last--;
  }
  for (let index = 0; index <= last; index++) {
    const taxon = lineage[index] as Taxon;
    if (index < last && isPlaceholderTaxon(taxon)) continue;
    if (index === last || isPrincipalRank(taxon.rank)) kept.push(taxon);
  }
  return kept;
}

/**
 * Whether a taxon is an NCBI placeholder for an unidentified species of a
 * genus: a species named the genus and 'sp.', such as 'Streptomyces sp.'.
 * One named for a strain ('Streptomyces sp. CNQ-509') is a taxon of its own.
 * @param taxon - The taxon.
 * @returns Whether it is one.
 */
export function isPlaceholderTaxon(taxon: Taxon): boolean {
  return taxon.rank === 'species' && /\ssp\.$/.test(taxon.name);
}

/**
 * The lineage of a taxon, walked up a map of NCBI nodes to the root.
 * @param nodes - The nodes, by id: a record keyed by the id written as a
 * string, as JSON delivers it, or a map keyed by the number.
 * @param taxId - The taxon to start from.
 * @returns Every taxon from the root down to it, each with its id; empty when
 * the map does not hold the taxon.
 */
export function lineageFromNodes(
  nodes: Readonly<Record<string, TaxonNode>> | ReadonlyMap<number, TaxonNode>,
  taxId: number,
): Taxon[] {
  const read =
    nodes instanceof Map
      ? (id: number) => nodes.get(id)
      : (id: number) =>
          (nodes as Readonly<Record<string, TaxonNode>>)[String(id)];
  const upward: Taxon[] = [];
  const seen = new Set<number>();
  let id = taxId;
  while (!seen.has(id)) {
    const node = read(id);
    if (node === undefined) break;
    seen.add(id);
    upward.push({ rank: node.rank, name: node.name, taxId: id });
    id = node.parentId;
  }
  return upward.toReversed();
}

/**
 * The lineage written by a record of names by rank, the shape octochemdb
 * stores (`{ kingdom: 'Fungi', genus: 'Penicillium', … }`).
 *
 * A key is matched whatever its case, so `superKingdom` reads as
 * `superkingdom`; a key that names no rank, and an empty name, are left out.
 * @param ranks - The names, by rank.
 * @returns The taxa, from the top down.
 */
export function lineageFromRanks(
  ranks: Readonly<Record<string, string | null | undefined>>,
): Taxon[] {
  const byRank = new Map<string, string>();
  for (const key of Object.keys(ranks)) {
    const name = ranks[key]?.trim();
    if (name === undefined || name === '') continue;
    const rank = key.toLowerCase();
    if (rankOrder(rank) !== undefined) byRank.set(rank, name);
  }
  const lineage: Taxon[] = [];
  for (const rank of TAXON_RANKS) {
    const name = byRank.get(rank);
    if (name !== undefined) lineage.push({ rank, name });
  }
  return lineage;
}

/**
 * Which taxa of a lineage sit at the genus or under it — the ones whose names
 * nomenclature sets in italics.
 *
 * A taxon with no rank (a clade, a strain NCBI left unranked) takes the place
 * of the taxa above it: under a genus it is one of the genus's, above it it is
 * a clade like Embryophyta, written upright.
 * @param lineage - The lineage, from the top down.
 * @returns One flag per taxon.
 */
export function genusOrBelow(lineage: TaxonLineage): boolean[] {
  const flags: boolean[] = [];
  let below = false;
  for (const taxon of lineage) {
    if (isGenusOrBelow(taxon.rank)) {
      below = true;
    } else if (rankOrder(taxon.rank) !== undefined) {
      below = false;
    }
    flags.push(below);
  }
  return flags;
}
