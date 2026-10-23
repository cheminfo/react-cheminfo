/**
 * The commands each technique's viewer offers.
 *
 * A Raman viewer offers the infrared table less the commands with nothing to
 * act on — one value axis is nothing to toggle, and no assignment is nothing to
 * name — and words the rest without the absorbance and transmittance it does
 * not have. It is built from the infrared table, so a command added there
 * reaches both.
 */

import type { IrCommand, IrCommandId, IrCommandTable } from './irCommands.ts';
import { irCommands } from './irCommands.ts';
import type { IrTechnique } from './irTechnique.ts';
import { IR_TECHNIQUE_RULES } from './irTechnique.ts';

/**
 * Whether a viewer of a technique offers a command at all.
 * @param technique - What was measured.
 * @param id - Which command.
 * @returns False for the toggle of a technique with one value axis, and for
 * the assignments of one the correlation table says nothing about.
 */
export function irCommandOffered(
  technique: IrTechnique,
  id: IrCommandId,
): boolean {
  const { modes, assignments } = IR_TECHNIQUE_RULES[technique];
  if (id === 'toggleMode') return modes.length > 1;
  if (id === 'toggleAssignments') return assignments;
  return true;
}

/**
 * Everything a viewer of a technique offers, in the order it is reached for.
 * @param technique - What was measured.
 * @returns The table; for infrared, `irCommands` itself.
 */
export function irCommandsFor(technique: IrTechnique): IrCommandTable {
  return COMMAND_TABLES[technique];
}

/** Where the chart is, for a gesture made anywhere on it. */
const OVER_THE_CHART = 'Over the chart';

/** How a Raman viewer words the commands it shares with infrared. */
const RAMAN_WORDING: Partial<Record<IrCommandId, Partial<IrCommand>>> = {
  about: { title: 'About the Raman viewer' },
  documentation: {
    description: 'How the bands are read, and every gesture.',
  },
  readTool: {
    description:
      'A drag narrows the Raman shift axis. Released past the baseline, it takes the intensity axis with it.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Drag'] }],
  },
  boxTool: {
    description:
      'A drag zooms to exactly the rectangle it sweeps out, both axes at once — for looking into a baseline or a shoulder rather than across the spectrum.',
  },
  zoomIn: {
    description:
      'Brings the weak bands up, scaling the intensity axis about zero.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Scroll wheel'] }],
  },
  zoomOut: {
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Scroll wheel'] }],
  },
  togglePicking: {
    description:
      'Finds the bands of the selected spectrum, marks them on the chart and lists them.',
  },
};

/** The command table of each technique. */
const COMMAND_TABLES: Record<IrTechnique, IrCommandTable> = {
  infrared: irCommands,
  raman: Object.fromEntries(
    (Object.keys(irCommands) as IrCommandId[])
      .filter((id) => irCommandOffered('raman', id))
      .map((id) => [id, { ...irCommands[id], ...RAMAN_WORDING[id] }]),
  ),
};
