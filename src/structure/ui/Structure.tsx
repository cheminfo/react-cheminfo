/**
 * A read-only depiction of a structure, whichever notation the caller has.
 *
 * Which notation is drawn, and what is shown when there is nothing to draw, is
 * decided here; the drawing itself sits behind `React.lazy`, so a page that
 * never renders a structure never downloads react-ocl and openchemlib for one.
 * That is also what lets `react-cheminfo/structure` be imported at all when
 * those optional peers are not installed.
 */

import type { ReactElement } from 'react';
import { Suspense, lazy } from 'react';

import { structureSource } from '../core/structureSource.ts';

import { StructurePlaceholder } from './StructurePlaceholder.tsx';
import type { StructureProps } from './structureProps.ts';

const StructureSvg = lazy(async () => {
  const module = await import('./StructureSvg.tsx');
  return { default: module.StructureSvg };
});

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
    substructure,
    substructureColor = '#ffd500',
    substructureOpacity = 0.15,
    onAtomClick,
    onAtomHover,
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
        substructure={substructure}
        substructureColor={substructureColor}
        substructureOpacity={substructureOpacity}
        showAtomNumber={labels.atoms ?? false}
        showBondNumber={labels.bonds ?? false}
        showMapping={labels.mapping ?? false}
        showCIPParity={labels.stereo ?? false}
        label={labels.caption}
        atomLabels={atomLabels}
        atomLabelPlacement={atomLabelPlacement}
        onAtomClick={onAtomClick}
        onAtomHover={onAtomHover}
        onBondClick={onBondClick}
        fallback={fallback}
      />
    </Suspense>
  );
}
