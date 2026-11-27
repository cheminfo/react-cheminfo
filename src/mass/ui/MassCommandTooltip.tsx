import { CommandTooltip } from '../../panel/ui/CommandTooltip.tsx';
import type { MassCommandId } from '../core/massCommands.ts';
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
  return <CommandTooltip entry={massCommands[props.id]} />;
}
