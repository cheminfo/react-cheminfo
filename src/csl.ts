/**
 * References formatted as the journals print them, by citeproc-js — the
 * processor Zotero runs — in the CSL styles of the journals the family writes
 * for: CSL JSON read from Zotero, Mendeley or doi.org, the family's own
 * references turned into it, and citations and reference lists formatted from
 * it.
 *
 * Its own door because the processor and the styles weigh several hundred
 * kilobytes: they load only when something is formatted.
 */

export type { CslDate, CslItem, CslName } from './csl/core/cslItems.ts';
export {
  itemLabel,
  itemSearchText,
  itemVenue,
  readCslItems,
  readCslText,
} from './csl/core/cslItems.ts';
export { CSL_STYLE_IDS, hasCslStyle } from './csl/core/cslStyles.ts';
export type { CslOutput, FormattedCslCitations } from './csl/core/formatCsl.ts';
export { formatCslCitations, formatCslEntries } from './csl/core/formatCsl.ts';
export { referenceToCsl } from './csl/core/referenceItem.ts';
