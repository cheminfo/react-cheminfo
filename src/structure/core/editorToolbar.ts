/**
 * What each button of the openchemlib canvas editor's toolbar does.
 *
 * The toolbar is one canvas painted from a sprite, so there is no element per
 * button to carry a title: the button under the pointer is found from where
 * the pointer is (see `editorToolbarGeometry.ts`) and its entry here is what
 * the tooltip says.
 */

/**
 * Which editor a button works in. The reaction-only button is drawn greyed in
 * a molecule editor, and the text tool is greyed in every editor react-ocl
 * builds, since neither enables drawing objects.
 */
export type EditorToolbarAvailability = 'always' | 'reaction' | 'never';

/** One button of the toolbar. */
export interface EditorToolbarButton {
  /** How the toolbar's catalog names the button. */
  id: string;
  /** What the button is called, in English. */
  name: string;
  /** What it does, in a sentence or two. */
  description: string;
  /**
   * Keys that pick the tool, pressed while the pointer is over empty canvas.
   * `Mod` stands for ⌘ on a Mac and Ctrl elsewhere.
   * @default undefined — no key
   */
  keys?: readonly string[];
  /**
   * Which editor the button works in.
   * @default 'always'
   */
  availability?: EditorToolbarAvailability;
}

/**
 * The buttons, in the order the toolbar numbers them: down the first column,
 * then down the second.
 */
export const EDITOR_TOOLBAR_BUTTONS: readonly EditorToolbarButton[] = [
  { id: 'clear', name: 'Clear', description: 'Erase the whole drawing.' },
  {
    id: 'cleanUp',
    name: 'Clean up',
    description:
      'Redraw the structure with fresh 2D coordinates. With part of it selected, the rest keeps its layout.',
  },
  {
    id: 'select',
    name: 'Select',
    description:
      'Drag around atoms to select them: hold Alt for a rectangle, Shift to add to the selection. Drag a selection to move it, Shift-drag to copy it.',
    keys: ['Space'],
  },
  {
    id: 'unknownConfiguration',
    name: 'Unknown configuration',
    description:
      'Click a stereocentre to mark its configuration as unknown; click again to undo it.',
  },
  {
    id: 'delete',
    name: 'Delete',
    description: 'Click an atom or a bond to delete it.',
    keys: ['0'],
  },
  {
    id: 'singleBond',
    name: 'Single bond',
    description:
      'Click empty space for a new bond, or drag from an atom. Clicking a bond again makes it double, then triple.',
    keys: ['1'],
  },
  {
    id: 'upBond',
    name: 'Up bond',
    description:
      'Wedged stereo bond, pointing toward the viewer. Its narrow end goes on the stereocentre.',
    keys: ['u'],
  },
  ring('ring3', '3-membered ring', '3'),
  ring('ring5', '5-membered ring', '5'),
  ring('ring7', '7-membered ring', '7'),
  {
    id: 'positiveCharge',
    name: 'Positive charge',
    description: 'Click an atom to raise its charge by one.',
    keys: ['+'],
  },
  atom('carbon', 'Carbon', 'C', 'c'),
  atom('nitrogen', 'Nitrogen', 'N', 'n'),
  atom('oxygen', 'Oxygen', 'O', 'o'),
  atom('fluorine', 'Fluorine', 'F', 'f'),
  atom('bromine', 'Bromine', 'Br', 'b'),
  atom('hydrogen', 'Hydrogen', 'H'),
  {
    id: 'undo',
    name: 'Undo',
    description: 'Revert the last change.',
    keys: ['Mod', 'Z'],
  },
  {
    id: 'zoomAndRotate',
    name: 'Zoom and rotate',
    description:
      'Press where the centre should be, then drag up or down to zoom and sideways to rotate. With a selection, only that part moves.',
    keys: ['z'],
  },
  {
    id: 'atomMapping',
    name: 'Atom mapping',
    description:
      'Drag from a reactant atom to the same atom in a product: both get the same number. Click a mapped atom to unmap it.',
    keys: ['m'],
    availability: 'reaction',
  },
  {
    id: 'enhancedStereo',
    name: 'Enhanced stereo',
    description:
      'Click a stereo bond to say what its centre means: abs, this enantiomer; &, both (racemic); or, one of the two. Press the button again to switch between the three.',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Place a text label in the drawing.',
    availability: 'never',
  },
  {
    id: 'chain',
    name: 'Chain',
    description:
      'Drag from empty space or from an atom to draw a zigzag carbon chain.',
    keys: ['2'],
  },
  {
    id: 'downBond',
    name: 'Down bond',
    description:
      'Hashed stereo bond, pointing away from the viewer. Its narrow end goes on the stereocentre.',
    keys: ['d'],
  },
  ring('ring4', '4-membered ring', '4'),
  ring('ring6', '6-membered ring', '6'),
  ring('benzene', 'Benzene ring', 'a'),
  {
    id: 'negativeCharge',
    name: 'Negative charge',
    description: 'Click an atom to lower its charge by one.',
    keys: ['-'],
  },
  atom('silicon', 'Silicon', 'Si'),
  atom('phosphorus', 'Phosphorus', 'P', 'p'),
  atom('sulfur', 'Sulfur', 'S', 's'),
  atom('chlorine', 'Chlorine', 'Cl', 'l'),
  atom('iodine', 'Iodine', 'I', 'i'),
  {
    id: 'anyAtom',
    name: 'Any atom',
    description:
      'Pick any element, isotope, valence or radical in a dialog, then click to place it or to change an atom. Alt-click an atom to edit its own properties.',
    keys: ['.'],
  },
];

/**
 * Whether a button can be used in an editor of the given kind.
 * @param button - The button.
 * @param mode - The kind of editor.
 * @returns True when pressing the button selects its tool.
 */
export function isEditorToolbarButtonAvailable(
  button: EditorToolbarButton,
  mode: 'molecule' | 'reaction',
): boolean {
  const { availability = 'always' } = button;
  if (availability === 'always') return true;
  return availability === 'reaction' && mode === 'reaction';
}

function ring(id: string, name: string, key: string): EditorToolbarButton {
  return {
    id,
    name,
    description:
      'Click empty space for a new ring, a bond to fuse one onto it, or an atom for a spiro ring.',
    keys: [key],
  };
}

function atom(
  id: string,
  name: string,
  symbol: string,
  key?: string,
): EditorToolbarButton {
  const description = `Click empty space for a new ${symbol} atom, or an atom to turn it into ${symbol}.`;
  return key === undefined
    ? { id, name, description }
    : { id, name, description, keys: [key] };
}
