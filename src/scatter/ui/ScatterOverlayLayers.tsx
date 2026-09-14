import type { ReactElement } from 'react';

import { ScatterLabelLayer } from './ScatterLabelLayer.tsx';
import { LASSO_STYLE } from './scatterPlotModel.ts';
import type { ScatterLabels } from './useScatterLabels.ts';

/** What {@link ScatterOverlayLayers} draws. */
interface ScatterOverlayLayersProps {
  /** The seated words, from `useScatterLabels`. */
  labels: ScatterLabels;
  /** Radius of a dot, which a line back to a moved word starts clear of. */
  radius: number;
  /** The lasso being drawn, as an SVG `d`; `''` between drags. */
  lassoPath: string;
}

/**
 * What a scatter figure draws over its dots and under the surface that takes
 * the pointer: the names of the points, the names of the groups, and the lasso
 * while it is being dragged — in that order, so a group's name is never hidden
 * under a sample's and the lasso is never hidden under either.
 * @param props - See {@link ScatterOverlayLayersProps}.
 * @returns The layers.
 */
export function ScatterOverlayLayers(
  props: ScatterOverlayLayersProps,
): ReactElement {
  const { labels, radius, lassoPath } = props;
  return (
    <>
      {labels.named === undefined ? null : (
        <ScatterLabelLayer labels={labels.named} radius={radius} />
      )}
      {labels.crowds === undefined ? null : (
        <ScatterLabelLayer labels={labels.crowds} radius={radius} strong />
      )}
      {lassoPath === '' ? null : <path d={lassoPath} {...LASSO_STYLE} />}
    </>
  );
}
