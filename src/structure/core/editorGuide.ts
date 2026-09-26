/**
 * What the keyboard and the mouse do in the openchemlib canvas editor, beyond
 * what its toolbar shows: the keys that change the atom or the bond under the
 * pointer, the selection gestures and the stereo conventions.
 */

/** A key, drawn as a key cap. `Mod` is ⌘ on a Mac and Ctrl elsewhere. */
export interface EditorGuideKey {
  key: string;
}

/** Which editors a gesture applies to. */
export type EditorGuideScope = 'fragment' | 'molecule' | 'reaction';

/** One gesture and what it does. */
export interface EditorGesture {
  /** How the guide's catalog names it, unique within its section. */
  id: string;
  /** Keys, and plain text for the mouse part; unique within one gesture. */
  input: ReadonlyArray<string | EditorGuideKey>;
  /** What it does, in English; the catalog answers for the other languages. */
  action: string;
  /**
   * The only editor the gesture works in.
   * @default undefined — every editor
   */
  only?: EditorGuideScope;
}

/** Gestures that share a context, such as the pointer resting on an atom. */
export interface EditorGuideSection {
  /** How the guide's catalog names the section. */
  id: string;
  title: string;
  gestures: readonly EditorGesture[];
  /**
   * A sentence read after the gestures.
   * @default undefined
   */
  note?: string;
}

/** A page of the full documentation. */
export interface EditorGuideLink {
  /** How the guide's catalog names the page. */
  id: string;
  title: string;
  url: string;
}

/** The sections, in the order the guide lists them. */
export const STRUCTURE_EDITOR_GUIDE: readonly EditorGuideSection[] = [
  {
    id: 'atom',
    title: 'Pointer on an atom',
    gestures: [
      {
        id: 'element',
        input: ['Type', { key: 'n' }, { key: 'a' }],
        action: 'Make it Na',
      },
      {
        id: 'group',
        input: ['Type', { key: 'p' }, { key: 'h' }],
        action: 'Attach a phenyl; Me, Et, Boc, TMS… work too',
      },
      {
        id: 'applyOrForget',
        input: [{ key: 'Enter' }, 'or', { key: 'Esc' }],
        action: 'Apply or forget what was typed',
      },
      {
        id: 'chain',
        input: [{ key: '1' }, '…', { key: '9' }],
        action: 'Attach a chain of that many carbons',
      },
      {
        id: 'charge',
        input: [{ key: '+' }, 'or', { key: '-' }],
        action: 'Raise or lower the charge',
      },
      {
        id: 'radical',
        input: [{ key: '.' }],
        action: 'Add or remove a radical',
      },
      {
        id: 'spin',
        input: [{ key: ':' }],
        action: 'Make it a triplet, then a singlet',
      },
      {
        id: 'attachment',
        input: [{ key: '?' }],
        action: 'Make it a connection point',
      },
      {
        id: 'query',
        input: [{ key: 'q' }],
        action: 'Edit its query features',
        only: 'fragment',
      },
      {
        id: 'halogen',
        input: [{ key: 'x' }],
        action: 'Accept any halogen',
        only: 'fragment',
      },
      { id: 'delete', input: [{ key: 'Delete' }], action: 'Delete it' },
    ],
    note: 'What is typed shows black for an element, blue for a group, grey while incomplete and red when unknown.',
  },
  {
    id: 'bond',
    title: 'Pointer on a bond',
    gestures: [
      {
        id: 'order',
        input: [{ key: '1' }, { key: '2' }, { key: '3' }],
        action: 'Single, double or triple',
      },
      {
        id: 'zeroOrder',
        input: [{ key: '0' }],
        action: 'Zero-order (metal–ligand) bond',
      },
      {
        id: 'stereo',
        input: [{ key: 'u' }, 'or', { key: 'd' }],
        action: 'Up or down stereo bond',
      },
      {
        id: 'unknownGeometry',
        input: [{ key: 'c' }],
        action: 'Double bond of unknown geometry',
      },
      {
        id: 'threeRing',
        input: [{ key: 'v' }],
        action: 'Fuse a 3-membered ring',
      },
      {
        id: 'ring',
        input: [{ key: '4' }, '…', { key: '7' }],
        action: 'Fuse a ring of that size',
      },
      {
        id: 'benzene',
        input: [{ key: 'a' }, 'or', { key: 'b' }],
        action: 'Fuse a benzene ring',
      },
      {
        id: 'query',
        input: [{ key: 'q' }],
        action: 'Edit its query features',
        only: 'fragment',
      },
      { id: 'delete', input: [{ key: 'Delete' }], action: 'Delete it' },
    ],
  },
  {
    id: 'anywhere',
    title: 'Anywhere',
    gestures: [
      { id: 'undo', input: [{ key: 'Mod' }, { key: 'Z' }], action: 'Undo' },
      {
        id: 'copy',
        input: [{ key: 'Mod' }, { key: 'C' }],
        action: 'Copy the structure',
      },
      {
        id: 'paste',
        input: [{ key: 'Mod' }, { key: 'V' }],
        action: 'Paste a molfile, a SMILES or an idCode',
      },
      {
        id: 'deleteSelection',
        input: [{ key: 'Delete' }],
        action: 'Delete the selection',
      },
      {
        id: 'flip',
        input: [{ key: 'h' }, 'or', { key: 'v' }],
        action: 'Flip horizontally or vertically',
        only: 'molecule',
      },
      { id: 'help', input: [{ key: 'F1' }], action: 'Open this guide' },
    ],
    note: 'Keys act once the drawing has been clicked. On empty canvas, a key picks the tool whose tooltip shows it.',
  },
  {
    id: 'selecting',
    title: 'Selecting',
    gestures: [
      {
        id: 'lasso',
        input: ['Drag'],
        action: 'Select what the lasso encloses',
      },
      {
        id: 'rectangle',
        input: [{ key: 'Alt' }, '+ drag'],
        action: 'Select a rectangle',
      },
      {
        id: 'add',
        input: [{ key: 'Shift' }, '+ drag'],
        action: 'Add to the selection',
      },
      { id: 'move', input: ['Drag the selection'], action: 'Move it' },
      {
        id: 'duplicate',
        input: [{ key: 'Shift' }, '+ drag the selection'],
        action: 'Copy it',
      },
      {
        id: 'queryFeatures',
        input: ['Double-click'],
        action: 'Edit the query features of an atom, a bond or the selection',
        only: 'fragment',
      },
    ],
    note: 'These need the Select tool, which Space picks.',
  },
  {
    id: 'stereochemistry',
    title: 'Stereochemistry',
    gestures: [],
    note: 'Pink bonds flag a stereocentre with too little or too much information. Draw an up or down bond with its narrow end on the centre, then use the enhanced stereo tool to say whether the drawing is this enantiomer (abs), both of them (&) or one of the two (or).',
  },
];

