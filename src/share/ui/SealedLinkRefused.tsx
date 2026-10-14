import { AnchorButton, NonIdealState } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

// A grid, because the card's own `height: 100%` keeps a flex row from
// stretching it, and it would sit at the top of the page.
const PAGE_STYLE: CSSProperties = {
  display: 'grid',
  minHeight: '100vh',
  placeItems: 'center',
};

export interface SealedLinkRefusedProps {
  /**
   * Where the tool opens without the link.
   * @default the path the link was opened at
   */
  href?: string;
}

/**
 * What a page shows instead of itself when its sealed link cannot be opened —
 * edited, cut, or minted by a newer key — so it never opens something the link
 * did not say, and never a blank page.
 * @param props - Where the tool opens without the link.
 * @returns The whole page.
 */
export function SealedLinkRefused(props: SealedLinkRefusedProps): ReactElement {
  const { href = globalThis.location?.pathname ?? '/' } = props;
  const t = useChromeT();

  return (
    <div style={PAGE_STYLE}>
      <NonIdealState
        icon="lock"
        title={t('seal.refusedTitle')}
        description={t('seal.refusedBody')}
        action={<AnchorButton href={href} text={t('seal.openWithout')} />}
      />
    </div>
  );
}
