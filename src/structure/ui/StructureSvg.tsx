/**
 * The react-ocl depiction of a structure whose notation has already been
 * picked.
 *
 * `Structure` holds it behind `React.lazy`, and the barrel deliberately does
 * not export it: this is the file that value-imports react-ocl, so
 * anything able to reach it statically drags openchemlib into every bundle,
 * including the ones that only ever wanted the Tools menu.
 */

import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import type { ErrorComponentProps } from 'react-ocl';
import {
  IdcodeSvgRenderer,
  MolfileSvgRenderer,
  SmilesSvgRenderer,
} from 'react-ocl';

import type { StructureSource } from '../core/structureSource.ts';

import { StructurePlaceholder } from './StructurePlaceholder.tsx';

/** Props of {@link StructureSvg}. */
export interface StructureSvgProps {
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
  /**
   * A caption drawn inside the picture, under the structure.
   * @default undefined
   */
  label?: string;
  /** What is shown in place of a structure react-ocl refuses to read. */
  fallback: ReactNode;
}

/**
 * Draw the picture with the renderer the notation calls for.
 * @param props - See {@link StructureSvgProps}.
 * @returns The svg, or the placeholder when the notation cannot be read.
 */
export function StructureSvg(props: StructureSvgProps): ReactElement {
  const { source, fallback, ...rest } = props;

  const ErrorComponent = useMemo(
    () => createFallbackRenderer(fallback),
    [fallback],
  );
  const shared = { ...rest, ErrorComponent };

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