/** The documentation this guide summarises. */
export const STRUCTURE_EDITOR_DOCS: readonly EditorGuideLink[] = [
  {
    id: 'toolsAndKeys',
    title: 'Tools and keys',
    url: 'https://docs.nmrium.org/help/ocl/',
  },
  {
    id: 'atomProperties',
    title: 'Atom properties',
    url: 'https://docs.nmrium.org/chemical_structure/ocl/atom-properties/',
  },
  {
    id: 'stereochemistry',
    title: 'Stereochemistry',
    url: 'https://docs.nmrium.org/ocl/stereochemistry/',
  },
];

/** The editor a guide is written for. */
export interface EditorGuideOptions {
  /**
   * Whether the editor draws one structure or a reaction.
   * @default 'molecule'
   */
  mode?: 'molecule' | 'reaction';
  /**
   * Whether the editor draws a query fragment.
   * @default false
   */
  fragment?: boolean;
}

/**
 * The guide for one editor: gestures that do nothing there are left out, and so
 * is a section left with nothing to say.
 * @param options - The editor the guide is for.
 * @returns The sections to show.
 */
export function editorGuideSections(
  options: EditorGuideOptions = {},
): EditorGuideSection[] {
  const { mode = 'molecule', fragment = false } = options;
  const sections: EditorGuideSection[] = [];
  for (const section of STRUCTURE_EDITOR_GUIDE) {
    const gestures = section.gestures.filter(({ only }) =>
      appliesTo(only, mode, fragment),
    );
    if (gestures.length === 0 && section.note === undefined) continue;
    sections.push({ ...section, gestures });
  }
  return sections;
}

function appliesTo(
  only: EditorGuideScope | undefined,
  mode: 'molecule' | 'reaction',
  fragment: boolean,
): boolean {
  if (only === undefined) return true;
  if (only === 'fragment') return fragment;
  return only === mode;
}

// The words a gesture writes between its key caps. They are keyed here rather
// than slugged from the text, because `Drag` and `+ drag` would slug alike.
const INPUT_WORD_IDS: Record<string, string> = {
  Type: 'type',
  or: 'or',
  Drag: 'drag',
  '+ drag': 'plusDrag',
  'Drag the selection': 'dragSelection',
  '+ drag the selection': 'plusDragSelection',
  'Double-click': 'doubleClick',
};

/**
 * How the catalog names one of the words a gesture writes between its key
 * caps.
 * @param text - The word, in English.
 * @returns Its id, or `undefined` for punctuation nobody translates.
 */
export function editorInputWordId(text: string): string | undefined {
  return INPUT_WORD_IDS[text];
}

/**
 * The text of a key cap.
 * @param key - The key, `Mod` standing for the platform's shortcut modifier.
 * @param isMac - Whether the page runs on a Mac.
 * @returns What the cap shows.
 */
export function editorKeyLabel(key: string, isMac: boolean): string {
  if (key !== 'Mod') return key;
  return isMac ? '⌘' : 'Ctrl';
}
