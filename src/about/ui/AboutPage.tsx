import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { CreditsList } from '../../credits/ui/CreditsList.tsx';
import { Wordmark } from '../../ecosystem/ui/Wordmark.tsx';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { AboutContent } from '../core/about.ts';
import { resolveAbout } from '../core/about.ts';

import { AboutBuild } from './AboutBuild.tsx';
import { AboutCitations } from './AboutCitations.tsx';
import { AboutProvidedBy } from './AboutProvidedBy.tsx';
import { AboutSection } from './AboutSection.tsx';
import { AboutVersion } from './AboutVersion.tsx';

export interface AboutPageProps {
  /** What the site says about itself. */
  content: AboutContent;
  /**
   * Class the page carries, in addition to `about-page`.
   * @default undefined
   */
  className?: string;
  /**
   * The one section a site adds of its own — where its numbers come from, the
   * limitation it wants named. It lands under the context paragraphs, so the
   * credits, the citation and the licence keep the place a reader expects.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * The site's own mark, for a site the shared glyph set does not hold —
   * one that is deliberately not listed in `ECOSYSTEM_SITES`. It stands where
   * `SiteMark` would, and the hero is otherwise unchanged.
   * @default undefined — the family's mark for that site
   */
  mark?: ReactNode;
  /**
   * The site's own drawn lockup, for a site that has one. It stands in the
   * hero in place of the mark and the written name, above the tagline, and
   * must therefore carry the name itself. Anything else about the hero stays
   * where a reader of our other About pages expects it.
   * @default undefined
   */
  logo?: ReactNode;
}

/**
 * The About page of a site of the family: what the tool is, who provides it,
 * what a visitor can do with it, what it is built on, how to cite it, and where
 * to report a problem — always in that order.
 *
 * The order is the point. A reader who has read one of our About pages knows
 * where the credits are on the other thirteen, and a site that writes its own
 * page is a site that will forget one of these sections.
 * @param props - See {@link AboutPageProps}.
 * @returns The page.
 * @throws {Error} When the record names a site or a credit that does not exist.
 */
export function AboutPage(props: AboutPageProps): ReactElement {
  const { content, className, children, logo, mark } = props;
  const t = useChromeT();
  const about = resolveAbout(content);
  const site = about.site;

  return (
    <div
      className={
        className === undefined ? 'about-page' : `about-page ${className}`
      }
      style={PAGE_STYLE}
    >
      <header className="about-hero" style={HERO_STYLE}>
        {logo === undefined
          ? (mark ?? <SiteMark site={site} size={56} />)
          : null}
        <div style={HERO_BODY_STYLE}>
          <h1 style={logo === undefined ? NAME_STYLE : LOGO_NAME_STYLE}>
            {logo ?? <Wordmark site={site} size={26} />}
          </h1>
          <p style={TAGLINE_STYLE}>
            {t.or(`site.${site.id}.tagline`, site.tagline)}
          </p>
          <p style={WHAT_STYLE}>{about.what}</p>
        </div>
        <AboutVersion
          build={about.build}
          repository={about.repository}
          publicRepository={about.publicRepository}
        />
      </header>

      {about.people.length === 0 && about.providedBy.length === 0 ? null : (
        <AboutSection
          title={t('about.providedBy')}
          className="about-provided-by"
        >
          <AboutProvidedBy people={about.people} providers={about.providedBy} />
        </AboutSection>
      )}

      <AboutSection title={t('about.whatYouCanDo')} className="about-can">
        <ul style={CAN_LIST_STYLE}>
          {about.can.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AboutSection>

      {about.paragraphs.length === 0 ? null : (
        <AboutSection className="about-context">
          {about.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              style={index === 0 ? FIRST_PARAGRAPH_STYLE : PARAGRAPH_STYLE}
            >
              {paragraph}
            </p>
          ))}
        </AboutSection>
      )}

      {children}

      <AboutSection title={t('about.builtOn')} className="about-credits">
        <CreditsList entries={about.credits} />
      </AboutSection>

      {about.cite.length === 0 ? null : (
        <AboutSection title={t('about.howToCite')} className="about-cite">
          <AboutCitations works={about.cite} />
        </AboutSection>
      )}

      {/*
        A repository nobody outside can open is named nowhere: a licence a
        reader cannot act on and a link that answers 404 say less than silence.
        The version stays in the hero, unlinked, so a report still names a build.
      */}
      {!about.publicRepository ? null : (
        <AboutSection
          title={t('about.licenceAndSource')}
          className="about-licence"
        >
          <p style={FIRST_PARAGRAPH_STYLE}>
            {around(
              t('about.licence', { license: about.license }),
              'sources',
              <ExternalLink key="sources" href={about.repository} />,
            )}
          </p>
          {about.build === undefined ? null : (
            <AboutBuild build={about.build} repository={about.repository} />
          )}
        </AboutSection>
      )}

      {/*
        Asking for a report is worth nothing without somewhere to send it, and
        the tracker of a private repository answers 404 to every visitor.
      */}
      {about.issues === undefined ? null : (
        <AboutSection title={t('about.foundAProblem')} className="about-issues">
          <p style={FIRST_PARAGRAPH_STYLE}>
            {around(
              t('about.reportIt'),
              'tracker',
              <ExternalLink key="tracker" href={about.issues} />,
            )}
          </p>
        </AboutSection>
      )}
    </div>
  );
}

// A link sits inside a sentence whose word order is the translator's, so the
// message names where it goes with a placeholder and is split there.
function around(
  message: string,
  placeholder: string,
  link: ReactNode,
): ReactNode[] {
  const [before = '', after = ''] = message.split(`{${placeholder}}`);
  return [before, link, after];
}

function ExternalLink(props: { href: string }): ReactElement {
  const { href } = props;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
      {href.replace(/^https?:\/\//, '')}
    </a>
  );
}

const PAGE_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 980,
  // Centred, because the About is read on its own rather than beside a tool.
  marginInline: 'auto',
  gap: 10,
} as const satisfies CSSProperties;

const HERO_BODY_STYLE = {
  flex: '1 1 auto',
  minWidth: 0,
} as const satisfies CSSProperties;

const HERO_STYLE = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: 16,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 16,
  lineHeight: 1.55,
} as const satisfies CSSProperties;

const NAME_STYLE = {
  margin: 0,
  fontSize: 26,
  fontWeight: 700,
} as const satisfies CSSProperties;

const LOGO_NAME_STYLE = {
  margin: '0 0 4px',
} as const satisfies CSSProperties;

const TAGLINE_STYLE = {
  margin: '2px 0 8px',
  color: 'var(--text-muted)',
  fontSize: 14,
} as const satisfies CSSProperties;

const WHAT_STYLE = { margin: 0 } as const satisfies CSSProperties;

const CAN_LIST_STYLE = {
  margin: 0,
  paddingLeft: 20,
} as const satisfies CSSProperties;

const FIRST_PARAGRAPH_STYLE = {
  margin: 0,
} as const satisfies CSSProperties;

const PARAGRAPH_STYLE = {
  margin: '8px 0 0',
} as const satisfies CSSProperties;

const LINK_STYLE = { color: 'var(--accent)' } as const satisfies CSSProperties;
