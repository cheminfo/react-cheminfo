import type { ReactElement, ReactNode } from 'react';

/** Props of {@link ExternalLink}. */
export interface ExternalLinkProps {
  /** The address, on another site. */
  href: string;
  /** The text of the link. */
  children: ReactNode;
}

/**
 * A link to another site, opened in a tab of its own so the page it was
 * followed from stays where it was. It takes the family's link colour, the
 * accent.
 * @param props - See {@link ExternalLinkProps}.
 * @returns The link.
 */
export function ExternalLink(props: ExternalLinkProps): ReactElement {
  const { href, children } = props;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
