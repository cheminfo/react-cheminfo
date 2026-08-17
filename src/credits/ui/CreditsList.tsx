import type { CSSProperties, ReactElement } from 'react';

import type { CreditEntry } from '../core/credits.ts';

/** What a credits list draws. */
export interface CreditsListProps {
  /** The works, in the order they are listed. */
  entries: readonly CreditEntry[];
  /**
   * Whether each work's licence is written after its name.
   * @default true
   */
  showLicense?: boolean;
  /**
   * Class the list carries, in addition to `credits-list`.
   * @default undefined
   */
  className?: string;
}

/**
 * The Credits section of an About dialog: every borrowed work, what it does
 * here, and under which licence.
 *
 * Naming the licence beside the work is what makes the list a credit rather
 * than a list of links, and it is the part a site is most likely to leave out
 * when it writes its own.
 * @param props - See {@link CreditsListProps}.
 * @returns The list.
 */
export function CreditsList(props: CreditsListProps): ReactElement {
  const { entries, showLicense = true, className } = props;

  return (
    <ul
      className={
        className === undefined ? 'credits-list' : `credits-list ${className}`
      }
      style={LIST_STYLE}
    >
      {entries.map((entry) => (
        <li key={entry.id} style={ITEM_STYLE}>
          <a
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            style={NAME_STYLE}
          >
            {entry.name}
          </a>
          {showLicense && entry.license !== undefined ? (
            <span style={LICENSE_STYLE}>{entry.license}</span>
          ) : (
            ' '
          )}
          <span>{entry.description}</span>
        </li>
      ))}
    </ul>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  paddingLeft: 18,
} as const satisfies CSSProperties;

const ITEM_STYLE = {
  fontSize: 13,
  lineHeight: 1.4,
} as const satisfies CSSProperties;

const NAME_STYLE = { fontWeight: 600 } as const satisfies CSSProperties;

const LICENSE_STYLE = {
  color: '#5f6b7c',
  fontSize: 11,
  margin: '0 6px',
} as const satisfies CSSProperties;
