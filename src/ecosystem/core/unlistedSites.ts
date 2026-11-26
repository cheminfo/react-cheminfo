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
  {
    id: 'electrochemistry',
    name: { lead: 'electrochemistry', alt: 'cheminfo', dot: true },
    host: 'electrochemistry.cheminfo.org',
    tagline:
      'Build cells and electrolysers, and watch one electrode grow as the other dissolves.',
    group: 'basics',
    // Permanganate violet leads at 4.97:1 on white, 8.6 Oklab units from its
    // nearest leads (elucidation, spectroscopy and chemcalc, all three at 8.6).
    brand: '#8c52cf',
    // Copper answers it at 5.41:1 on white, for the name.
    brandAlt: '#9a5b13',
    // The mark takes a light copper, the hue of the second half (62° against
    // 63°): 37.1 from the violet plate and 21.1 from white, 2.82:1 on the plate.
    mark: { plate: '#8c52cf', accent: '#fcb473' },
  },
];
