import type { ReactNode } from 'react';

export interface SectionProps {
  /** What the block is about, written above it. */
  title: string;
  /** The block. */
  children: ReactNode;
}

/**
 * One titled block of a dialog.
 * @param props - Component props.
 * @returns The section.
 */
export function Section(props: SectionProps) {
  const { title, children } = props;
  return (
    <div style={sectionStyle}>
      <div style={sectionTitleStyle}>{title}</div>
      {children}
    </div>
  );
}

export interface LinkProps {
  href: string;
  children: ReactNode;
}

/**
 * A link out of a dialog, opened away from the editor so a drawing in progress
 * or a spectrum being read is never lost to a click.
 * @param props - Component props.
 * @returns The link.
 */
export function Link(props: LinkProps) {
  const { href, children } = props;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {children}
    </a>
  );
}

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const;

const sectionTitleStyle = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  opacity: 0.6,
} as const;

// Spelled out rather than left to the page: nothing says a host application
// styles its anchors, and a credit nobody can tell is a link is not a credit.
const linkStyle = {
  // The site's own accent, and the inherited ink on a page that declares none —
  // the underline is what makes it a link either way.
  color: 'var(--accent, inherit)',
  textDecoration: 'underline',
} as const;
