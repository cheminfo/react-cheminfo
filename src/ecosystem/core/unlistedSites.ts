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
    id: 'mz',
    name: { lead: 'mz', alt: 'cheminfo', dot: true },
    host: 'mz.cheminfo.org',
    tagline: 'Mass spectra, classified by how they were measured.',
    group: 'spectra',
    // Ultramarine, the deep blue of a dye whose colour is its spectrum.
    brand: '#2200c4',
    // An orange answers it at 5.2:1 on white, for the name.
    brandAlt: '#c2410c',
    // The mark takes a brighter orange, so the base peak stands apart from
    // the ultramarine plate at 16 px.
    mark: { plate: '#2200c4', accent: '#f97316' },
  },
];
