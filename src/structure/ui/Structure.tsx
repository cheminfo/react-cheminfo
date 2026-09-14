/**
 * A read-only depiction of a structure, whichever notation the caller has.
 *
 * Which notation is drawn, and what is shown when there is nothing to draw, is
 * decided here; the drawing itself sits behind `React.lazy`, so a page that
 * never renders a structure never downloads react-ocl and openchemlib for one.
 * That is also what lets `react-cheminfo/structure` be imported at all when
 * those optional peers are not installed.
 */

import type { ReactElement, ReactNode } from 'react';
import { Suspense, lazy } from 'react';

import type { AtomLabelPlacement } from '../core/atomLabels.ts';
import { structureSource } from '../core/structureSource.ts';

import { StructurePlaceholder } from './StructurePlaceholder.tsx';

const StructureSvg = lazy(async () => {
  const module = await import('./StructureSvg.tsx');
  return { default: module.StructureSvg };
});

/** What is written on a depiction besides the atoms and the bonds. */
export interface StructureLabels {
  /**
   * Write the index of every atom next to it.
   * @default false
   */
  atoms?: boolean;
  /**
   * Write the index of every bond next to it.
   * @default false
   */
  bonds?: boolean;
  /**
   * Write the reaction mapping number of every mapped atom.
   * @default false
   */
  mapping?: boolean;
  /**
   * Write the CIP descriptor, R or S, next to every stereocentre.
   * @default false
   */
  stereo?: boolean;
  /**
   * A caption drawn inside the picture, under the structure.
   * @default undefined
   */
  caption?: string;
}

/** What {@link Structure} needs. */
export interface StructureProps {
  /**
   * A canonical openchemlib idCode, coordinates included or not. The most
   * exact notation, so it is drawn in preference to the others.
   * @default undefined
   */
  idCode?: string;
  /**
   * Encoded 2D coordinates, when they did not travel with the idCode.
   * @default undefined
   */
  coordinates?: string;
  /**
   * A molfile, V2000 or V3000, drawn when there is no usable idCode.
   * @default undefined
   */
  molfile?: string;
  /**
   * A SMILES, drawn when there is neither an idCode nor a molfile. The layout
   * is invented, so two depictions of the same molecule may differ.
   * @default undefined
   */
  smiles?: string;
  /**
   * Width of the picture, in pixels.
   * @default 200
   */
  width?: number;
  /**
   * Height of the picture, in pixels.
   * @default 140
   */
  height?: number;
  /**
   * What is written on the picture besides the structure itself.
   * @default {}
   */
  labels?: StructureLabels;
  /**
   * Text of the caller's own written on atoms — ring numbers, canonical
   * numbers, an assignment — keyed by atom index as openchemlib counts atoms,
   * from 0. An empty text, or an index the structure has no atom at, writes
   * nothing.
   * @default undefined
   */
  atomLabels?: ReadonlyMap<number, string>;
  /**
   * Where the `atomLabels` go: beside each element symbol, as a small
   * superscript, or in place of it.
   * @default 'beside'
   */
  atomLabelPlacement?: AtomLabelPlacement;
  /**
   * Crop the picture to the atoms rather than centring them in the box.
   * @default true
   */
  autoCrop?: boolean;
  /**
   * Blank space kept around the structure when it is cropped, in pixels.
   * @default 4
   */
  autoCropMargin?: number;
  /**
   * Atoms to paint, which is how a substructure match is shown.
   * @default undefined
   */
  atomHighlight?: number[];
  /**
   * The colour the highlighted atoms are painted.
   * @default '#a5d8ff'
   */
  atomHighlightColor?: string;
  /**
   * Bonds to paint.
   * @default undefined
   */
  bondHighlight?: number[];
  /**
   * The colour the highlighted bonds are painted.
   * @default '#ffd8a8'
   */
  bondHighlightColor?: string;
  /**
   * Called with the index of the atom that was clicked, counted from 0 as
   * openchemlib counts atoms.
   * @default undefined
   */
  onAtomClick?: (atom: number) => void;
  /**
   * Called with the index of the bond that was clicked, counted from 0.
   * @default undefined
   */
  onBondClick?: (bond: number) => void;
  /**
   * What is shown when there is no structure, or when the one supplied cannot
   * be read. An em dash rather than a red box: a missing structure is a row of
   * a table far more often than it is a bug worth shouting about.
   * @default '—'
   */
  fallback?: ReactNode;
}

/**
 * Draw a structure, from whichever notation the caller has.
 *
 * Nothing here throws and nothing renders a broken box: a blank value, a
 * molfile with an empty atom block and a SMILES with a typo in it all come out
 * as the same quiet placeholder, sized like the picture that would have been
 * drawn so a list of structures keeps its rhythm. The box the renderers load
 * into is that same placeholder, so nothing moves once they arrive.
 * @param props - The structure, its size and what is written on it.
 * @returns The picture, or the placeholder.
 */
export function Structure(props: StructureProps): ReactElement {
  const {
    idCode,
    coordinates,
    molfile,
    smiles,
    width = 200,
    height = 140,
    labels = {},
    atomLabels,
    atomLabelPlacement = 'beside',
    autoCrop = true,
    autoCropMargin = 4,
    atomHighlight,
    atomHighlightColor = '#a5d8ff',
    bondHighlight,
    bondHighlightColor = '#ffd8a8',
    onAtomClick,
    onBondClick,
    fallback = '—',
  } = props;

  const source = structureSource({ idCode, coordinates, molfile, smiles });

  if (source.kind === 'empty') {
    return (
      <StructurePlaceholder width={width} height={height}>
        {fallback}
      </StructurePlaceholder>
    );
  }

  return (
    <Suspense fallback={<StructurePlaceholder width={width} height={height} />}>
      <StructureSvg
        source={source}
        width={width}
        height={height}
        autoCrop={autoCrop}
        autoCropMargin={autoCropMargin}
        atomHighlight={atomHighlight}
        atomHighlightColor={atomHighlightColor}
        bondHighlight={bondHighlight}
        bondHighlightColor={bondHighlightColor}
        showAtomNumber={labels.atoms ?? false}
        showBondNumber={labels.bonds ?? false}
        showMapping={labels.mapping ?? false}
        showCIPParity={labels.stereo ?? false}
        label={labels.caption}
        atomLabels={atomLabels}
        atomLabelPlacement={atomLabelPlacement}
        onAtomClick={onAtomClick}
        onBondClick={onBondClick}
        fallback={fallback}
      />
    </Suspense>
  );
}
