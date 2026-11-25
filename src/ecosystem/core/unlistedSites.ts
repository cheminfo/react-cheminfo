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
    id: 'store',
    name: { lead: 'store', alt: 'cheminfo', dot: true },
    host: 'store.cheminfo.org',
    tagline: 'What is known about a molecule, and who says so.',
    group: 'research',
    // The red of a GHS pictogram's frame, the first thing a label says: 6.5
    // Oklab units from the nearest lead of the family, and 4.8:1 on white.
    brand: '#e01e24',
    // The blue of the health quadrant of an NFPA diamond, 8.3:1 on white.
    brandAlt: '#1e4e8c',
    // That blue sits too close to the red plate at 16 px, so the flask in the
    // diamond takes the yellow of the diamond's instability quadrant.
    mark: { plate: '#e01e24', accent: '#fde047' },
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
  {
    id: 'fair',
    name: { lead: 'fair', alt: 'cheminfo', dot: true },
    host: 'fair.cheminfo.org',
    tagline:
      'Explore published chemistry datasets: compounds, spectra and documents.',
    group: 'research',
    // A deep olive leads at 7.08:1 on white, darker than metabo's olive so the
    // two read apart, and an ocean blue answers at 5.93:1.
    brand: '#3f6212',
    brandAlt: '#0369a1',
    // The mark takes the light form of that blue, 4.24:1 on the olive plate:
    // the dark form sits at 1.19:1 there and vanishes at 16 px.
    mark: { plate: '#3f6212', accent: '#7dd3fc' },
  },
];
