import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { EcosystemSite, SiteId } from '../core/sites.ts';

// Every mark is drawn in the same 32×32 box, on a plate of the site's own
// colour, so every mark of the family still reads as one row. Each keeps the
// geometry of that site's own logo where it has one, and carries the site's
// answering colour on exactly one element — which is what stops it collapsing
// into a flat shape at 16 px.
const MARK_STYLE: CSSProperties = { display: 'block', flex: 'none' };

export interface SiteMarkProps {
  /** The site whose mark is drawn, with the two colours it owns. */
  site: EcosystemSite;
  /**
   * Edge of the square the mark is drawn in, in pixels.
   * @default 28
   */
  size?: number;
}

/**
 * The little logo of one site of the family.
 * @param props - The site and the size of its mark.
 * @returns The mark, as an inline SVG.
 */
export function SiteMark(props: SiteMarkProps): ReactElement {
  const { site, size = 28 } = props;

  return (
    <svg
      style={MARK_STYLE}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x={site.mark.edge ? 0.5 : 0}
        y={site.mark.edge ? 0.5 : 0}
        width={site.mark.edge ? 31 : 32}
        height={site.mark.edge ? 31 : 32}
        rx={site.mark.edge ? 6.5 : 7}
        fill={site.mark.plate}
        stroke={site.mark.edge}
      />
      {GLYPHS[site.id](site.mark.accent)}
    </svg>
  );
}

/** Every mark, keyed by site, drawn on top of its plate. */
const GLYPHS: Record<SiteId, (alt: string) => ReactNode> = {
  // A hexagon with a tail: the structure, and the string it hashes into.
  inchi: (alt) => (
    <g
      fill="none"
      stroke={alt}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13,6.5 7.7,9.6 7.7,15.7 13,18.8 18.3,15.7 18.3,9.6" />
      <path d="M16.4 16.2 25.2 25" />
    </g>
  ),
  // The core carrying three R groups, which is what this tool combines.
  vcl: (alt) => (
    <>
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 9.5 10.8 12.5 10.8 18.5 16 21.5 21.2 18.5 21.2 12.5Z" />
        <path d="M16 9.5 16 5.5M21.2 18.5 24.8 20.6M10.8 18.5 7.2 20.6" />
      </g>
      <circle cx="16" cy="4.6" r="2.6" fill={alt} />
      <circle cx="25.6" cy="21.2" r="2.6" fill={alt} />
      <circle cx="6.4" cy="21.2" r="2.6" fill={alt} />
    </>
  ),
  // A ring over the line of characters that writes it down.
  smiles: (alt) => (
    <>
      <path
        d="M16 7.5 22.1 11.1 22.1 18.3 16 21.9 9.9 18.3 9.9 11.1Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 25.5h21"
        fill="none"
        stroke={alt}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  // An isotopic pattern: the answer this one is asked for most.
  chemcalc: (alt) => (
    <g strokeLinecap="round" strokeWidth="3.4" fill="none">
      <path d="M9 24V15" stroke="#ffffff" />
      <path d="M16 24V7" stroke={alt} />
      <path d="M23 24V18" stroke="#ffffff" />
    </g>
  ),
  // The official NMRium symbol, from `Logo.tsx` of the NMRium sources: the
  // orange half is theirs, and the half their logo sets in plum is set in white
  // here because the plate already is that plum.
  nmrium: (accent) => (
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
  ),
  // One formula branching into every structure it can be.
  surge: (alt) => (
    <>
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16h6" />
        <path d="M13 16 25 8.5M13 16h12M13 16 25 23.5" />
      </g>
      <circle cx="25" cy="8.5" r="3" fill={alt} />
      <circle cx="25" cy="16" r="3" fill={alt} />
      <circle cx="25" cy="23.5" r="3" fill={alt} />
    </>
  ),
  // A radical over its radicand: a formula being set.
  tex: (alt) => (
    <>
      <rect x="18.5" y="12" width="8.5" height="8.5" rx="1.6" fill={alt} />
      <path
        d="M4.5 15.5h3l3.6 8.2L16.8 7.5h10.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  // The site's own favicon: two lobes of opposite phase overlapping end-on,
  // the simplest sigma bond, in the phase palette its viewer renders with.
  lcao: (alt) => (
    <>
      <path
        d="M16 16C16 10.2 13.3 5 9 5S2 10.2 2 16s2.7 11 7 11 7-5.2 7-11z"
        fill="#1565c0"
      />
      <path
        d="M16 16c0 5.8 2.7 11 7 11s7-5.2 7-11-2.7-11-7-11-7 5.2-7 11z"
        fill={alt}
      />
      <circle cx="16" cy="16" r="2.25" fill="#37474f" />
    </>
  ),
  // The pattern that matches anything, which is where everyone starts.
  regexp: (alt) => (
    <text
      x="50%"
      y="53%"
      dominantBaseline="central"
      textAnchor="middle"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize="18"
      fontWeight="700"
      fill={alt}
    >
      .*
    </text>
  ),
  // Three residues of a chain, one of them the ligand you came for.
  pdb: (alt) => (
    <>
      <g
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <path d="M9.2 12.4 22 15.4 15.6 23Z" />
      </g>
      <circle cx="9.2" cy="12.4" r="3.1" fill="#ffffff" />
      <circle cx="22" cy="15.4" r="3.1" fill="#ffffff" />
      <circle cx="15.6" cy="23" r="3.1" fill={alt} />
    </>
  ),
  // The site's own favicon: a spectrum, and the one signal being assigned.
  elucidation: (alt) => (
    <>
      <path
        d="M5 24h4l2-11 2 11h4l2-15 2 15h3l1.5-7 1.5 7"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="9" r="3" fill={alt} />
    </>
  ),
  // The site's own favicon: the double harpoon, one direction per colour.
  equilibrium: (alt) => (
    <g
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 12.5h17l-4-4" stroke="#ffffff" />
      <path d="M25.5 19.5h-17l4 4" stroke={alt} />
    </g>
  ),
  // A chain of monomers, one of them the comonomer written into it.
  polycarp: (alt) => (
    <>
      <path
        d="M6.5 20 12.5 12 19.5 20 25.5 12"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="20" r="3" fill="#ffffff" />
      <circle cx="12.5" cy="12" r="3" fill="#ffffff" />
      <circle cx="19.5" cy="20" r="3" fill={alt} />
      <circle cx="25.5" cy="12" r="3" fill="#ffffff" />
    </>
  ),
};
