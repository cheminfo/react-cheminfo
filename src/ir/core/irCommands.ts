/**
 * Everything the viewer offers, what each is called, and the key it answers to.
 *
 * One table, read by three things that must agree: the toolbar draws it, the
 * tooltip explains it, and the key handler fires it. Written apart from all
 * three so a command cannot be added to the toolbar without a name, or bound to
 * a key nothing tells the reader about.
 *
 * The provider, the hooks and the tooltip are three files of their own beside
 * this one, because a module that exports a component and a constant together
 * cannot be hot reloaded — `react-refresh/only-export-components` is the rule
 * that says so, and the split is the fix rather than the exception.
 */

/** The key a command answers to. */
export interface IrShortcut {
  /** The `event.key` values it fires on, the first being the one shown. */
  keys: readonly string[];
  /**
   * How to write the key in a tooltip, where the raw value would read badly.
   * @default the first of `keys`
   */
  label?: readonly string[];
}

/** A gesture that does the same thing, listed under the tooltip's title. */
export interface IrGesture {
  /** Where the gesture is made, or what it is made with. */
  title: string;
  /** The buttons, keys or wheel that make it. */
  shortcuts: readonly string[];
}

/** One thing the viewer can be asked to do. */
export interface IrCommand {
  /** What it is called, which is what the tooltip is titled. */
  title: string;
  /**
   * The key it answers to, absent for a command with none.
   * @default undefined
   */
  shortcut?: IrShortcut;
  /**
   * What it does, in a sentence, under the title in the tooltip.
   * @default undefined
   */
  description?: string;
  /**
   * The gestures that do the same thing, for the ones a key cannot describe.
   * @default undefined
   */
  gestures?: readonly IrGesture[];
}

/** Everything the viewer offers, in the order it is reached for. */
export const irCommands = {
  about: {
    title: 'About the infrared viewer',
    description: 'What it reads, what it is built on, and what it credits.',
  },
  documentation: {
    title: 'Documentation',
    shortcut: { keys: ['h'] },
    description:
      'How to open a spectrum, what the panels hold, and every gesture.',
  },
  fullScreen: {
    title: 'Full screen',
    description:
      'The viewer takes the whole screen rather than its corner of the page. Esc gives it back.',
  },
  readTool: {
    title: 'Read',
    shortcut: { keys: ['r'] },
    description:
      'A drag narrows the wavenumber axis, which is the question a spectrum is nearly always asked. Released past the baseline it takes the value axis with it. Reading absorbance only: percent transmittance is zoomed by rectangle alone.',
    gestures: [{ title: 'Reading absorbance', shortcuts: ['Drag'] }],
  },
  boxTool: {
    title: 'Square zoom',
    shortcut: { keys: ['b'] },
    description:
      'A drag zooms to exactly the rectangle it sweeps out, both axes at once — for looking into a baseline or a shoulder rather than across the spectrum. It is the only drag on percent transmittance.',
    gestures: [{ title: 'Over the chart', shortcuts: ['Drag a rectangle'] }],
  },
  zoomIn: {
    title: 'Zoom in',
    shortcut: { keys: ['+', '='] },
    description: 'Brings the weak bands up, about the baseline they hang from.',
    gestures: [{ title: 'Reading absorbance', shortcuts: ['Scroll wheel'] }],
  },
  zoomOut: {
    title: 'Zoom out',
    shortcut: { keys: ['-'] },
    description: 'Puts the value axis back out again.',
    gestures: [{ title: 'Reading absorbance', shortcuts: ['Scroll wheel'] }],
  },
  resetZoom: {
    title: 'Zoom to fit',
    shortcut: { keys: ['f'] },
    description: 'Shows every spectrum that is drawn, whole.',
    gestures: [{ title: 'Over the chart', shortcuts: ['Double click'] }],
  },
  toggleMode: {
    title: 'Absorbance or transmittance',
    shortcut: { keys: ['t'] },
    description:
      'The same measurement read the other way up. Bands hang down from 100 % transmittance and stand up out of zero absorbance.',
  },
  togglePicking: {
    title: 'Pick the bands',
    shortcut: { keys: ['p'] },
    description:
      'Finds the bands of the selected spectrum, marks them on the chart and lists them with everything each might be.',
  },
  toggleAssignments: {
    title: 'Name the assignments',
    shortcut: { keys: ['a'] },
    description:
      'Writes what each labelled band might be under its wavenumber. Worth turning off once the chart is crowded.',
  },
  exportImage: {
    title: 'Export as an image…',
    shortcut: { keys: ['x'] },
    description:
      'The chart as it stands, at a chosen resolution — PNG, or SVG, which is drawn again at whatever size it is printed rather than enlarged.',
  },
  clear: {
    title: 'Close every spectrum',
    description: 'Empties the chart and starts again.',
  },
} as const satisfies Record<string, IrCommand>;

/** Identity of one of the commands the viewer offers. */
export type IrCommandId = keyof typeof irCommands;

/** What to do when each command is run, as the shell wires them. */
export type IrCommandHandlers = Partial<
  Record<IrCommandId, (() => void) | undefined>
>;

/** How a component runs a command. */
export type RunIrCommand = (id: IrCommandId) => void;

/**
 * What a command is called, with its key, for a label and an `aria-label`.
 * @param id - Which command.
 * @returns The title, and the key in parentheses when it has one.
 */
export function irCommandLabel(id: IrCommandId): string {
  const entry = irCommands[id] as IrCommand;
  const key = entry.shortcut?.label?.[0] ?? entry.shortcut?.keys[0];
  return key === undefined ? entry.title : `${entry.title} (${key})`;
}
