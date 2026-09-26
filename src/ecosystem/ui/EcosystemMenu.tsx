import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { SiteId } from '../core/sites.ts';

import { SiteGroupGrid } from './SiteGroupGrid.tsx';
import { ECOSYSTEM_HEADING_STYLE } from './ecosystemStyles.ts';

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  width: 'min(62rem, 92vw)',
  maxHeight: 'min(72vh, 44rem)',
  flexDirection: 'column',
  padding: '12px 16px 4px',
  gap: 10,
  overflowY: 'auto',
};

/** What the Tools menu needs. */
export interface EcosystemMenuProps {
  /**
   * The site the visitor is already on, which is shown but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * What the ecosystem button opens: every site of the family, gathered under the
 * topic it belongs to, each behind its own little logo and the two colours it
 * owns.
 *
 * The topics are what make the menu answer a question a flat grid of tiles
 * never could — which of these is for a first-year course, and which for
 * a research project. It lives in a popover, so a crawler never reaches it;
 * `EcosystemLinks` is what carries the family through the page itself.
 * @param props - The site the visitor is already on.
 * @returns The topics and their sites.
 */
export function EcosystemMenu(props: EcosystemMenuProps): ReactElement {
  const { className, currentSiteId } = props;
  const t = useChromeT();

  return (
    <div
      className={joinClassNames('ecosystem-menu', className)}
      style={PANEL_STYLE}
    >
      <div style={ECOSYSTEM_HEADING_STYLE}>{t('ecosystem.menuHeading')}</div>
      <SiteGroupGrid currentSiteId={currentSiteId} lit newTab />
    </div>
  );
}
