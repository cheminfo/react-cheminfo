import type { CSSProperties, ReactElement } from 'react';

import type { ProviderEntry } from '../core/providers.ts';

/**
 * The logo an institution is drawn with under "Provided by", or its name in
 * type when no drawing of its own is kept.
 * @param props - Which institution.
 * @param props.provider - Its entry in the provider registry.
 * @returns The logo.
 */
export function ProviderLogo(props: { provider: ProviderEntry }): ReactElement {
  const { provider } = props;
  const label = `${provider.name} — ${provider.fullName}`;

  switch (provider.id) {
    case 'epfl':
      return <EpflLogo label={label} />;
    case 'unil-esc':
      return <UnilEscLockup label={label} />;
    default:
      return <span>{provider.name}</span>;
  }
}

// The school's name set in type beside its university's, in the black the
// university writes its name in: no drawing of its emblem is kept here, and a
// name nobody can misread credits it better than a guess at one.
function UnilEscLockup(props: { label: string }): ReactElement {
  return (
    <span role="img" aria-label={props.label} style={UNIL_LOCKUP_STYLE}>
      <span style={UNIL_NAME_STYLE}>UNIL</span>
      <span style={UNIL_RULE_STYLE} />
      <span style={UNIL_SCHOOL_STYLE}>
        École des
        <br />
        sciences criminelles
      </span>
    </span>
  );
}

function EpflLogo(props: { label: string }): ReactElement {
  return (
    <svg
      width={112}
      height={(112 * 53) / 182.4}
      viewBox="0 0 182.4 53"
      role="img"
      aria-label={props.label}
      style={{ display: 'block' }}
    >
      {/* The institution's own colour, not a family token. */}
      <g fill="red">
        <polygon points="0 21.6 11.43 21.6 11.43 9.8 38.34 9.8 38.34 0 0 0 0 21.6" />
        <polygon points="0 53 38.34 53 38.34 43.2 11.43 43.2 11.43 31.4 0 31.4 0 53" />
        <rect x="11.43" y="21.6" width="24.61" height="9.8" />
        <path d="M86,4.87a16.12,16.12,0,0,0-5.68-3.53A23.76,23.76,0,0,0,71.82,0H48.14V53H59.57V31.4H71.82a23.76,23.76,0,0,0,8.46-1.34A16.12,16.12,0,0,0,86,26.53a13.43,13.43,0,0,0,3.19-5,17.38,17.38,0,0,0,0-11.62A13.52,13.52,0,0,0,86,4.87ZM78,18.73a5.7,5.7,0,0,1-2.26,1.8,11.33,11.33,0,0,1-3.27.85,32,32,0,0,1-3.86.22H59.57V9.8h9.05a32,32,0,0,1,3.86.22,11,11,0,0,1,3.27.86A5.59,5.59,0,0,1,78,12.67a5,5,0,0,1,.86,3A5,5,0,0,1,78,18.73Z" />
        <polygon points="155.47 43.2 155.47 0 144.04 0 144.04 53 182.38 53 182.38 43.2 155.47 43.2" />
        <polygon points="97.42 21.6 108.85 21.6 108.85 9.8 135.76 9.8 135.76 0 97.42 0 97.42 21.6" />
        <rect x="97.42" y="31.4" width="11.43" height="21.6" />
        <rect x="108.85" y="21.6" width="24.61" height="9.8" />
      </g>
    </svg>
  );
}

const UNIL_LOCKUP_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: 31,
  // The institution's own colour, not a family token: the tile is white on
  // every theme.
  color: 'black',
} as const satisfies CSSProperties;

const UNIL_NAME_STYLE = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: '0.02em',
  lineHeight: 1,
} as const satisfies CSSProperties;

const UNIL_RULE_STYLE = {
  alignSelf: 'stretch',
  width: 1,
  background: 'black',
} as const satisfies CSSProperties;

const UNIL_SCHOOL_STYLE = {
  fontSize: 10.5,
  fontWeight: 600,
  lineHeight: 1.15,
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;
