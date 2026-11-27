import type { ReactElement } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';

/** What {@link PlotClip} clips to. */
export interface PlotClipProps {
  /** The id the clip path is referred to by, from `url(#…)`. */
  id: string;
  /** The plot the data layers are kept inside. */
  plot: PlotRect;
}

/**
 * The clip path that keeps a chart's data layers inside its plot.
 * @param props - See {@link PlotClipProps}.
 * @returns The definition, as SVG.
 */
export function PlotClip(props: PlotClipProps): ReactElement {
  const { id, plot } = props;
  return (
    <defs>
      <clipPath id={id}>
        <rect
          x={plot.left}
          y={plot.top}
          width={plot.width}
          height={plot.height}
        />
      </clipPath>
    </defs>
  );
}
