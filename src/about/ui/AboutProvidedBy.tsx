import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { Prose } from '../../i18n/ui/Prose.tsx';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { AboutPerson } from '../core/about.ts';
import type { ProviderEntry } from '../core/providers.ts';
import type { TeamMember } from '../core/team.ts';

import { ProviderLogo } from './ProviderLogo.tsx';

export interface AboutProvidedByProps {
  /** Who provides the site, named beside the logos. */
  people: readonly AboutPerson[];
  /** The list under the names: who does what, the family's people first. */
  team: readonly TeamMember[];
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
  const { people, team, providers } = props;
  const t = useChromeT();
  const language = useLanguage();

  return (
    <div>
      {people.length === 0 && providers.length === 0 ? null : (
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
      )}
      {team.length === 0 ? null : (
        <ul style={ROLES_STYLE}>
          {team.map((member) => (
            <li key={member.name}>
              <strong>{member.name}</strong> — {roleOf(member, t, language)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * What one person of the list does: the family's words for one of its
 * people, with where they do it linked, or the site's own.
 * @param member - The person.
 * @param t - The chrome's messages.
 * @param language - The page's language, which the works are listed in.
 * @returns The role, as it reads after the name.
 */
function roleOf(
  member: TeamMember,
  t: Translate<ChromeKey>,
  language: Language,
): ReactNode {
  const { family } = member;
  if (family === undefined) return member.role;
  const { role, organisation, works } = family;
  let text = t('about.role.coordinates');
  if (role === 'design') text = t('about.role.design');
  if (role === 'tooling') {
    text =
      works.length === 0
        ? t('about.role.tooling')
        : t('about.role.toolingAnd', {
            works: new Intl.ListFormat(language).format(works),
          });
  }
  if (organisation === undefined) return text;
  return (
    <Prose
      text={text}
      nodes={{
        organisation: (
          <a href={organisation.href} target="_blank" rel="noopener noreferrer">
            {organisation.name}
          </a>
        ),
      }}
    />
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
