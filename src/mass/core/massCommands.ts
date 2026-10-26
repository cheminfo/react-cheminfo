/**
 * Everything the viewer offers, what each is called, and the key it answers to.
 *
 * One table, read by three things that must agree: the toolbar draws it, the
 * tooltip explains it, and the key handler fires it. Written apart from all
 * three so a command cannot be added to the toolbar without a name, or bound to
 * a key nothing tells the reader about.
 *
 * The keys are the infrared viewer's wherever the two viewers share a command,
 * so a chemist who has learned one has learned the other.
 */

/** The key a command answers to. */
export interface MassShortcut {
  /** The `event.key` values it fires on, the first being the one shown. */
  keys: readonly string[];
  /**
   * How to write the key in a tooltip, where the raw value would read badly.
   * @default the first of `keys`
   */
  label?: readonly string[];
}

/** A gesture that does the same thing, listed under the tooltip's title. */
export interface MassGesture {
  /** Where the gesture is made, or what it is made with. */
  title: string;
  /** The buttons, keys or wheel that make it. */
  shortcuts: readonly string[];
}

/** One thing the viewer can be asked to do. */
export interface MassCommand {
  /** What it is called, which is what the tooltip is titled. */
  title: string;
  /**
   * The key it answers to, absent for a command with none.
   * @default undefined
   */
  shortcut?: MassShortcut;
  /**
   * What it does, in a sentence, under the title in the tooltip.
   * @default undefined
   */
  description?: string;
  /**
   * The gestures that do the same thing, for the ones a key cannot describe.
   * @default undefined
   */
  gestures?: readonly MassGesture[];
}

/** Where the chart is, for a gesture made anywhere on it. */
const OVER_THE_CHART = 'Over the chart';

/** Everything the viewer offers, in the order it is reached for. */
export const massCommands = {
  about: {
    title: 'About the mass spectrum viewer',
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
  openFiles: {
    title: 'Open spectra…',
    shortcut: { keys: ['o'] },
    description:
      'Reads JCAMP-DX files and two-column text files of m/z and intensity, and adds what they hold to the chart.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Drop files'] }],
  },
  readTool: {
    title: 'Read',
    shortcut: { keys: ['r'] },
    description:
      'A drag narrows the m/z axis, which is the question a spectrum is nearly always asked. Released below the baseline, it takes the intensity axis with it.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Drag'] }],
  },
  boxTool: {
    title: 'Square zoom',
    shortcut: { keys: ['b'] },
    description:
      'A drag zooms to exactly the rectangle it sweeps out, both axes at once — for looking into the baseline under a cluster rather than across the spectrum.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Drag a rectangle'] }],
  },
  zoomIn: {
    title: 'Zoom in',
    shortcut: { keys: ['+', '='] },
    description: 'Brings the small peaks up, scaling the intensity about zero.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Scroll wheel'] }],
  },
  zoomOut: {
    title: 'Zoom out',
    shortcut: { keys: ['-'] },
    description: 'Puts the intensity axis back out again.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Scroll wheel'] }],
  },
  resetZoom: {
    title: 'Zoom to fit',
    shortcut: { keys: ['f'] },
    description: 'Shows every spectrum that is drawn, whole.',
    gestures: [{ title: OVER_THE_CHART, shortcuts: ['Double click'] }],
  },
  toggleLabels: {
    title: 'Label the peaks',
    shortcut: { keys: ['l'] },
    description:
      'Writes the m/z and the intensity over the tallest peaks of the selected spectrum. Which peaks follows the zoom: zoom onto a cluster and every line of it is labelled.',
  },
  toggleCharges: {
    title: 'Write the charges',
    shortcut: { keys: ['z'] },
    description:
      'Adds the charge to the label of every peak whose isotopologue spacing, or charge ladder, established one.',
  },
  exportImage: {
    title: 'Save figure…',
    shortcut: { keys: ['x'] },
    description:
      'The chart as it stands, saved as a PNG or an SVG at a chosen resolution, or copied as a PNG.',
  },
  clear: {
    title: 'Close every spectrum',
    description: 'Empties the chart and starts again.',
  },
} as const satisfies Record<string, MassCommand>;

/** Identity of one of the commands the viewer offers. */
export type MassCommandId = keyof typeof massCommands;

/** What to do when each command is run, as the shell wires them. */
export type MassCommandHandlers = Partial<
  Record<MassCommandId, (() => void) | undefined>
>;

/** How a component runs a command. */
export type RunMassCommand = (id: MassCommandId) => void;

/**
 * What a command is called, with its key, for a label and an `aria-label`.
 * @param id - Which command.
 * @returns The title, and the key in parentheses when it has one.
 */
export function massCommandLabel(id: MassCommandId): string {
  const entry: MassCommand = massCommands[id];
  const key = entry.shortcut?.label?.[0] ?? entry.shortcut?.keys[0];
  return key === undefined ? entry.title : `${entry.title} (${key})`;
}
