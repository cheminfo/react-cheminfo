import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { SiteGroup } from '../core/groups.ts';

// A topic is separated by a hairline and a small heading rather than by a
// colour of its own: every site brings its own two, and a
// menu that also colours its headings stops reading as a list of tools.
const SECTION_STYLE: CSSProperties = {
  paddingTop: 12,
  borderTop: `1px solid ${TOKEN.border}`,
  marginBottom: 16,
};
const LABEL_STYLE: CSSProperties = {
  margin: 0,
  color: TOKEN.text,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};
const BLURB_STYLE: CSSProperties = {
  margin: '2px 0 8px',
  color: TOKEN.textFaint,
  fontSize: '0.72rem',
  lineHeight: 1.4,
};
const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

/** What one topic of the family needs. */
interface SiteGroupSectionProps {
  /** The topic being headed. */
  group: SiteGroup;
  /** The sites written under it. */
  children: ReactNode;
}

/**
 * One topic of the family: its heading, the line saying who it is for, and the
 * sites under it.
 * The heading id is unique to each render, because the footer and the open
 * Tools menu write the same topics into one document.
 * @param props - The topic, and its sites.
 * @returns The section.
 */
export function SiteGroupSection(props: SiteGroupSectionProps): ReactElement {
  const { group, children } = props;
  const headingId = `${useId()}ecosystem-${group.id}`;

  return (
    <section style={SECTION_STYLE} aria-labelledby={headingId}>
      <h3 id={headingId} style={LABEL_STYLE}>
        {group.label}
      </h3>
      <p style={BLURB_STYLE}>{group.blurb}</p>
      <div style={BODY_STYLE}>{children}</div>
    </section>
  );
}
