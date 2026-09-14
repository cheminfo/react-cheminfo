import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { HELP_STYLE } from './fieldStyles.ts';

/** What {@link SettingsPart} frames. */
interface SettingsPartProps {
  /** What the part is called, drawn above everything in it. */
  title: string;
  /**
   * One line under the heading saying what the part decides.
   * @default undefined — the title says enough
   */
  summary?: string;
  /** The controls the part is made of. */
  children: ReactNode;
}

/**
 * One part of a settings stage, under a heading of its own.
 *
 * The settings are long enough that a reader scrolling past a bare row of
 * boxes cannot tell which stage they belong to, so every part carries the same
 * heading, the same spacing and the same one-line summary — the panel is then
 * read by its headings rather than by its fields.
 * @param props - See {@link SettingsPartProps}.
 * @returns The headed part.
 */
export function SettingsPart(props: SettingsPartProps): ReactElement {
  const { title, summary, children } = props;

  return (
    <section style={PART_STYLE}>
      <h4 style={TITLE_STYLE}>{title}</h4>
      {summary === undefined ? null : <span style={HELP_STYLE}>{summary}</span>}
      {children}
    </section>
  );
}

const PART_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 12,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
} as const satisfies CSSProperties;

const TITLE_STYLE = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text)',
} as const satisfies CSSProperties;
