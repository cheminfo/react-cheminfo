import type { CSSProperties, ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { AboutPerson } from '../core/about.ts';
import type { ProviderEntry } from '../core/providers.ts';

export interface AboutProvidedByProps {
  /** Who provides the site, in display order. */
  people: readonly AboutPerson[];
  /** The institutions providing the site, drawn as linked logos. */
  providers: readonly ProviderEntry[];
}

/**
 * The lockup of who provides a site: the institution's logo, then the names
 * and the institution they work at, and under it what each one contributed
 * when the site says so.
 * @param props - See {@link AboutProvidedByProps}.
 * @returns The lockup.
 */
export function AboutProvidedBy(props: AboutProvidedByProps): ReactElement {
  const { people, providers } = props;
  const t = useChromeT();
  const withRoles = people.filter((person) => person.role !== undefined);

  return (
    <div>
      <div style={LOCKUP_STYLE}>
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={provider.href}
            target="_blank"
            rel="noopener noreferrer"
            title={provider.fullName}
            style={LOGO_TILE_STYLE}
          >
            <ProviderLogo provider={provider} />
          </a>
        ))}
        <div
          style={
            providers.length === 0 ? IDENTITY_STYLE : DIVIDED_IDENTITY_STYLE
          }
        >
          {people.length === 0 ? null : (
            <p style={NAMES_STYLE}>{joinNames(people, t)}</p>
          )}
          {providers.map((provider) => (
            <p key={provider.id} style={INSTITUTION_STYLE}>
              {provider.fullName}
              <span style={LOCATION_STYLE}>{provider.location}</span>
            </p>
          ))}
        </div>
      </div>
      {withRoles.length === 0 ? null : (
        <ul style={ROLES_STYLE}>
          {withRoles.map((person) => (
            <li key={person.name}>
              <strong>{person.name}</strong> — {person.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function joinNames(
  people: readonly AboutPerson[],
  t: Translate<ChromeKey>,
): string {
  const names = people.map((person) => person.name);
  if (names.length < 2) return names.join('');
  return t('about.nameList', {
    names: names.slice(0, -1).join(', '),
    last: names.at(-1) ?? '',
  });
}

function ProviderLogo(props: { provider: ProviderEntry }): ReactElement {
  const { provider } = props;
  const label = `${provider.name} — ${provider.fullName}`;

  switch (provider.id) {
    case 'epfl':
      return <EpflLogo label={label} />;
    default:
      return <span>{provider.name}</span>;
  }
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

const LOCKUP_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 20,
} as const satisfies CSSProperties;

const LOGO_TILE_STYLE = {
  flex: '0 0 auto',
  display: 'inline-block',
  // Logos are drawn for a white page, so they keep one on a dark theme.
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '14px 18px',
} as const satisfies CSSProperties;

const IDENTITY_STYLE = {
  flex: '1 1 14rem',
  minWidth: 0,
} as const satisfies CSSProperties;

const DIVIDED_IDENTITY_STYLE = {
  ...IDENTITY_STYLE,
  borderLeft: '3px solid var(--accent)',
  paddingLeft: 16,
} as const satisfies CSSProperties;

const NAMES_STYLE = {
  margin: 0,
  color: 'var(--text)',
  fontSize: 19,
  fontWeight: 600,
  lineHeight: 1.3,
} as const satisfies CSSProperties;

const INSTITUTION_STYLE = {
  margin: '4px 0 0',
  color: 'var(--text-muted)',
  fontSize: 14,
  lineHeight: 1.4,
} as const satisfies CSSProperties;

const LOCATION_STYLE = {
  display: 'block',
  color: 'var(--text-faint)',
  fontSize: 13,
} as const satisfies CSSProperties;

const ROLES_STYLE = {
  margin: '16px 0 0',
  paddingTop: 12,
  paddingLeft: 20,
  borderTop: '1px solid var(--border)',
} as const satisfies CSSProperties;
