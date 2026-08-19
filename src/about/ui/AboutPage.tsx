import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { CreditsList } from '../../credits/ui/CreditsList.tsx';
import { Wordmark } from '../../ecosystem/ui/Wordmark.tsx';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import type { AboutContent } from '../core/about.ts';
import { resolveAbout } from '../core/about.ts';

import { AboutCitations } from './AboutCitations.tsx';
import { AboutSection } from './AboutSection.tsx';

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
}

/**
 * The About page of a site of the family: what the tool is, what a visitor can
 * do with it, what it is built on, how to cite it, and where to report a
 * problem — always in that order.
 *
 * The order is the point. A reader who has read one of our About pages knows
 * where the credits are on the other thirteen, and a site that writes its own
 * page is a site that will forget one of these sections.
 * @param props - See {@link AboutPageProps}.
 * @returns The page.
 * @throws {Error} When the record names a site or a credit that does not exist.
 */
export function AboutPage(props: AboutPageProps): ReactElement {
  const { content, className, children } = props;
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
        <SiteMark siteId={site.id} size={56} />
        <div>
          <h1 style={NAME_STYLE}>
            <Wordmark siteId={site.id} size={26} />
          </h1>
          <p style={TAGLINE_STYLE}>{site.tagline}</p>
          <p style={WHAT_STYLE}>{about.what}</p>
        </div>
      </header>

      <AboutSection title="What you can do here" className="about-can">
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

      <AboutSection title="Built on" className="about-credits">
        <CreditsList entries={about.credits} />
      </AboutSection>

      {about.cite.length === 0 ? null : (
        <AboutSection title="How to cite" className="about-cite">
          <AboutCitations works={about.cite} />
        </AboutSection>
      )}

      <AboutSection title="Licence and source" className="about-licence">
        <p style={FIRST_PARAGRAPH_STYLE}>
          {about.license}, © cheminfo. Use it in a course, fork it, or lift a
          piece of it into something else. The sources are at{' '}
          <ExternalLink href={about.repository} />.
        </p>
        {about.version === undefined ? null : (
          <p style={PARAGRAPH_STYLE}>
            This page is running version {about.version}.
          </p>
        )}
      </AboutSection>

      <AboutSection title="Found a problem?" className="about-issues">
        <p style={FIRST_PARAGRAPH_STYLE}>
          Tell us: a report naming what you typed and what came back is the
          fastest fix there is. <ExternalLink href={about.issues} />.
        </p>
      </AboutSection>
    </div>
  );
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
  gap: 10,
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
