// tokens-ok: file — a site's own record writes its colours.
import type { SiteRecord } from '../types.ts';

/** A site that is deliberately not one of the family, with its own record. */
export const OUTSIDE_SITE: SiteRecord = {
  id: 'spectra',
  name: { lead: 'spectra', alt: 'cheminfo', dot: true },
  host: 'spectra.cheminfo.org',
  repository: 'https://github.com/cheminfo/spectra.cheminfo.org',
  tagline: 'Predict a spectrum in the browser.',
  brand: '#0f5132',
  brandAlt: '#a16207',
  mark: { plate: '#0f5132', accent: '#facc15' },
};
