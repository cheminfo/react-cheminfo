/**
 * The column of icons down the right edge, which opens and shuts the panels.
 *
 * Only the bar and its icons: each editor keeps the element it hangs the rail
 * in, because where the rail sits — outside the split, so the icons stay against
 * the edge while the panel beside them is resized — is a decision about that
 * editor's layout rather than about the rail.
 */

import type { IconName, MaybeElement } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { ActivityBar } from 'react-science/ui';

/**
 * One panel the rail can open.
 *
 * Generic in its own id, because each editor names its panels in a union of its
 * own and hands the rail the very function that opens them — a rail that took
 * plain strings would refuse every one of those functions.
 */
export interface RailPanel<TId extends string = string> {
  /** Which panel, matching what the editor's state calls it. */
  id: TId;
  /** The Blueprint icon it is known by. */
  icon: IconName | MaybeElement;
  /** What the tooltip reads. */
  title: string;
}

/** What the rail is given. */
export interface PanelRailProps<TId extends string = string> {
  /** The panels offered, in the order they are shown. */
  panels: ReadonlyArray<RailPanel<TId>>;
  /** Which of them are open. */
  openIds: readonly string[];
  /** Called with the panel an icon was clicked for. */
  onToggle: (id: TId) => void;
}

/**
 * Draw the rail.
 * @param props - The panels, which are open, and what to do about a click.
 * @returns The rail.
 */
export function PanelRail<TId extends string>(
  props: PanelRailProps<TId>,
): ReactNode {
  const { panels, openIds, onToggle } = props;

  return (
    <ActivityBar>
      {panels.map((panel) => (
        <ActivityBar.Item
          key={panel.id}
          id={panel.id}
          icon={panel.icon}
          tooltip={panel.title}
          active={openIds.includes(panel.id)}
          onClick={() => onToggle(panel.id)}
        />
      ))}
    </ActivityBar>
  );
}
