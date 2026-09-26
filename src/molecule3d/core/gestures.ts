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
  /** How the help's catalog names the gesture. */
  id: string;
  /** Keys, and plain text for the mouse part; unique within one gesture. */
  input: ReadonlyArray<string | Molecule3DGestureKey>;
  /** What it does, in English; the catalog answers for the other languages. */
  action: string;
}

/** The gestures, in the order the help popover lists them. */
export const MOLECULE_3D_GESTURES: readonly Molecule3DGesture[] = [
  { id: 'rotate', input: ['Drag'], action: 'Rotate' },
  {
    id: 'rollDrag',
    input: [{ key: 'Shift' }, '+', { key: 'Ctrl' }, '+ drag'],
    action: 'Rotate in the plane of the screen',
  },
  {
    id: 'rollKeys',
    input: [{ key: 'Q' }, 'or', { key: 'E' }],
    action: 'Rotate in the plane, while held',
  },
  { id: 'moveDrag', input: ['Right-drag'], action: 'Move' },
  { id: 'moveCtrl', input: [{ key: 'Ctrl' }, '+ drag'], action: 'Move' },
  { id: 'zoom', input: ['Scroll'], action: 'Zoom' },
  {
    id: 'clip',
    input: [{ key: 'Shift' }, '+ scroll'],
    action: 'Clip around the centre',
  },
  { id: 'centreAtom', input: ['Click an atom'], action: 'Centre on it' },
  {
    id: 'centreMolecule',
    input: ['Click the background'],
    action: 'Centre on the molecule',
  },
];

// The words a gesture writes between its key caps, keyed here rather than
// slugged from the text, because `Drag` and `+ drag` would slug alike.
const INPUT_WORD_IDS: Record<string, string> = {
  Drag: 'drag',
  '+': 'plus',
  '+ drag': 'plusDrag',
  '+ scroll': 'plusScroll',
  or: 'or',
  'Right-drag': 'rightDrag',
  Scroll: 'scroll',
  'Click an atom': 'clickAtom',
  'Click the background': 'clickBackground',
};

/**
 * How the catalog names one of the words a gesture writes between its key
 * caps.
 * @param text - The word, in English.
 * @returns Its id, or `undefined` for punctuation nobody translates.
 */
export function molecule3dInputWordId(text: string): string | undefined {
  return INPUT_WORD_IDS[text];
}
