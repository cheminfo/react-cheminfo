import { TooltipHelpContent } from 'react-science/ui';

import type { XpsCommandId } from '../core/xpsCommands.ts';
import { xpsCommand, xpsShortcutLabels } from '../core/xpsCommands.ts';

export interface XpsCommandTooltipProps {
  /** The command the tooltip is for. */
  command: XpsCommandId;
}

/**
 * What a button does, the key that does the same thing, and the gesture that
 * does it without the button.
 *
 * The same tooltip NMRium uses, off the same component, so a shortcut is read
 * where it is needed — with the pointer already on the button — rather than
 * looked up somewhere else.
 * @param props - Component props.
 * @returns The tooltip.
 */
export function XpsCommandTooltip(props: XpsCommandTooltipProps) {
  const { title, description, gestures } = xpsCommand(props.command);

  return (
    <TooltipHelpContent
      title={title}
      shortcuts={xpsShortcutLabels(props.command)}
      description={description}
      subTitles={gestures?.map((gesture) => ({
        title: gesture.title,
        shortcuts: [...gesture.shortcuts],
      }))}
      style={tooltipStyle}
    />
  );
}

// The component is 250px wide by default, which is a lot of tooltip for a
// three-word title; the ones carrying a description still get the room.
const tooltipStyle = { width: 'auto', maxWidth: 260 } as const;
