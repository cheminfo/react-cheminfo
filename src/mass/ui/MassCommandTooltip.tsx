import { TooltipHelpContent } from 'react-science/ui';

import type { MassCommand, MassCommandId } from '../core/massCommands.ts';
import { massCommands } from '../core/massCommands.ts';

export interface MassCommandTooltipProps {
  /** Which command the tooltip is about. */
  id: MassCommandId;
}

/**
 * One command's tooltip: its title, what it does, and every way to do it.
 *
 * `TooltipHelpContent` from react-science, which is what NMRium's tooltips and
 * the infrared viewer's are, so a page holding these viewers side by side
 * explains itself the same way in all of them.
 * @param props - Component props.
 * @returns The tooltip's content.
 */
export function MassCommandTooltip(props: MassCommandTooltipProps) {
  const { id } = props;
  const entry: MassCommand = massCommands[id];
  const shortcuts = entry.shortcut?.label ?? entry.shortcut?.keys;

  return (
    <TooltipHelpContent
      title={entry.title}
      description={entry.description}
      shortcuts={shortcuts === undefined ? undefined : [...shortcuts]}
      subTitles={entry.gestures?.map((gesture) => ({
        title: gesture.title,
        shortcuts: [...gesture.shortcuts],
      }))}
    />
  );
}
