import { CommandTooltip } from '../../panel/ui/CommandTooltip.tsx';
import type { IrCommandId } from '../core/irCommands.ts';
import { irCommands } from '../core/irCommands.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

import { useIrText } from './useIrText.ts';

export interface IrCommandTooltipProps {
  /** Which command the tooltip is about. */
  id: IrCommandId;
  /**
   * What the spectra were measured with, which decides how the command is
   * worded.
   * @default 'infrared'
   */
  technique?: IrTechnique;
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
  const { id, technique = 'infrared' } = props;
  return (
    <CommandTooltip
      entry={useIrText(technique).command(id) ?? irCommands[id]}
    />
  );
}
