/** The sites the menu links to, in the order they are listed. */
export type SiteId =
  | 'inchi'
  | 'vcl'
  | 'smiles'
  | 'chemcalc'
  | 'nmrium'
  | 'surge'
  | 'tex'
  | 'lcao'
  | 'regexp'
  | 'pdb'
  | 'elucidation'
  | 'equilibrium'
  | 'polycarp';

export interface SiteName {
  /** First half of the name, set in the site's leading colour. */
  lead: string;
  /** Second half, set in the site's answering colour. */
  alt: string;
  /**
   * Whether a faint dot separates the two halves, as an address-shaped name
   * takes and a product-shaped one does not.
   * @default false
   */
  dot?: boolean;
}

export interface EcosystemSite {
  id: SiteId;
  /** The name, split the way the site's own wordmark splits it. */
  name: SiteName;
  /** Where the site lives, written the way it is typed. */
  host: string;
  /** One line on what the site does. */
  tagline: string;
  /** The colour the first half of the name is set in. */
  brand: string;
  /**
   * The colour the second half is set in. It is the site's answering colour
   * darkened until it is readable on white, because several of those are
   * yellows and ambers that sit around 2:1 there.
   */
  brandAlt: string;
  /** The plate of the site's mark, and the colour one element of it carries. */
  mark: SiteMarkColors;
}

export interface SiteMarkColors {
  /** The rounded square the mark is drawn on. */
  plate: string;
  /** The colour exactly one element of the mark takes. */
  accent: string;
  /**
   * The hairline a plate as light as the tile behind it needs, so it still
   * reads as a plate rather than as a drawing floating on the row.
   * @default undefined
   */
  edge?: string;
}

/**
 * Every site of the family, each with the two colours it owns. The marks that
 * go with them live in `marks.tsx`.
 */
export const ECOSYSTEM_SITES: readonly EcosystemSite[] = [
  {
    id: 'inchi',
    name: { lead: 'inchi', alt: 'cheminfo', dot: true },
    host: 'inchi.cheminfo.org',
    tagline: 'InChI and InChIKey from a structure, in the browser.',
    brand: '#5b21b6',
    brandAlt: '#a16207',
    mark: { plate: '#5b21b6', accent: '#fcd34d' },
  },
  {
    id: 'vcl',
    name: { lead: 'vcl', alt: 'cheminfo', dot: true },
    host: 'vcl.cheminfo.org',
    tagline: 'Combine a core and fragments into a screened library.',
    brand: '#2d72d2',
    brandAlt: '#9a3412',
    mark: { plate: '#2d72d2', accent: '#eb6847' },
  },
  {
    id: 'smiles',
    name: { lead: 'smiles', alt: 'cheminfo', dot: true },
    host: 'smiles.cheminfo.org',
    tagline: 'Draw a structure, read its SMILES, learn the notation.',
    brand: '#1c6e42',
    brandAlt: '#9a3412',
    mark: { plate: '#1c6e42', accent: '#ea580c' },
  },
  {
    id: 'chemcalc',
    name: { lead: 'Chem', alt: 'Calc' },
    host: 'www.chemcalc.org',
    tagline: 'Molecular formula, exact mass and isotopic distribution.',
    brand: '#5b52e0',
    brandAlt: '#0d9488',
    mark: { plate: '#5b52e0', accent: '#09d3ac' },
  },
  {
    id: 'nmrium',
    name: { lead: 'NMR', alt: 'ium' },
    host: 'www.nmrium.org',
    tagline: 'Process and assign NMR spectra in the browser.',
    brand: '#ea580c',
    brandAlt: '#2b143e',
    mark: { plate: '#2b143e', accent: '#ea580c' },
  },
  {
    id: 'surge',
    name: { lead: 'surge', alt: 'cheminfo', dot: true },
    host: 'surge.cheminfo.org',
    tagline: 'Every constitutional isomer of a molecular formula.',
    brand: '#4338ca',
    brandAlt: '#be123c',
    mark: { plate: '#4338ca', accent: '#e11d48' },
  },
  {
    id: 'tex',
    name: { lead: 'tex', alt: 'cheminfo', dot: true },
    host: 'tex.cheminfo.org',
    tagline: 'LaTeX formulas rendered to SVG or PNG from a URL.',
    brand: '#a21caf',
    brandAlt: '#a16207',
    mark: { plate: '#a21caf', accent: '#facc15' },
  },
  {
    id: 'lcao',
    name: { lead: 'lcao', alt: 'cheminfo', dot: true },
    host: 'lcao.cheminfo.org',
    tagline: 'Combine atomic orbitals into molecular ones.',
    brand: '#1565c0',
    brandAlt: '#c62828',
    mark: { plate: '#ffffff', accent: '#c62828', edge: '#dfe3e8' },
  },
  {
    id: 'regexp',
    name: { lead: 'regexp', alt: 'cheminfo', dot: true },
    host: 'regexp.cheminfo.org',
    tagline: 'Learn regular expressions in a live playground.',
    brand: '#1e3a8a',
    brandAlt: '#a16207',
    mark: { plate: '#1e3a8a', accent: '#fde047' },
  },
  {
    id: 'pdb',
    name: { lead: 'pdb', alt: 'cheminfo', dot: true },
    host: 'pdb.cheminfo.org',
    tagline: 'A fast look at any Protein Data Bank entry.',
    brand: '#2563eb',
    brandAlt: '#b45309',
    mark: { plate: '#2563eb', accent: '#fbbf24' },
  },
  {
    id: 'elucidation',
    name: { lead: 'elucidation', alt: 'cheminfo', dot: true },
    host: 'elucidation.cheminfo.org',
    tagline: 'A structure from a 1H NMR spectrum and a formula.',
    brand: '#7e22ce',
    brandAlt: '#b45309',
    mark: { plate: '#7e22ce', accent: '#f59e0b' },
  },
  {
    id: 'equilibrium',
    name: { lead: 'Equi', alt: 'Librium' },
    host: 'equilibrium.cheminfo.org',
    tagline: 'Chemical equilibria: pH, speciation and titration curves.',
    brand: '#0b5754',
    brandAlt: '#a56600',
    mark: { plate: '#0b5754', accent: '#f2a71b' },
  },
  {
    id: 'polycarp',
    name: { lead: 'Poly', alt: 'Carp' },
    host: 'polycarp.cheminfo.org',
    tagline: 'Predict the microstructure of a radical copolymerisation.',
    brand: '#0d1d37',
    brandAlt: '#0c9ba3',
    mark: { plate: '#0d1d37', accent: '#0c9ba3' },
  },
];

/**
 * The address of a site, which is its host over https.
 * @param site - The site being linked to.
 * @returns The URL to open.
 */
export function siteUrl(site: EcosystemSite): string {
  return `https://${site.host}/`;
}
