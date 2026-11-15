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
    id: 'plot',
    name: { lead: 'plot', alt: 'cheminfo', dot: true },
    host: 'plot.cheminfo.org',
    tagline:
      'Plot tables and spectra as charts sized and styled for a journal.',
    group: 'drawing',
    // The blue of the pen a curve is drawn with: 7.9:1 on white, and 10.1
    // Oklab units from isomers and mz, the nearest leads.
    brand: '#0024fc',
    // The orange of millimetre paper's grid answers it, at 5:1 for the name.
    brandAlt: '#b45309',
    // The mark's line takes a brighter amber, so it stands apart from the
    // blue plate at 16 px.
    mark: { plate: '#0024fc', accent: '#fbbf24' },
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
    id: 'uv-vis',
    name: { lead: 'uv-', alt: 'vis' },
    host: 'uv-vis.cheminfo.org',
    tagline: 'Overlay UV-vis spectra and read off every λmax.',
    group: 'spectra',
    // Permanganate's magenta and copper's cyan: the two coloured solutions a
    // first UV-vis lab measures, and a pair of subtractive primaries. The
    // violets a spectrum would suggest are inchi's, elucidation's and ChemCalc's.
    brand: '#c026d3',
    // The cyan of the mark sits at 1.8:1 on white, so the second half of the
    // wordmark takes the darker cyan, at 5.4:1.
    brandAlt: '#0e7490',
    mark: { plate: '#c026d3', accent: '#22d3ee' },
  },
  {
    id: 'nmrium',
    // NMRium, served on the family's domain for the figures draw and write
    // frame it to make, so it wears NMRium's name, mark and colours.
    name: { lead: 'NMR', alt: 'ium' },
    host: 'nmrium.cheminfo.org',
    tagline: 'Process NMR spectra, and keep them as figures that open again.',
    group: 'spectra',
    brand: '#ea580c',
    brandAlt: '#2b143e',
    mark: { plate: '#2b143e', accent: '#ea580c' },
  },
  {
    id: 'xps',
    name: { lead: 'xps', alt: 'cheminfo', dot: true },
    host: 'xps.cheminfo.org',
    tagline: 'Read, fit and predict X-ray photoelectron spectra.',
    group: 'spectra',
    // Plum, 7.2:1 on white and 8.7 Oklab units from the nearest lead (tex);
    // symmetry has since taken the rose and amber once kept for this site.
    brand: '#97297b',
    // The green an X-ray screen glows. It sits at 1.5:1 on white, so the
    // wordmark sets its second half in this darker green, at 5:1.
    brandAlt: '#4d7c0f',
    mark: { plate: '#97297b', accent: '#a3e635' },
  },
  {
    id: 'biodraw',
    // The name splits on itself, biology and drawing, so it carries no domain.
    name: { lead: 'bio', alt: 'draw', dot: false },
    host: 'biodraw.cheminfo.org',
    tagline: 'Draw cells and membranes, and snap proteins into them.',
    group: 'drawing',
    // Eosin, the pink a cell's cytoplasm takes in the H&E stain every
    // histology slide is read in: 4.6:1 on white, 7.1 Oklab units from
    // molecules, the nearest pink.
    brand: '#db2777',
    // Haematoxylin, the blue-violet the same stain gives a nucleus, at 9.9:1.
    brandAlt: '#3730a3',
    mark: { plate: '#db2777', accent: '#3730a3' },
  },
  {
    id: 'diagram',
    name: { lead: 'diagram', alt: 'cheminfo', dot: true },
    host: 'diagram.cheminfo.org',
    tagline:
      'Draw flowcharts and block diagrams, with arrows that follow the blocks.',
    group: 'drawing',
    // Coral, the sticky note a block diagram is first laid out on: 5:1 on
    // white, and 7.4 Oklab units from slides, the nearest lead.
    brand: '#b84c59',
    // The cyan of the arrow joining two notes answers it; the name takes the
    // darker cyan, at 5.4:1.
    brandAlt: '#0e7490',
    mark: { plate: '#b84c59', accent: '#67e8f9' },
  },
  {
    id: 'peptide',
    name: { lead: 'peptide', alt: 'cheminfo', dot: true },
    host: 'peptide.cheminfo.org',
    tagline:
      'Learn peptide synthesis, from protecting groups to the solid phase.',
    group: 'practice',
    // Ruhemann's purple, the colour ninhydrin turns a free amine on a resin
    // bead: 8.5:1 on white, and 7.3 Oklab units from spectroscopy, the
    // nearest lead.
    brand: '#563d8f',
    // The resin bead the chain grows on is teal in the mark; the name takes
    // the darker teal, at 5.5:1.
    brandAlt: '#0f766e',
    mark: { plate: '#563d8f', accent: '#2dd4bf' },
  },
  {
    id: 'optics',
    name: { lead: 'optics', alt: 'cheminfo', dot: true },
    host: 'optics.cheminfo.org',
    tagline:
      'Set lenses and mirrors on a bench, and follow the light to its image.',
    group: 'practice',
    // The blue of a lens seen edge on: 7.9:1 on white, and 6.6 Oklab units
    // from 3d, the nearest lead.
    brand: '#2c518e',
    // The red of a laser beam answers it, at 6.5:1; the mark draws its rays
    // in the paler red.
    brandAlt: '#b91c1c',
    mark: { plate: '#2c518e', accent: '#fca5a5' },
  },
  {
    id: 'circuits',
    name: { lead: 'circuits', alt: 'cheminfo', dot: true },
    host: 'circuits.cheminfo.org',
    tagline:
      'Wire batteries, bulbs and resistors, and read what the meters show.',
    group: 'practice',
    // Copper, what every wire is drawn in: 5.8:1 on white, and 6.2 Oklab
    // units from inorganic and from slides, the nearest leads.
    brand: '#a84811',
    // The blue of a current answers it, at 5.9:1; the mark draws the current
    // in the paler blue.
    brandAlt: '#0369a1',
    mark: { plate: '#a84811', accent: '#7dd3fc' },
  },
  {
    id: 'mechanics',
    name: { lead: 'mechanics', alt: 'cheminfo', dot: true },
    host: 'mechanics.cheminfo.org',
    tagline:
      'Put a block on a slope or over a pulley, and see the forces add up.',
    group: 'practice',
    // Brass, the weights of a mechanics lab: 5.5:1 on white, and 6.7 Oklab
    // units from osiris, the nearest lead.
    brand: '#7b672e',
    // Violet answers it, 31 Oklab units away so the two halves of the name
    // never read as one, at 7:1; the mark draws the block in the paler
    // violet.
    brandAlt: '#7e22ce',
    mark: { plate: '#7b672e', accent: '#d8b4fe' },
  },
];
