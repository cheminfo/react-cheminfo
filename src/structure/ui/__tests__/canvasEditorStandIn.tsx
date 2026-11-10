/**
 * A stand-in for react-ocl's two canvas editors, for the tests that mount the
 * structure editor in jsdom.
 *
 * OpenChemLib paints its editor into a 2D canvas context, which jsdom does not
 * have, so the real one throws at mount. The stand-in keeps the part the
 * editor around it depends on: the props it was mounted with, recorded in
 * `canvasLog.ts`, and an `onChange` called with the event react-ocl passes —
 * read off a real OpenChemLib molecule or reaction, so every notation in it is
 * genuine.
 */

import type { Molecule as MoleculeType } from 'openchemlib';
import { Molecule, Reaction, ReactionEncoder } from 'openchemlib';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import type {
  CanvasEditorInputFormat,
  CanvasEditorOnChangeMolecule,
  CanvasEditorOnChangeReaction,
} from 'react-ocl';

import type { CanvasMount } from './canvasLog.ts';
import { canvas } from './canvasLog.ts';

interface StandInProps<TEvent> {
  inputFormat?: CanvasEditorInputFormat;
  inputValue?: string;
  fragment?: boolean;
  onChange: (event: TEvent) => void;
}

/**
 * The molecule editor: an empty canvas, and a pen for the test.
 * @param props - What react-ocl's editor is given.
 * @returns A canvas that paints nothing.
 */
export function CanvasMoleculeEditor(
  props: StandInProps<CanvasEditorOnChangeMolecule>,
): ReactElement {
  const { inputFormat, inputValue, fragment, onChange } = props;
  useMount({ mode: 'molecule', inputFormat, inputValue, fragment });
  useEffect(() => {
    canvas.draw = (smiles) => onChange(moleculeEvent(smiles));
  });
  return <canvas data-testid="canvas-editor" data-mode="molecule" />;
}

/**
 * The reaction editor: an empty canvas, and a pen for the test.
 * @param props - What react-ocl's editor is given.
 * @returns A canvas that paints nothing.
 */
export function CanvasReactionEditor(
  props: StandInProps<CanvasEditorOnChangeReaction>,
): ReactElement {
  const { inputFormat, inputValue, fragment, onChange } = props;
  useMount({ mode: 'reaction', inputFormat, inputValue, fragment });
  useEffect(() => {
    canvas.draw = (smiles) => onChange(reactionEvent(smiles));
  });
  return <canvas data-testid="canvas-editor" data-mode="reaction" />;
}

// Read once per mount, as the real editor reads its value only then.
function useMount(props: CanvasMount): void {
  const [mount] = useState(props);
  useEffect(() => {
    canvas.mounts.push(mount);
  }, [mount]);
}

function moleculeEvent(smiles: string): CanvasEditorOnChangeMolecule {
  const molecule: MoleculeType =
    smiles === '' ? new Molecule(0, 0) : Molecule.fromSmiles(smiles);
  return {
    getIdcode: () => `${molecule.getIDCode()} ${molecule.getIDCoordinates()}`,
    getMolfile: () => molecule.toMolfile(),
    getMolfileV3: () => molecule.toMolfileV3(),
    getSmiles: () => molecule.toIsomericSmiles(),
    getMolecule: () => molecule.getCompactCopy(),
  };
}

function reactionEvent(smiles: string): CanvasEditorOnChangeReaction {
  const reaction = Reaction.fromSmiles(smiles);
  return {
    getIdcode: () => ReactionEncoder.encode(reaction) ?? '',
    getRxn: () => reaction.toRxn(),
    getRxnV3: () => reaction.toRxnV3(),
    getSmiles: () => reaction.toSmiles(),
  };
}
