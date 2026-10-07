/**
 * The words an organism's name is read by: the signs and abbreviations that
 * announce a rank or qualify a name, and the ordinary words a source writes
 * where a genus or an epithet would stand.
 */

/** The hybrid sign, and the letters written for it. */
export const HYBRID = new Set(['×', 'x', 'X']);
/** The word that opens a provisional bacterial name; it alone is italic. */
export const CANDIDATUS = new Set(['Candidatus', 'Ca.']);
/** Qualifiers set before the epithet they qualify, in lower case. */
export const BEFORE_EPITHET = new Set(['cf.', 'cf', 'aff.', 'aff', 'nr.']);
/** An unnamed species of the genus, in lower case. */
export const UNNAMED = new Set(['sp.', 'sp', 'spp.', 'spp']);
/** The abbreviations announcing a lower-rank epithet, in lower case. */
export const RANK_MARKERS = new Set([
  'subsp.',
  'ssp.',
  'nothosubsp.',
  'var.',
  'nothovar.',
  'subvar.',
  'f.',
  'fo.',
  'forma',
  'subf.',
  'pv.',
  'subgen.',
  'sect.',
  'subsect.',
  'ser.',
  'subser.',
]);
/** Words that open a description rather than a binomial, in lower case. */
export const NOT_GENUS = new Set([
  'unknown',
  'unidentified',
  'uncultured',
  'unclassified',
  'environmental',
  'fungal',
  'bacterial',
  'marine',
  'endophytic',
  'mixed',
  'fungus',
  'bacterium',
  'endophyte',
  'strain',
  'isolate',
  'plant',
  'soil',
  'sponge',
]);
/** Lower-case words that follow a binomial without being an epithet. */
export const NOT_EPITHET = new Set([
  'strain',
  'isolate',
  'symbiont',
  'endophyte',
  'clone',
  'group',
  'complex',
  'culture',
  'cultivar',
  'serovar',
  'biovar',
  'pathovar',
  'species',
  'incertae',
  'sedis',
  'and',
  'et',
  'ex',
  'in',
  'non',
  'sensu',
  'auct',
  'de',
  'du',
  'la',
  'le',
  'van',
  'von',
  'der',
]);
