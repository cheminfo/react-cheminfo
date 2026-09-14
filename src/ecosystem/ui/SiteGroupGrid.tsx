import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { groupedSites } from '../core/lookup.ts';
import type { SiteId } from '../core/sites.ts';

import { SiteGroupSection } from './SiteGroupSection.tsx';
import { SiteTile } from './SiteTile.tsx';

const TOPICS_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))',
  alignItems: 'start',
  gap: '4px 28px',
};

/** What a grid of the family's topics needs. */
interface SiteGroupGridProps {
  /**
   * The site the visitor is already on, which is written but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * Whether a tile lights up in its own colour under the pointer, which a menu
   * the visitor opened on purpose does and a footer does not.
   * @default false
   */
  lit?: boolean;
  /**
   * Whether each link opens a tab of its own.
   * @default false
   */
  newTab?: boolean;
}

/**
 * Every site of the family as a tile, gathered under its topic, in the columns
 * the footer and the Tools menu both draw.
 * @param props - The site it sits on, and how the tiles behave.
 * @returns The grid of topics.
 */
export function SiteGroupGrid(props: SiteGroupGridProps): ReactElement {
  const { currentSiteId, lit = false, newTab = false } = props;
  const [hovered, setHovered] = useState<SiteId | null>(null);

  return (
    <div style={TOPICS_STYLE}>
      {groupedSites().map(({ group, sites }) => (
        <SiteGroupSection key={group.id} group={group}>
          {sites.map((site) => (
            <SiteTile
              key={site.id}
              site={site}
              isCurrent={site.id === currentSiteId}
              isHovered={lit && hovered === site.id}
              onHover={lit ? setHovered : undefined}
              newTab={newTab}
            />
          ))}
        </SiteGroupSection>
      ))}
    </div>
  );
}
