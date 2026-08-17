import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type {
  CanvasEditorInputFormat,
  CanvasEditorOnChangeMolecule,
  CanvasEditorOnChangeReaction,
} from 'react-ocl';
import { CanvasMoleculeEditor, CanvasReactionEditor } from 'react-ocl';

/** What the editor draws: one structure, or a reaction with its arrow. */
export type StructureEditorMode = 'molecule' | 'reaction';

/** Everything the editor holds at the moment it changed. */
export interface StructureEditorChange {
  /** Which kind of editor produced it. */
  mode: StructureEditorMode;
  /**
   * The idCode, with the coordinates the editor laid out written after a
   * space. `splitIdCode` takes the two apart.
   */
  idCode: string;
  /** The V2000 molfile of a molecule, or the RXN file of a reaction. */
  molfile: string;
  /** The SMILES of a molecule, or the reaction SMILES. */
  smiles: string;
}

export interface EditorCanvasProps {
  /** Called on every stroke, with the editor read out synchronously. */
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
   * What the canvas holds when it appears. Read once, at mount: the editor is
   * uncontrolled, so feeding a later value back would replace the structure
   * and reset every coordinate under the pen.
   * @default ''
   */
  value?: string;
  /**
   * Whether the editor draws one structure or a reaction.
   * @default 'molecule'
   */
  mode?: StructureEditorMode;
}

/**
 * The react-ocl canvas, filling whatever box it is put in.
 *
 * Its value is frozen at mount, so the caller remounts it — by changing its
 * `key` — to load a different structure into it.
 * @param props - What to draw, how it is written, and where to send it.
 * @returns The canvas.
 */
export function EditorCanvas(props: EditorCanvasProps): ReactElement {
  const {
    onChange,
    fragment = false,
    inputFormat = 'idcode',
    value = '',
    mode = 'molecule',
  } = props;
  const [initialValue] = useState(value);

  const handleMolecule = useCallback(
    (event: CanvasEditorOnChangeMolecule) => {
      // The event describes the editor only while the callback runs, so every
      // notation is read now and whatever waiting there is happens afterwards.
      onChange({
        mode: 'molecule',
        idCode: event.getIdcode(),
        molfile: event.getMolfile(),
        smiles: event.getSmiles(),
      });
    },
    [onChange],
  );

  const handleReaction = useCallback(
    (event: CanvasEditorOnChangeReaction) => {
      onChange({
        mode: 'reaction',
        idCode: event.getIdcode(),
        molfile: event.getRxn(),
        smiles: event.getSmiles(),
      });
    },
    [onChange],
  );

  return (
    <div style={CANVAS_STYLE}>
      {mode === 'reaction' ? (
        <CanvasReactionEditor
          width="100%"
          height="100%"
          fragment={fragment}
          inputFormat={inputFormat}
          inputValue={initialValue}
          onChange={handleReaction}
        />
      ) : (
        <CanvasMoleculeEditor
          width="100%"
          height="100%"
          fragment={fragment}
          inputFormat={inputFormat}
          inputValue={initialValue}
          onChange={handleMolecule}
        />
      )}
    </div>
  );
}

/**
 * The canvas measures its container in pixels, so it is taken out of the
 * height computation: otherwise the container and the canvas grow each other
 * without ever settling.
 */
const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };
