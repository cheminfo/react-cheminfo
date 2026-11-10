/**
 * The commands each technique's viewer offers.
 *
 * A Raman viewer offers the infrared table less the commands with nothing to
 * act on — one value axis is nothing to toggle, and no assignment is nothing to
 * name — and words the rest without the absorbance and transmittance it does
 * not have. A UV-vis viewer keeps both axes and drops only the assignments, and
 * words the rest for wavelengths. Each is built from the infrared table, so a
 * command added there reaches all three.
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

/** How a UV-vis viewer words the commands it shares with infrared. */
const UVVIS_WORDING: Partial<Record<IrCommandId, Partial<IrCommand>>> = {
  about: { title: 'About the UV-vis viewer' },
  readTool: {
    description:
      'A drag narrows the wavelength axis, which is the question a spectrum is nearly always asked. Released past the baseline it takes the value axis with it. Reading absorbance only: percent transmittance is zoomed by rectangle alone.',
  },
  boxTool: {
    description:
      'A drag zooms to exactly the rectangle it sweeps out, both axes at once — for looking into a shoulder or a weak band rather than across the spectrum. It is the only drag on percent transmittance.',
  },
  pickTool: {
    title: 'Pick maxima by hand',
    description:
      'A click adds the maximum under it to the selected spectrum; a click on a marked maximum takes it away. A drag still zooms, and maxima picked by hand stay put when the threshold moves.',
  },
  zoomIn: { description: 'Brings the weak bands up, scaling about zero.' },
  togglePicking: {
    title: 'Pick the maxima',
    description:
      'Finds every λmax of the selected spectrum, marks it on the chart and lists it.',
  },
};

/** The command table of each technique. */
const COMMAND_TABLES: Record<IrTechnique, IrCommandTable> = {
  infrared: irCommands,
  raman: worded('raman', RAMAN_WORDING),
  uvvis: worded('uvvis', UVVIS_WORDING),
};

/**
 * The infrared table, less what a technique does not offer and worded its way.
 * @param technique - What was measured.
 * @param wording - What it words its own way.
 * @returns The table.
 */
function worded(
  technique: IrTechnique,
  wording: Partial<Record<IrCommandId, Partial<IrCommand>>>,
): IrCommandTable {
  return Object.fromEntries(
    (Object.keys(irCommands) as IrCommandId[])
      .filter((id) => irCommandOffered(technique, id))
      .map((id) => [id, { ...irCommands[id], ...wording[id] }]),
  );
}
