/**
 * What the mouse and the keyboard do on the molecule canvas: molstar's default
 * trackball and focus bindings, which the viewer keeps.
 */

/** A key, drawn as a key cap. */
export interface Molecule3DGestureKey {
  key: string;
}

/** One gesture and what it does. */
export interface Molecule3DGesture {
  /** Keys, and plain text for the mouse part; unique within one gesture. */
  input: ReadonlyArray<string | Molecule3DGestureKey>;
  action: string;
}

/** The gestures, in the order the help popover lists them. */
export const MOLECULE_3D_GESTURES: readonly Molecule3DGesture[] = [
  { input: ['Drag'], action: 'Rotate' },
  {
    input: [{ key: 'Shift' }, '+', { key: 'Ctrl' }, '+ drag'],
    action: 'Rotate in the plane of the screen',
  },
  {
    input: [{ key: 'Q' }, 'or', { key: 'E' }],
    action: 'Rotate in the plane, while held',
  },
  { input: ['Right-drag'], action: 'Move' },
  { input: [{ key: 'Ctrl' }, '+ drag'], action: 'Move' },
  { input: ['Scroll'], action: 'Zoom' },
  { input: [{ key: 'Shift' }, '+ scroll'], action: 'Clip around the centre' },
  { input: ['Click an atom'], action: 'Centre on it' },
  { input: ['Click the background'], action: 'Centre on the molecule' },
];
