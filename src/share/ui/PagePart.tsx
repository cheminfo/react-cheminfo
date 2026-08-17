import type { ReactNode } from 'react';

import { useIsHidden } from './hiddenParts.ts';

export interface PagePartProps {
  /** The name this region takes in `?hide=`. */
  part: string;
  /** What the region draws. */
  children: ReactNode;
}

/**
 * A region of the page a shared link may leave out.
 *
 * A switched-off part is dropped from the tree rather than hidden with CSS: an
 * embedded figure must not mount a 3D canvas, or run a search, for a panel
 * nobody will see.
 * @param props - Which region this is, and what it draws.
 * @returns The children, or nothing.
 */
export function PagePart(props: PagePartProps): ReactNode {
  const { part, children } = props;
  const isHidden = useIsHidden();

  return isHidden(part) ? null : children;
}
