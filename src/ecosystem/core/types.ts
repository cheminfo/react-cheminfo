import type { SiteGroupId } from './groups.ts';

/** The sites the menu links to. */
export type SiteId =
  | 'learn'
  | 'inchi'
  | 'vcl'
  | 'smiles'
  | 'openbabel'
  | 'chemcalc'
  | 'dbe'
  | 'nmrium'
  | 'metabo'
  | 'derepflow'
  | 'surge'
  | 'tex'
  | 'lcao'
  | 'regexp'
  | 'pdb'
  | 'elucidation'
  | 'equilibrium'
  | 'polycarp'
  | '3d'
  | 'periodic-table'
  | 'database'
  | 'ocl-cache'
  | 'symmetry'
  | 'osiris';

/** A site's name, split the way its own wordmark splits it. */
export interface SiteName {
  /**
   * First half of the name, set in the site's leading colour unless `ink`
   * names it.
   */
  lead: string;
  /** Second half, set in the site's answering colour. */
  alt: string;
  /**
   * Whether a faint dot separates the two halves, as an address-shaped name
   * takes and a product-shaped one does not.
   * @default false
   */
  dot?: boolean;
  /**
   * The half a site's own wordmark sets in the family's ink rather than in a
   * colour. The other half then carries `brand`, so a site whose logo spends
   * its one colour on the second half is written the way it is drawn.
   * @default undefined
   */
  ink?: 'lead' | 'alt';
}

/** One site of the family: its name, address, topic and two colours. */
export interface EcosystemSite {
  /** The identifier every component and helper names the site by. */
  id: SiteId;
  /** The name, split the way the site's own wordmark splits it. */
  name: SiteName;
  /** Where the site lives, written the way it is typed. */
  host: string;
  /** Where the sources live, and what a Source link opens. */
  repository: string;
  /** One line on what the site does. */
  tagline: string;
  /**
   * The topic the site is written under, which is what decides where it sits
   * in the menu and in the footer.
   */
  group: SiteGroupId;
  /**
   * The colour the name is written in — the first half, or the second when
   * `name.ink` leaves the first in the family's ink.
   */
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

/** The colours a site's mark is drawn in. */
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
