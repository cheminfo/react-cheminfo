import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { GroupedSites } from '../core/lookup.ts';
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
  /**
   * The sites shown, such as those a search found; a topic holding none of
   * them is left out.
   * @default undefined — every site
   */
  only?: ReadonlySet<SiteId>;
  /**
   * The site lit while the pointer is on no tile, such as the one Enter opens
   * from a search. Only a grid that lights its tiles shows it.
   * @default undefined
   */
  pointed?: SiteId;
}

/**
 * Every site of the family as a tile, gathered under its topic, in the columns
 * the footer and the Tools menu both draw.
 * @param props - The site it sits on, and how the tiles behave.
 * @returns The grid of topics.
 */
export function SiteGroupGrid(props: SiteGroupGridProps): ReactElement {
  const { currentSiteId, lit = false, newTab = false, only, pointed } = props;
  const [hovered, setHovered] = useState<SiteId | null>(null);
  const shown = hovered ?? pointed;

  return (
    <div style={TOPICS_STYLE}>
      {shownGroups(only).map(({ group, sites }) => (
        <SiteGroupSection key={group.id} group={group}>
          {sites.map((site) => (
            <SiteTile
              key={site.id}
              site={site}
              isCurrent={site.id === currentSiteId}
              isHovered={lit && shown === site.id}
              onHover={lit ? setHovered : undefined}
              newTab={newTab}
            />
          ))}
        </SiteGroupSection>
      ))}
    </div>
  );
}

function shownGroups(only: ReadonlySet<SiteId> | undefined): GroupedSites[] {
  const grouped = groupedSites();
  if (only === undefined) return grouped;
  const shown: GroupedSites[] = [];
  for (const { group, sites } of grouped) {
    const kept = sites.filter((site) => only.has(site.id));
    if (kept.length > 0) shown.push({ group, sites: kept });
  }
  return shown;
}
