// tokens-ok: file — NMRium's own orange and plum, from its logo.
import type { ReactNode } from 'react';

import type { SiteMarkProps } from './marks.tsx';

/**
 * NMRium's mark, for whatever names NMRium itself rather than the site serving
 * it: the NMRium page of nmr.cheminfo.org, and the entries of draw and write
 * that open it, drawn as `<SiteMark {...NMRIUM_MARK} />`. NMRium is not a site
 * of the family, so its name, colours and symbol are written here rather than
 * in a record of `ECOSYSTEM_SITES`.
 */
export const NMRIUM_MARK: Required<Pick<SiteMarkProps, 'site' | 'glyph'>> = {
  site: {
    id: 'nmrium',
    name: { lead: 'NMR', alt: 'ium' },
    host: 'www.nmrium.com',
    tagline: 'Process NMR spectra in the browser.',
    brand: '#ea580c',
    brandAlt: '#2b143e',
    mark: { plate: '#2b143e', accent: '#ea580c' },
  },
  glyph: nmriumGlyph,
};

/**
 * The official NMRium symbol, from `Logo.tsx` of the NMRium sources: the
 * orange half is theirs, and the half their logo sets in plum is set in white
 * here because the plate already is that plum.
 * @param accent - The orange half's colour.
 * @returns The symbol.
 */
function nmriumGlyph(accent: string): ReactNode {
  return (
    <g fillRule="evenodd" transform="translate(5.25 6.25) scale(0.088)">
      <path
        fill={accent}
        d="M.64,31.7A31.67,31.67,0,0,1,54.72,9.29l0,0A31.66,31.66,0,0,1,64,31.7V190a13.39,13.39,0,0,0,26.77,0V54a31.7,31.7,0,0,1,31.7-31.7V40.58A13.38,13.38,0,0,0,109.13,54V190a31.71,31.71,0,0,1-63.41,0V31.7a13.29,13.29,0,0,0-3.88-9.46l0,0A13.41,13.41,0,0,0,19,31.7V164.82H.64Z"
      />
      <path
        fill="#ffffff"
        d="M154.21,54v68.17a13.34,13.34,0,0,0,3.89,9.47h0A13.39,13.39,0,0,0,181,122.14V99.32h-.06a31.63,31.63,0,0,1,9.29-22.38l0,0a31.65,31.65,0,0,1,44.8,0l0,0a31.58,31.58,0,0,1,9.3,22.39V118H226V99.32a13.3,13.3,0,0,0-3.89-9.46h0a13.44,13.44,0,0,0-18.93,0l0,0a13.3,13.3,0,0,0-3.83,8.19v24.09a31.7,31.7,0,0,1-54.11,22.42v0a31.66,31.66,0,0,1-9.3-22.4V54Z"
      />
    </g>
  );
}
