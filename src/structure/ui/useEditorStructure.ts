/**
 * What is on the editor's canvas, for whoever is not the editor.
 *
 * The canvas is uncontrolled and reports an edit only after the caller's
 * debounce, so a button beside it cannot ask the editor what is drawn. It is
 * tapped here instead, undebounced, and read back the moment it is needed —
 * which keeps the drawing out of the render path: a structure kept in state
 * would re-render the editor on every stroke.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { CanvasEditorInputFormat } from 'react-ocl';

import type { StructureSourceInput } from '../core/structureSource.ts';
import { structureSource } from '../core/structureSource.ts';

import type { StructureEditorChange } from './editorChange.ts';

/** What {@link useEditorStructure} watches. */
export interface EditorStructureOptions {
  /** What the editor was given, in `inputFormat`. */
  value: string;
  /** How that value is written. */
  inputFormat: CanvasEditorInputFormat;
  /** Bumped by the caller to load `value` into the canvas again. */
  revision: number;
}

/** The last edit tracked, and which load of the canvas it belongs to. */
interface Drawn {
  /** The `revision` the canvas was showing when it was edited. */
  revision: number;
  /** The idCode the editor reported, coordinates included. */
  idCode: string;
}

/** The canvas as something beside it can read it. */
export interface EditorStructure {
  /** Called with every edit, before any debounce the caller applies. */
  track: (change: StructureEditorChange) => void;
  /** What is drawn right now, read when a dialog is opened on it. */
  source: () => StructureSourceInput;
  /** Whether the canvas holds nothing. */
  empty: boolean;
}

/**
 * Watch what the canvas holds.
 * @param options - See {@link EditorStructureOptions}.
 * @returns The tap, the reader, and whether anything is drawn.
 */
export function useEditorStructure(
  options: EditorStructureOptions,
): EditorStructure {
  const { value, inputFormat, revision } = options;
  const drawn = useRef<Drawn | null>(null);
  const [tracked, setTracked] = useState<Drawn | null>(null);

  const track = useCallback(
    (change: StructureEditorChange) => {
      // A reaction is not a structure: it has no molecule, and its idCode is a
      // reaction's.
      if (change.mode !== 'molecule') return;
      drawn.current = { revision, idCode: change.idCode };
      setTracked(drawn.current);
    },
    [revision],
  );

  const source = useCallback((): StructureSourceInput => {
    const held = drawn.current;
    // A reload replaces the structure, so an edit made before it describes a
    // canvas that no longer exists: the editor's value is the drawing again.
    // The idCode carries the coordinates after a space, which
    // `structureSource` takes apart.
    return held?.revision === revision
      ? { idCode: held.idCode }
      : given(value, inputFormat);
  }, [revision, value, inputFormat]);

  const givenEmpty = useMemo(
    () => isEmpty(given(value, inputFormat)),
    [value, inputFormat],
  );
  const empty =
    tracked?.revision === revision
      ? isEmpty({ idCode: tracked.idCode })
      : givenEmpty;

  // One object per state rather than per render: it is handed to a `useCallback`
  // in the editor, and a new identity there would rebuild the canvas's handler
  // on every keystroke the page makes elsewhere.
  return useMemo(() => ({ track, source, empty }), [track, source, empty]);
}

/**
 * The editor's own value, as a source.
 * @param value - What the editor was given.
 * @param inputFormat - How it is written.
 * @returns The notation, under the name `structureSource` knows it by.
 */
function given(
  value: string,
  inputFormat: CanvasEditorInputFormat,
): StructureSourceInput {
  if (inputFormat === 'molfile') return { molfile: value };
  if (inputFormat === 'smiles') return { smiles: value };
  return { idCode: value };
}

/**
 * Whether a notation describes nothing — a blank value, the idCode an erased
 * canvas leaves behind, a molfile with no atoms.
 * @param input - The notation.
 * @returns Whether there is nothing to export.
 */
function isEmpty(input: StructureSourceInput): boolean {
  return structureSource(input).kind === 'empty';
}
