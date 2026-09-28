import { TooltipHelpContent } from 'react-science/ui';

import type { IrCommand, IrCommandId } from '../core/irCommands.ts';
import { irCommands } from '../core/irCommands.ts';

export interface IrCommandTooltipProps {
  /** Which command the tooltip is about. */
  id: IrCommandId;
}

/**
 * One command's tooltip: its title, what it does, and every way to do it.
 *
 * `TooltipHelpContent` from react-science, which is what NMRium's tooltips are,
 * so a page holding this viewer beside NMRium or the glycan editor explains
 * itself the same way in all three.
 * @param props - Component props.
 * @returns The tooltip's content.
 */
export function IrCommandTooltip(props: IrCommandTooltipProps) {
  const { id } = props;
  const entry = irCommands[id] as IrCommand;
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
