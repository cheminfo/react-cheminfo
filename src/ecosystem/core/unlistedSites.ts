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
  {
    id: 'ml',
    name: { lead: 'ml', alt: 'cheminfo', dot: true },
    host: 'ml.cheminfo.org',
    tagline: 'Machine learning on spectra, in the browser.',
    group: 'spectra',
    // A purple plate for the statistics, and the teal of the second half
    // answers it at 5.4:1 on white.
    brand: '#6a3d9a',
    brandAlt: '#00796b',
    // The samples at the foot of the clustering tree take an amber.
    mark: { plate: '#6a3d9a', accent: '#ffb000' },
    receives: [
      {
        kinds: ['data.spectra', 'data.table'],
        does: 'Compare the spectra with PCA, OPLS and clustering',
      },
    ],
  },
];
