import type { ReactElement } from 'react';

import { chartBand, chartBandCenter } from '../../chart/core/chartBand.ts';
import type { ChartPlotArea } from '../../chart/ui/chartFrameTypes.ts';
import type { ExplainedShares } from '../core/explainedShares.ts';

import {
  AXIS_CAPTION_STYLE,
  AXIS_LAYER_STYLE,
  AXIS_NAME_STYLE,
  SHARES_CAPTION_OFFSET,
  SHARES_NAME_OFFSET,
} from './projectionTabStyles.ts';

/** What {@link SharesAxis} writes. */
interface SharesAxisProps {
  /** The bars, for their names. */
  shares: ExplainedShares;
  /**
   * The plot the frame laid out: the slots run across it and the names sit
   * under its foot.
   */
  plot: ChartPlotArea;
  /** What the axis measures, written under the names. */
  caption: string;
}

/**
 * The component names under the bars, and what the axis measures under them.
 *
 * They are written in a layer of their own because a frame clips its children
 * to the plot and these sit below it — the same reason the tracked line chart
 * writes its slot names this way rather than as frame children.
 * @param props - See {@link SharesAxisProps}.
 * @returns The names.
 */
export function SharesAxis(props: SharesAxisProps): ReactElement {
  const { shares, plot, caption } = props;
  const band = chartBand(shares.components.length, plot.left, plot.right);
  const baseline = plot.bottom;

  return (
    <svg width="100%" height="100%" style={AXIS_LAYER_STYLE}>
      {shares.components.map((component, index) => (
        <text
          key={component.number}
          x={chartBandCenter(band, index)}
          y={baseline + SHARES_NAME_OFFSET}
          textAnchor="middle"
          style={AXIS_NAME_STYLE}
        >
          {component.label}
        </text>
      ))}
      <text
        x={(plot.left + plot.right) / 2}
        y={baseline + SHARES_CAPTION_OFFSET}
        textAnchor="middle"
        style={AXIS_CAPTION_STYLE}
      >
        {caption}
      </text>
    </svg>
  );
}
