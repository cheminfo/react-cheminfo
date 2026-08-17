import type {
  CSSProperties,
  ComponentType,
  ReactElement,
  ReactNode,
} from 'react';
import { useMemo } from 'react';
import type { ErrorComponentProps } from 'react-ocl';
import {
  IdcodeSvgRenderer,
  MolfileSvgRenderer,
  SmilesSvgRenderer,
} from 'react-ocl';

import { structureSource } from '../core/structureSource.ts';

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
   * A caption drawn inside the picture, under the structure.
   * @default undefined
   */
  caption?: string;
}

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
 * drawn so a list of structures keeps its rhythm.
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
    autoCrop = true,
    autoCropMargin = 4,
    atomHighlight,
    atomHighlightColor = '#a5d8ff',
    bondHighlight,
    bondHighlightColor = '#ffd8a8',
    fallback = '—',
  } = props;

  const source = structureSource({ idCode, coordinates, molfile, smiles });
  const ErrorComponent = useMemo(
    () => createFallbackRenderer(fallback),
    [fallback],
  );

  if (source.kind === 'empty') {
    return (
      <StructurePlaceholder width={width} height={height}>
        {fallback}
      </StructurePlaceholder>
    );
  }

  const shared = {
    width,
    height,
    autoCrop,
    autoCropMargin,
    atomHighlight,
    atomHighlightColor,
    bondHighlight,
    bondHighlightColor,
    showAtomNumber: labels.atoms ?? false,
    showBondNumber: labels.bonds ?? false,
    showMapping: labels.mapping ?? false,
    label: labels.caption,
    ErrorComponent,
  };

  if (source.kind === 'idcode') {
    return (
      <IdcodeSvgRenderer
        idcode={source.value}
        coordinates={source.coordinates}
        {...shared}
      />
    );
  }
  if (source.kind === 'molfile') {
    return <MolfileSvgRenderer molfile={source.value} {...shared} />;
  }
  return <SmilesSvgRenderer smiles={source.value} {...shared} />;
}

interface StructurePlaceholderProps {
  width: number;
  height: number;
  children: ReactNode;
}

/**
 * A box the size of the picture that could not be drawn, holding whatever the
 * caller wants said instead.
 * @param props - The size of the box and what goes in it.
 * @returns The placeholder.
 */
function StructurePlaceholder(props: StructurePlaceholderProps): ReactElement {
  const { width, height, children } = props;
  return (
    <span style={{ ...PLACEHOLDER_STYLE, width, height }} aria-hidden="true">
      {children}
    </span>
  );
}

/**
 * Build the renderer react-ocl falls back to, so a structure it refuses looks
 * like one that was never supplied rather than like an error.
 * @param fallback - What the caller wants shown instead of the structure.
 * @returns The component react-ocl renders in place of the picture.
 */
function createFallbackRenderer(
  fallback: ReactNode,
): ComponentType<ErrorComponentProps> {
  return function StructureFallback(props: ErrorComponentProps): ReactElement {
    return (
      <StructurePlaceholder width={props.width} height={props.height}>
        {fallback}
      </StructurePlaceholder>
    );
  };
}

const PLACEHOLDER_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8a96a3',
  fontSize: '0.75rem',
};
