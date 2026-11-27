import { CommandTooltip } from '../../panel/ui/CommandTooltip.tsx';
import type { XpsCommandId } from '../core/xpsCommands.ts';
import { xpsCommand } from '../core/xpsCommands.ts';

interface XpsCommandTooltipProps {
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
  return <CommandTooltip entry={xpsCommand(props.command)} />;
}
