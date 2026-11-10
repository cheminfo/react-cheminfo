import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { regionBands } from '../core/regionBands.ts';
import { XPS_CHART_COLORS, XPS_CHART_FONT } from '../core/xpsChartTheme.ts';
import type { XpsRegion } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';

export interface RegionBandsProps {
  /** The regions the file defines, in the order it defines them. */
  regions: readonly XpsRegion[];
  /** The photon energy of the spectrum they belong to, `null` when unstated. */
  sourceEnergy: number | null;
  /** The axis the chart is drawn against. */
  axis: EnergyAxis;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The energy axis as it is currently zoomed. */
  xScale: ChartScale;
}

/**
 * The stretches of the spectrum a background was drawn under, shaded.
 *
 * These are the bounds every area — and therefore every atomic percentage — on
 * the chart was computed inside, so shading them shows the assumption behind
 * each of those numbers. They are drawn under everything else in the data band,
 * because a wash over a trace would be a wash over the measurement, and the name
 * is written along the top edge where a peak is least likely to be.
 *
 * Nothing here takes a pointer event: a region is context, and it covers the
 * exact stretch a reader wants to put the pointer into to interrogate the peak
 * inside it.
 * @param props - Component props.
 * @returns The bands, as SVG.
 */
export function RegionBands(props: RegionBandsProps): ReactElement | null {
  const { regions, sourceEnergy, axis, plot, xScale } = props;

  const bands = useMemo(
    () => regionBands(regions, sourceEnergy, axis, xScale, plot),
    [regions, sourceEnergy, axis, xScale, plot],
  );
  if (bands.length === 0) return null;

  return (
    <g pointerEvents="none">
      {bands.map((band) => (
        <rect
          key={band.id}
          x={band.rectangle.x}
          y={band.rectangle.y}
          width={band.rectangle.width}
          height={band.rectangle.height}
          style={bandStyle}
        />
      ))}
      {bands.map((band) => (
        <text
          key={band.id}
          x={band.rectangle.x + band.rectangle.width / 2}
          y={plot.top + LABEL_INSET}
          textAnchor="middle"
          dominantBaseline="hanging"
          style={labelStyle}
        >
          {band.label}
        </text>
      ))}
    </g>
  );
}

/** How far below the top of the plot a region writes its name. */
const LABEL_INSET = 3;

const bandStyle = {
  fill: XPS_CHART_COLORS.region,
  stroke: XPS_CHART_COLORS.regionBorder,
} as const;

const labelStyle = {
  fill: XPS_CHART_COLORS.regionLabel,
  fontSize: XPS_CHART_FONT.region,
} as const;
