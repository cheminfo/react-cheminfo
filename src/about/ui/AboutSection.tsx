import type { CSSProperties, ReactElement, ReactNode } from 'react';

export interface AboutSectionProps {
  /**
   * What the section is called, written as its heading.
   * @default undefined — the section carries no heading
   */
  title?: string;
  /**
   * Class the section carries, in addition to `about-section`.
   * @default undefined
   */
  className?: string;
  /** What the section holds. */
  children: ReactNode;
}

/**
 * One block of the About page: a heading and what sits under it, on the
 * family's own surface rather than on a component library's card.
 * @param props - See {@link AboutSectionProps}.
 * @returns The section.
 */
export function AboutSection(props: AboutSectionProps): ReactElement {
  const { title, className, children } = props;

  return (
    <section
      className={
        className === undefined ? 'about-section' : `about-section ${className}`
      }
      style={SECTION_STYLE}
    >
      {title === undefined ? null : <h2 style={TITLE_STYLE}>{title}</h2>}
      {children}
    </section>
  );
}

const SECTION_STYLE = {
  padding: 16,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  // An About page is printed as often as it is read, and a section split over
  // two pages loses the heading that says what its list is.
  breakInside: 'avoid',
  lineHeight: 1.55,
} as const satisfies CSSProperties;

const TITLE_STYLE = {
  margin: '0 0 8px',
  color: 'var(--accent)',
  fontSize: 16,
  fontWeight: 600,
} as const satisfies CSSProperties;
