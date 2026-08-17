import type { NavItem } from '../src/chrome/ui/navItem.ts';
import type { SiteId } from '../src/ecosystem/core/sites.ts';

/** The page smiles.cheminfo.org opens on. */
export const DRAW_PAGE: NavItem = {
  id: 'draw',
  label: 'Draw',
  href: '/',
  icon: 'edit',
};

/** The pages smiles.cheminfo.org lists, in the order its bar writes them. */
export const SMILES_PAGES: readonly NavItem[] = [
  DRAW_PAGE,
  { id: 'tutorial', label: 'Tutorial', href: '/tutorial', icon: 'learning' },
  { id: 'exercises', label: 'Exercises', href: '/exercises', icon: 'lab-test' },
  {
    id: 'cheatsheet',
    label: 'Cheatsheet',
    href: '/cheatsheet',
    icon: 'th-list',
  },
];

/** The pages of the tutorial half of smiles.cheminfo.org, for a header menu. */
export const LEARN_PAGES: readonly NavItem[] = [
  { id: 'tutorial', label: 'Tutorial', href: '/tutorial', icon: 'learning' },
  { id: 'exercises', label: 'Exercises', href: '/exercises', icon: 'lab-test' },
  {
    id: 'cheatsheet',
    label: 'Cheatsheet',
    href: '/cheatsheet',
    icon: 'th-list',
  },
  {
    id: 'specification',
    label: 'OpenSMILES',
    href: 'https://opensmiles.org/opensmiles.html',
    icon: 'document-open',
    external: true,
  },
];

/** One site of the family, with the pages its own bar carries. */
export interface SiteBar {
  /** The site the bar belongs to. */
  siteId: SiteId;
  /** Its pages, in the order it lists them. */
  nav: readonly NavItem[];
  /** Which of them is on show. */
  activeId: string;
}

/**
 * Four sites with their real pages, so a reader can check that the bar itself
 * never changes — only the two colours and the addresses do.
 */
export const SITE_BARS: readonly SiteBar[] = [
  { siteId: 'smiles', nav: SMILES_PAGES, activeId: 'draw' },
  {
    siteId: 'chemcalc',
    activeId: 'formula',
    nav: [
      { id: 'formula', label: 'Formula', href: '/', icon: 'calculator' },
      {
        id: 'isotopes',
        label: 'Isotopic distribution',
        href: '/isotopic-distribution',
        icon: 'timeline-bar-chart',
      },
      { id: 'peptide', label: 'Peptide', href: '/peptide', icon: 'link' },
      {
        id: 'exercises',
        label: 'Exercises',
        href: '/exercises',
        icon: 'lab-test',
      },
    ],
  },
  {
    siteId: 'surge',
    activeId: 'isomers',
    nav: [
      { id: 'isomers', label: 'Isomers', href: '/', icon: 'graph' },
      {
        id: 'exercises',
        label: 'Exercises',
        href: '/exercises',
        icon: 'lab-test',
      },
      { id: 'api', label: 'API', href: '/api', icon: 'code' },
    ],
  },
  {
    siteId: 'regexp',
    activeId: 'playground',
    nav: [
      {
        id: 'tutorial',
        label: 'Tutorial',
        href: '/tutorial',
        icon: 'learning',
      },
      {
        id: 'playground',
        label: 'Playground',
        href: '/playground',
        icon: 'console',
      },
      {
        id: 'exercises',
        label: 'Exercises',
        href: '/exercises',
        icon: 'lab-test',
      },
      {
        id: 'cheatsheet',
        label: 'Cheatsheet',
        href: '/cheatsheet',
        icon: 'th-list',
      },
    ],
  },
];

/**
 * Caffeine, so a page under a bar has something honest to show. The formula is
 * left out on purpose: a molecular formula is rendered by `react-mf`, which
 * this package does not depend on.
 */
export const CAFFEINE = {
  name: 'Caffeine',
  smiles: 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C',
  monoisotopicMass: '194.0804',
  inchiKey: 'RYYVLZVUVIJVGH-UHFFFAOYSA-N',
};

/** A callback for a control whose dialog is the site's own business. */
export function noop(): void {
  // the stories show the bar, never what its utilities open
}
