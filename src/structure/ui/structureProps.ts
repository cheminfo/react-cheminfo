/**
 * The props of `Structure`, in a module of their own so the component file
 * holds the component.
 */

import type { ReactNode } from 'react';

import type { AtomLabelPlacement } from '../core/atomLabels.ts';

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

/** What `Structure` needs. */
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
   * A query fragment, as an openchemlib idCode, whose every match is painted —
   * atoms and bonds alike, so the hit reads as one shape. When set, it takes
   * the place of `atomHighlight` and `bondHighlight`.
   * @default undefined
   */
  substructure?: string;
  /**
   * The colour the `substructure` match is painted.
   * @default '#ffd500'
   */
  substructureColor?: string;
  /**
   * How opaque the `substructure` match is painted, from 0 to 1. Light, so the
   * bonds and the atom labels under it stay legible.
   * @default 0.15
   */
  substructureOpacity?: number;
  /**
   * Called with the index of the atom that was clicked, counted from 0 as
   * openchemlib counts atoms.
   * @default undefined
   */
  onAtomClick?: (atom: number) => void;
  /**
   * Called with the index of the atom the pointer comes to rest on, counted
   * from 0, and with `null` once it leaves that atom — so a table read beside
   * the drawing can light the row of that atom.
   * @default undefined
   */
  onAtomHover?: (atom: number | null) => void;
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
