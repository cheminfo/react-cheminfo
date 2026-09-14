/**
 * The react-ocl depiction of a structure whose notation has already been
 * picked.
 *
 * `Structure` holds it behind `React.lazy`, and the barrel deliberately does
 * not export it: this is the file that value-imports react-ocl and
 * openchemlib, so anything able to reach it statically drags openchemlib into
 * every bundle, including the ones that only ever wanted the Tools menu.
 */

import { Molecule } from 'openchemlib';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import { SvgRenderer } from 'react-ocl';

import type { AtomLabelPlacement } from '../core/atomLabels.ts';
import { applyAtomLabels } from '../core/atomLabels.ts';
import type { StructureSource } from '../core/structureSource.ts';

import { StructurePlaceholder } from './StructurePlaceholder.tsx';

/** Props of {@link StructureSvg}. */
interface StructureSvgProps {
  /** The notation to draw, as `structureSource` picked it. */
  source: StructureSource;
  /** Width of the picture, in pixels. */
  width: number;
  /** Height of the picture, in pixels. */
  height: number;
  /** Crop the picture to the atoms rather than centring them in the box. */
  autoCrop: boolean;
  /** Blank space kept around the structure when it is cropped, in pixels. */
  autoCropMargin: number;
  /**
   * Atoms to paint, which is how a substructure match is shown.
   * @default undefined
   */
  atomHighlight?: number[];
  /** The colour the highlighted atoms are painted. */
  atomHighlightColor: string;
  /**
   * Bonds to paint.
   * @default undefined
   */
  bondHighlight?: number[];
  /** The colour the highlighted bonds are painted. */
  bondHighlightColor: string;
  /** Write the index of every atom next to it. */
  showAtomNumber: boolean;
  /** Write the index of every bond next to it. */
  showBondNumber: boolean;
  /** Write the reaction mapping number of every mapped atom. */
  showMapping: boolean;
  /** Write the CIP descriptor, R or S, next to every stereocentre. */
  showCIPParity: boolean;
  /**
   * A caption drawn inside the picture, under the structure.
   * @default undefined
   */
  label?: string;
  /**
   * Text written on atoms, keyed by atom index from 0.
   * @default undefined
   */
  atomLabels?: ReadonlyMap<number, string>;
  /** Where the atom labels are written. */
  atomLabelPlacement: AtomLabelPlacement;
  /**
   * Called with the index of the atom that was clicked.
   * @default undefined
   */
  onAtomClick?: (atom: number) => void;
  /**
   * Called with the index of the bond that was clicked.
   * @default undefined
   */
  onBondClick?: (bond: number) => void;
  /** What is shown in place of a structure openchemlib refuses to read. */
  fallback: ReactNode;
}

/**
 * Read the notation and draw the picture.
 * @param props - See {@link StructureSvgProps}.
 * @returns The svg, or the placeholder when the notation cannot be read.
 */
export function StructureSvg(props: StructureSvgProps): ReactElement {
  const {
    source,
    fallback,
    atomLabels,
    atomLabelPlacement,
    onAtomClick,
    onBondClick,
    showCIPParity,
    ...rest
  } = props;
  const { kind, value, coordinates } = source;
  // A map a caller builds during render is a new object every time; its
  // content is what decides whether the molecule has to be read again.
  const labelsKey =
    atomLabels === undefined ? '' : JSON.stringify([...atomLabels]);

  const drawing = useMemo(
    () => readDrawing(kind, value, coordinates, labelsKey, atomLabelPlacement),
    [kind, value, coordinates, labelsKey, atomLabelPlacement],
  );

  if (drawing === null) {
    return (
      <StructurePlaceholder width={rest.width} height={rest.height}>
        {fallback}
      </StructurePlaceholder>
    );
  }

  return (
    <SvgRenderer
      {...rest}
      molecule={drawing.molecule}
      noCarbonLabelWithCustomLabel={drawing.labelled}
      suppressCIPParity={!showCIPParity}
      onAtomClick={
        onAtomClick === undefined
          ? undefined
          : (atom) => {
              onAtomClick(atom);
            }
      }
      onBondClick={
        onBondClick === undefined
          ? undefined
          : (bond) => {
              onBondClick(bond);
            }
      }
    />
  );
}

/** A molecule ready to draw, and whether any label was written on it. */
interface Drawing {
  molecule: Molecule;
  labelled: boolean;
}

/**
 * Parse the notation and write the labels on the result.
 * @param kind - Which notation `value` is written in.
 * @param value - The notation.
 * @param coordinates - The idCode's encoded coordinates, when it has them.
 * @param labelsKey - The atom labels, as `JSON.stringify` wrote their entries;
 * empty for none.
 * @param placement - Where the labels go.
 * @returns The molecule, or `null` when it cannot be read or holds no atom.
 */
function readDrawing(
  kind: StructureSource['kind'],
  value: string,
  coordinates: string | undefined,
  labelsKey: string,
  placement: AtomLabelPlacement,
): Drawing | null {
  let molecule: Molecule;
  try {
    molecule = parseMolecule(kind, value, coordinates);
  } catch {
    return null;
  }
  if (molecule.getAllAtoms() === 0) return null;
  if (labelsKey === '') return { molecule, labelled: false };

  const labels = new Map(JSON.parse(labelsKey) as Array<[number, string]>);
  const written = applyAtomLabels(molecule, labels, placement);
  return { molecule, labelled: written > 0 };
}

function parseMolecule(
  kind: StructureSource['kind'],
  value: string,
  coordinates: string | undefined,
): Molecule {
  if (kind === 'idcode') return Molecule.fromIDCode(value, coordinates);
  if (kind === 'molfile') return Molecule.fromMolfile(value);
  return Molecule.fromSmiles(value);
}
