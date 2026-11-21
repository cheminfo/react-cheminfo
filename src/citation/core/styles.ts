/**
 * The journal styles a Cite menu copies a reference in: each a CSL style
 * formatted by citeproc-js, as Zotero formats it, named by the CSL id that
 * `react-cheminfo/csl` loads, beside journals that ask for it.
 */

/** One entry of the style submenu. */
export interface CitationStyle {
  /** The CSL style, `american-chemical-society`. */
  id: string;
  /** Name of the style. */
  label: string;
  /** Journals that ask for it, shown on the right of the entry. */
  hint: string;
}

/** Every style offered, in the order the menu lists them. */
export const CITATION_STYLES = [
  { id: 'american-chemical-society', label: 'ACS', hint: 'JACS, Org. Lett.' },
  { id: 'nature', label: 'Nature', hint: 'Nature, Nat. Chem.' },
  {
    id: 'royal-society-of-chemistry',
    label: 'RSC',
    hint: 'Chem. Sci., Green Chem.',
  },
  {
    id: 'angewandte-chemie',
    label: 'Angewandte',
    hint: 'Angew. Chem., ChemMedChem',
  },
] as const satisfies readonly CitationStyle[];

/** A style of the menu, by its CSL id. */
export type CitationStyleId = (typeof CITATION_STYLES)[number]['id'];
