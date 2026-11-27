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

import type { EditorCommand } from '../../panel/core/editorCommands.ts';
import {
  commandShortcutLabels,
  matchCommand,
} from '../../panel/core/editorCommands.ts';

/** One thing the viewer can be asked to do. */
type XpsCommand = EditorCommand;

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
  settings: {
    title: 'Instruments',
    description:
      'The instruments a survey is quantified for, and the sensitivity factor each gives every line. Yours are kept in this browser.',
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
  return matchCommand(xpsCommands, event);
}

/**
 * The keys of a command, as a tooltip shows them.
 * @param id - The command.
 * @returns One chip per key, empty when the command has no shortcut.
 */
export function xpsShortcutLabels(id: XpsCommandId): string[] {
  return commandShortcutLabels(xpsCommand(id));
}
