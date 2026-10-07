import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

// Each rank NCBI writes, with the key its label is translated under. Written
// out rather than built from the rank, so a key the catalog lacks fails the
// type check instead of rendering raw.
const RANK_KEYS: Readonly<Record<string, ChromeKey>> = {
  realm: 'taxonomy.rank.realm',
  domain: 'taxonomy.rank.domain',
  superkingdom: 'taxonomy.rank.superkingdom',
  kingdom: 'taxonomy.rank.kingdom',
  subkingdom: 'taxonomy.rank.subkingdom',
  superphylum: 'taxonomy.rank.superphylum',
  phylum: 'taxonomy.rank.phylum',
  subphylum: 'taxonomy.rank.subphylum',
  superclass: 'taxonomy.rank.superclass',
  class: 'taxonomy.rank.class',
  subclass: 'taxonomy.rank.subclass',
  infraclass: 'taxonomy.rank.infraclass',
  cohort: 'taxonomy.rank.cohort',
  subcohort: 'taxonomy.rank.subcohort',
  superorder: 'taxonomy.rank.superorder',
  order: 'taxonomy.rank.order',
  suborder: 'taxonomy.rank.suborder',
  infraorder: 'taxonomy.rank.infraorder',
  parvorder: 'taxonomy.rank.parvorder',
  superfamily: 'taxonomy.rank.superfamily',
  family: 'taxonomy.rank.family',
  subfamily: 'taxonomy.rank.subfamily',
  tribe: 'taxonomy.rank.tribe',
  subtribe: 'taxonomy.rank.subtribe',
  genus: 'taxonomy.rank.genus',
  subgenus: 'taxonomy.rank.subgenus',
  section: 'taxonomy.rank.section',
  subsection: 'taxonomy.rank.subsection',
  series: 'taxonomy.rank.series',
  subseries: 'taxonomy.rank.subseries',
  'species group': 'taxonomy.rank.speciesGroup',
  'species subgroup': 'taxonomy.rank.speciesSubgroup',
  species: 'taxonomy.rank.species',
  'forma specialis': 'taxonomy.rank.formaSpecialis',
  subspecies: 'taxonomy.rank.subspecies',
  varietas: 'taxonomy.rank.varietas',
  subvariety: 'taxonomy.rank.subvariety',
  forma: 'taxonomy.rank.forma',
  pathogroup: 'taxonomy.rank.pathogroup',
  serogroup: 'taxonomy.rank.serogroup',
  serotype: 'taxonomy.rank.serotype',
  biotype: 'taxonomy.rank.biotype',
  genotype: 'taxonomy.rank.genotype',
  morph: 'taxonomy.rank.morph',
  strain: 'taxonomy.rank.strain',
  isolate: 'taxonomy.rank.isolate',
  'no rank': 'taxonomy.rank.noRank',
  clade: 'taxonomy.rank.clade',
  'cellular root': 'taxonomy.rank.cellularRoot',
  'acellular root': 'taxonomy.rank.acellularRoot',
};

/**
 * A rank as the reader's language names it.
 * @param t - The chrome's formatter.
 * @param rank - The rank, as NCBI writes it.
 * @returns Its label, or the rank itself when the catalog has none for it.
 */
export function rankLabel(t: Translate<ChromeKey>, rank: string): string {
  const key = Object.hasOwn(RANK_KEYS, rank) ? RANK_KEYS[rank] : undefined;
  return key === undefined ? rank : t(key);
}

/**
 * The label of a rank in the reader's language, for a site writing a rank
 * beside the lineage — a taxon's heading, a list of its children.
 * @returns `label(rank)`: the rank as NCBI writes it, named the way the chrome
 * names it; a rank the catalog does not know is returned as it is.
 */
export function useRankLabel(): (rank: string) => string {
  const t = useChromeT();
  return (rank) => rankLabel(t, rank);
}
