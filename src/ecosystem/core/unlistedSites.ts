// tokens-ok: file — every unlisted site's two colours are declared here.
import type { EcosystemSite } from './types.ts';

/**
 * Sites of the family that no other site links to yet. No menu, footer or
 * grid lists them, but `siteById` finds them, so each still draws its mark,
 * its wordmark and its palette from here. Listing one is moving its entry
 * into `ECOSYSTEM_SITES`, under the topic it already names.
 */
export const UNLISTED_SITES: readonly EcosystemSite[] = [
  {
    id: 'molecules',
    name: { lead: 'molecules', alt: 'cheminfo', dot: true },
    host: 'molecules.cheminfo.org',
    tagline: 'Look up a molecule, its computed properties and its sources.',
    group: 'research',
    brand: '#be185d',
    brandAlt: '#0f766e',
    mark: { plate: '#be185d', accent: '#5eead4' },
  },
  {
    id: 'naturals',
    name: { lead: 'naturals', alt: 'cheminfo', dot: true },
    host: 'naturals.cheminfo.org',
    tagline: 'Natural products, and the organisms they were found in.',
    group: 'research',
    // Moss, the green of the plants most natural products come from, 8.5
    // Oklab units from the nearest lead of the family.
    brand: '#365314',
    // A carotenoid orange answers it, 5.2:1 on white, and is also the plate of
    // the mark.
    brandAlt: '#c2410c',
    // The leaf is a fresh lime, so it reads as a leaf on the orange plate and
    // apart from the white ring at 16 px.
    mark: { plate: '#c2410c', accent: '#a3e635' },
  },
];
