import type { ReactElement, ReactNode } from 'react';

import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import { PARALLEL_MARGIN } from '../core/parallelAxes.ts';
import type { ParallelAxis } from '../core/parallelTypes.ts';

import { PARALLEL_LABELS_STYLE, parallelLabelStyle } from './parallelStyles.ts';

/** What {@link ParallelLabels} writes. */
export interface ParallelLabelsProps {
  /** The axes as the caller described them, for a caller's own renderer. */
  axes: readonly ParallelAxis[];
  /** The same axes, placed, so each name sits over its own axis. */
  layouts: readonly ParallelAxisLayout[];
  /**
   * How a name is written. Left out, it is the label and the unit after it.
   * @default undefined
   */
  render?: ((axis: ParallelAxis, index: number) => ReactNode) | undefined;
}

/**
 * The axis names, as HTML over the figure.
 *
 * HTML rather than SVG text so that a name can carry a tooltip explaining what
 * the axis measures. The layer lets every pointer event through and only the
 * names themselves take it back, so a brush started under a name still starts.
 * @param props - See {@link ParallelLabelsProps}.
 * @returns The names.
 */
export function ParallelLabels(props: ParallelLabelsProps): ReactElement {
  const { axes, layouts, render } = props;

  return (
    <div className="parallel-coordinates-labels" style={PARALLEL_LABELS_STYLE}>
      {layouts.map((layout, index) => {
        const axis = axes[index];
        return (
          <div
            key={layout.id}
            className="parallel-axis-label"
            style={parallelLabelStyle(PARALLEL_MARGIN.left + layout.x)}
          >
            {axis !== undefined && render !== undefined
              ? render(axis, index)
              : defaultLabel(layout)}
          </div>
        );
      })}
    </div>
  );
}

function defaultLabel(layout: ParallelAxisLayout): string {
  return layout.unit === '' ? layout.label : `${layout.label} (${layout.unit})`;
}
