/**
 * What the viewer can be asked to do from a button, and the key that asks for
 * the same thing.
 *
 * One table drives both halves, so a tooltip cannot advertise a key that does
 * nothing and a key cannot go unmentioned. Every one of them is a bare press
 * with no modifier: a spectrum is read with one hand on the mouse, and a chord
 * needs the other one. The three that switch a layer on and off are the initial
 * of what they draw — `r` for the regions, `c` for the components, `l` for the
 * labels — because those are the three things a reader turns off to see the
 * measurement underneath and then turns straight back on.
 */

/** The key a command answers to. */
export interface XpsShortcut {
  /** The `event.key` values it fires on, the first being the one shown. */
  keys: readonly string[];
  /**
   * How the keys are shown when they do not read as themselves.
   * @default the first of `keys`
   */
  label?: readonly string[];
}

/** A gesture that does the same thing, listed under the tooltip's title. */
export interface XpsGesture {
  /** Where the gesture is made, or what it is made with. */
  title: string;
  /** The buttons, keys or wheel that make it. */
  shortcuts: readonly string[];
}

/** One thing the viewer can be asked to do. */
export interface XpsCommand {
  /** What it is called, which is what the tooltip is titled. */
  title: string;
  /**
   * The key that asks for it, left out for the one that closes a file somebody
   * spent a minute loading.
   * @default undefined
   */
  shortcut?: XpsShortcut;
  /**
   * What it does, when the title does not already say it.
   * @default undefined
   */
  description?: string;
  /**
   * The gestures that do the same thing, shown under the title. A gesture
   * nobody has been told about is not a feature, and the chart is worked far
   * more by wheel and drag than by the rail.
   * @default []
   */
  gestures?: readonly XpsGesture[];
}

/** Everything the viewer offers, in the order it is reached for. */
export const xpsCommands = {
  about: {
    title: 'About the XPS viewer',
    description: 'What it reads, what it is built on, and what it credits.',
  },
  documentation: {
    title: 'Documentation',
    shortcut: { keys: ['h'] },
    description:
      'The binding-energy convention, the backgrounds, what a component is, and every gesture.',
  },
  fullScreen: {
    title: 'Full screen',
    description:
      'The viewer takes the whole screen rather than its corner of the page. Esc gives it back.',
  },
  zoomIn: {
    title: 'Zoom in on the counts',
    shortcut: { keys: ['+', '='] },
    description:
      'Brings the weak lines up — a survey scan spans four decades, so the Si 2p line is invisible at the window that fits the O 1s. The energy axis is zoomed by dragging across the part of the chart you want.',
    gestures: [{ title: 'Over the chart', shortcuts: ['Scroll wheel'] }],
  },
  zoomOut: {
    title: 'Zoom out from the counts',
    shortcut: { keys: ['-', '_'] },
    description: 'Takes the tall lines back down.',
    gestures: [{ title: 'Over the chart', shortcuts: ['Scroll wheel'] }],
  },
  resetZoom: {
    title: 'Show the whole spectrum',
    shortcut: { keys: ['f'] },
    description: 'Gives the window back to the chart, both axes at once.',
    gestures: [{ title: 'On the chart', shortcuts: ['Double click'] }],
  },
  toggleAxis: {
    title: 'Read on kinetic energy',
    shortcut: { keys: ['k'] },
    description:
      'Switches the axis between binding energy, what a spectrum is published in, and kinetic energy, what the analyser measured. A file that states no photon energy stays on kinetic energy either way.',
  },
  toggleNormalise: {
    title: 'Put every spectrum on a 0–100 scale',
    shortcut: { keys: ['n'] },
    description:
      'Spectra acquired with different dwell times are compared by shape, never by counts. Off, the counts are drawn as they were measured.',
  },
  showRegions: {
    title: 'Shade the fitted regions',
    shortcut: { keys: ['r'] },
    description:
      'The windows the file defines a background under, shaded on the chart with the background type written above each.',
  },
  showComponents: {
    title: 'Draw the fitted components',
    shortcut: { keys: ['c'] },
    description:
      'The peaks the file was fitted with, each filled under its own curve, with their sum drawn dashed over the measurement.',
  },
  showLabels: {
    title: 'Write the peak energies',
    shortcut: { keys: ['l'] },
    description:
      'The binding energy of the strongest peaks, written above them, most intense first.',
  },
  exportImage: {
    title: 'Save or copy the chart',
    description:
      'The chart as it is shown — its window, its axis, its labels — as an SVG or a PNG.',
  },
  clear: {
    title: 'Close every spectrum',
    description: 'Start again from an empty chart.',
  },
} as const satisfies Record<string, XpsCommand>;

/** One of the things the viewer can be asked to do. */
export type XpsCommandId = keyof typeof xpsCommands;

/**
 * One command, read as a command rather than as the literal it is written as.
 * @param id - The command.
 * @returns What it is called, what it does, and the key that asks for it.
 */
export function xpsCommand(id: XpsCommandId): XpsCommand {
  return xpsCommands[id];
}

/**
 * The command a key press asks for, if any.
 *
 * A press carrying a modifier asks for nothing: every chord belongs to the
 * browser or to the page around the viewer, and `Ctrl`+`C` is somebody copying
 * a peak table rather than hiding the components. A bare key is only ever read
 * as a shortcut when nothing is being typed into, which the caller checks since
 * only it knows where the press landed.
 * @param event - The key press.
 * @returns The command, `null` when the press asks for nothing.
 */
export function matchXpsCommand(
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
): XpsCommandId | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  for (const id of Object.keys(xpsCommands) as XpsCommandId[]) {
    const { shortcut } = xpsCommand(id);
    if (shortcut === undefined) continue;
    if (shortcut.keys.includes(event.key)) return id;
  }
  return null;
}

/**
 * The keys of a command, as a tooltip shows them.
 * @param id - The command.
 * @returns One chip per key, empty when the command has no shortcut.
 */
export function xpsShortcutLabels(id: XpsCommandId): string[] {
  const { shortcut } = xpsCommand(id);
  if (shortcut === undefined) return [];
  return [...(shortcut.label ?? shortcut.keys.slice(0, 1))];
}
