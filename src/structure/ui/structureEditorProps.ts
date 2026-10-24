import type { CSSProperties } from 'react';
import type { CanvasEditorInputFormat } from 'react-ocl';

import type { StructureTransfer } from '../core/structureTransfer.ts';

import type {
  StructureEditorChange,
  StructureEditorMode,
} from './editorChange.ts';

/** What `StructureEditor` needs. */
export interface StructureEditorProps {
  /**
   * Called after every edit, once the drawing has been still for `debounce`
   * milliseconds, with every notation read out of the editor.
   */
  onChange: (change: StructureEditorChange) => void;
  /**
   * Draw a query fragment rather than a whole structure, which is what a
   * substructure filter needs.
   * @default false
   */
  fragment?: boolean;
  /**
   * How `value` is written.
   * @default 'idcode'
   */
  inputFormat?: CanvasEditorInputFormat;
  /**
   * What the canvas holds. Read once, when the editor appears and again on
   * every change of `revision`: the editor is uncontrolled, so feeding the
   * drawing back into it would replace the structure and reset every
   * coordinate under the pen.
   * @default ''
   */
  value?: string;
  /**
   * Bumped by the caller to load `value` into the canvas again, which is what
   * an example, a share link or a Clear button does. Changing it discards
   * whatever was being drawn.
   * @default 0
   */
  revision?: number;
  /**
   * How long the drawing has to be still before `onChange` is called, in
   * milliseconds. Long enough that drawing a ring does not publish six
   * structures; `0` reports every stroke.
   * @default 300
   */
  debounce?: number;
  /**
   * Smallest height of the drawing area, in pixels. Raised to whatever the
   * toolbar needs, which is usually more.
   * @default 320
   */
  minHeight?: number;
  /**
   * Whether the editor draws one structure or a reaction. A reaction canvas
   * has its own toolbar and its own arrow.
   * @default 'molecule'
   */
  mode?: StructureEditorMode;
  /**
   * Explain each toolbar button in a tooltip, and put a button in the corner
   * that opens a guide to the mouse and the keyboard, which F1 opens too.
   * @default true
   */
  help?: boolean;
  /**
   * Put a button in the corner that opens every notation of the drawing — its
   * SMILES, its molfiles, its canonical identifiers — and the picture of it,
   * ready to copy or to save. A reaction has none of those, so it is never
   * offered one.
   * @default true
   */
  exportable?: boolean;
  /**
   * Take a structure dropped on the canvas — a molfile, an SDF, a SMILES or
   * an idCode, as a file or as text dragged from another page — and put a
   * button in the corner that opens one from disk. A reaction canvas takes
   * none.
   * @default true
   */
  importable?: boolean;
  /**
   * Take what is dropped or opened yourself instead of letting the editor read
   * it, for a page that reads more than the canvas does — an XYZ, a PDB, a 3D
   * geometry the canvas would flatten. The page then loads the structure back
   * through `value` and `revision`, like any other.
   * @default undefined
   */
  onImport?: (transfer: StructureTransfer) => void;
  /**
   * Class the container carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
  /**
   * Extra style for the container, merged over the packaged one.
   * @default undefined
   */
  style?: CSSProperties;
}
