import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import type { Brand } from '../stories/brands.ts';

export interface BrandTokensProps {
  /** The two colours the story is to be read under. */
  brand: Brand;
  /** The story. */
  children: ReactNode;
}

/**
 * Puts a site's two colours on the document, as `--brand`, `--brand-alt` and
 * `--accent`. They go on the document rather than on a wrapper because a
 * Blueprint popover renders into a portal at the end of the body, outside
 * anything a decorator could wrap.
 * @param props - The colours, and the story reading them.
 * @returns The story.
 */
export function BrandTokens(props: BrandTokensProps): ReactElement {
  const { brand, children } = props;

  useEffect(() => {
    const { style } = document.documentElement;
    style.setProperty('--brand', brand.brand);
    style.setProperty('--brand-alt', brand.brandAlt);
    style.setProperty('--accent', brand.brand);
  }, [brand]);

  return <>{children}</>;
}
