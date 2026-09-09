import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import type { OverlayPillOption } from '../../overlay/ui/OverlayPills.tsx';
import { OverlayPills } from '../../overlay/ui/OverlayPills.tsx';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import {
  projectionTabScroll,
  projectionTabTrackStyle,
} from './projectionBarStyles.ts';

/** What {@link ProjectionTabStrip} needs. */
export interface ProjectionTabStripProps {
  /** The tabs the result can fill, in reading order. */
  tabs: readonly ProjectionTab[];
  /** The one showing. */
  tab: ProjectionTab;
  /** Called with the tab the reader moved to. */
  onTabChange: (tab: ProjectionTab) => void;
  /** What each tab is called, from the viewer's copy. */
  labels: Readonly<Record<ProjectionTab, string>>;
  /**
   * What each tab is called on a bar with no room for the long name. They are
   * written out rather than truncated: "How much each explains" cut to the
   * width that fits reads "How much each e…", which says less than the one
   * word the tab is about.
   */
  shortLabels: Readonly<Record<ProjectionTab, string>>;
  /**
   * Stem of the `id` every button carries, so the panel below can name the tab
   * it belongs to and a screen reader can walk between the two.
   */
  baseId: string;
  /**
   * The `id` of the panel the buttons drive. One panel is shared, because only
   * the showing tab is ever rendered.
   */
  panelId: string;
  /**
   * How much of itself the bar is writing, which decides whether the names are
   * written in full and whether the strip may scroll rather than shrink.
   * @default 'full'
   */
  tier?: OverlayTier;
  /**
   * The most room the strip may take once it is scrolling, which is whatever
   * the settings and the glyphs at the far end do not need. Without it the row
   * would hand the strip and the settings a share of the shortfall each, and
   * the settings — a chip beside a cog — have nothing to give.
   * @default Number.POSITIVE_INFINITY — the strip takes what it needs
   */
  maxWidth?: number;
  /**
   * What the strip is called, for a reader arriving by tab.
   * @default 'Views'
   */
  label?: string;
}

/**
 * The connected pills that move between a projection's four views.
 *
 * They are the package's one segmented control rather than a strip of their
 * own, so a reader who has pressed the choices inside a settings card has
 * already learned to press these — and the pills sit at the start of the same
 * bar those settings sit at the end of, which is what makes the two read as
 * one piece of chrome instead of two rows stacked over the figure.
 *
 * What a narrowing figure takes from them is words and never views. First the
 * long names give way to the short ones; then, on a figure too narrow to hold
 * four names however short, the strip scrolls and the view in force is brought
 * into sight — a reader who cannot see which view they are on, or cannot reach
 * the others, is stuck rather than merely short of room.
 *
 * The shell draws none at all when the result can fill only one tab: a single
 * pill says nothing about the data and still costs the reader a glance to rule
 * out. The bar itself stays, because the settings and the explanation still
 * belong somewhere.
 * @param props - See {@link ProjectionTabStripProps}.
 * @returns The strip.
 */
export function ProjectionTabStrip(
  props: ProjectionTabStripProps,
): ReactElement {
  const { tabs, tab, onTabChange, labels, shortLabels } = props;
  const { baseId, panelId, tier = 'full', label } = props;
  const { maxWidth = Number.POSITIVE_INFINITY } = props;
  const track = useRef<HTMLDivElement>(null);

  const scrolls = tier === 'tiny';
  const written =
    tier === 'full' || tier === 'condensed' ? labels : shortLabels;
  const options = useMemo<Array<OverlayPillOption<ProjectionTab>>>(
    () => tabs.map((entry) => ({ value: entry, label: written[entry] })),
    [tabs, written],
  );

  useEffect(() => {
    if (!scrolls) return;
    showSelected(track.current);
  }, [scrolls, tab, options, maxWidth]);

  return (
    <div ref={track} style={projectionTabTrackStyle(scrolls, maxWidth)}>
      <OverlayPills<ProjectionTab>
        role="tablist"
        label={label ?? 'Views'}
        value={tab}
        options={options}
        baseId={baseId}
        panelId={panelId}
        onChange={onTabChange}
      />
    </div>
  );
}

/**
 * Bring the view in force back into sight inside a scrolling strip.
 *
 * The box is scrolled by hand rather than through `scrollIntoView`, which asks
 * every scrolling ancestor to move as well — so a figure halfway down somebody
 * else's page would jump under the reader for a tab they can already see.
 *
 * Where the view sits is measured against the strip's own box rather than read
 * off `offsetLeft`, which is relative to whichever ancestor happens to be
 * positioned — here the card, several boxes further out.
 * @param box - The scrolling box, when it has been laid out.
 */
function showSelected(box: HTMLDivElement | null): void {
  if (box === null) return;
  const selected = box.querySelector<HTMLElement>('[aria-selected="true"]');
  if (selected === null) return;
  const seen = selected.getBoundingClientRect();
  const left = seen.left - box.getBoundingClientRect().left + box.scrollLeft;
  box.scrollLeft = projectionTabScroll(
    left,
    left + seen.width,
    box.scrollLeft,
    box.clientWidth,
  );
}
