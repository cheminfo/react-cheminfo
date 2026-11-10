import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import { areaPath } from '../../chart/core/tracePath.ts';
import type { ComponentPeak } from '../core/componentShape.ts';
import { componentTrace, envelopeTrace } from '../core/componentTrace.ts';
import { axisEnergy } from '../core/energyAxis.ts';
import { normalisationFactor, normalisedScale } from '../core/normalise.ts';
import { tracePath } from '../core/tracePath.ts';
import { COMPONENT_STYLE, XPS_CHART_COLORS } from '../core/xpsChartTheme.ts';
import type { XpsHighlight } from '../core/xpsHighlight.ts';
import { highlightsComponent } from '../core/xpsHighlight.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';

export interface FittedComponentsProps {
  /** The spectrum whose fit is drawn. */
  spectrum: XpsSpectrum;
  /** The axis the chart is drawn against. */
  axis: EnergyAxis;
  /** Where the plot sits, whose width the shapes are sampled across. */
  plot: PlotRect;
  /** The energy axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The counts axis as it is currently zoomed. */
  yScale: ChartScale;
  /**
   * Whether the trace is drawn against its own maximum in the window, which the
   * fit has to follow or it would float above a trace of another height.
   * @default false
   */
  normalise?: boolean;
  /**
   * What the pointer is resting on, so the component under it is filled solidly.
   * @default undefined
   */
  highlight?: XpsHighlight;
}

/**
 * The peaks a fit was made of, and the envelope they add up to.
 *
 * Each component is filled translucently in the spectrum's own colour rather
 * than outlined, because what a reader is asking of a fit is *how much of this
 * peak is that species* — a question about area, which a fill answers and a line
 * does not. The envelope over them is dashed, so it is never read as the
 * measurement: where the two part company is where the fit is wrong, and that is
 * the one thing the layer exists to show.
 *
 * The components' positions come from the file in binding energy and are placed
 * on whichever axis is being drawn, exactly as a peak or a region is. The
 * `component.bindingEnergy` is used as it stands: a CASA block states its
 * positions in kinetic energy, and `xps-analysis` has already converted them.
 *
 * Nothing here takes a pointer event except the fills, which do — a component is
 * a claim about chemistry and hovering it has to light the row of the table that
 * quantifies it.
 * @param props - Component props.
 * @returns The fit, as SVG.
 */
export function FittedComponents(
  props: FittedComponentsProps,
): ReactElement | null {
  const {
    spectrum,
    axis,
    plot,
    xScale,
    yScale,
    normalise = false,
    highlight,
  } = props;

  const from = chartValue(xScale, plot.left);
  const to = chartValue(xScale, plot.right);
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const samples = Math.max(2, Math.round(plot.width));

  const peaks = useMemo(() => componentPeaks(spectrum, axis), [spectrum, axis]);

  const drawnScale = useMemo(() => {
    if (!normalise) return yScale;
    const trace = spectrum.energy;
    return normalisedScale(
      yScale,
      normalisationFactor(trace.x, trace.y, low, high),
    );
  }, [normalise, yScale, spectrum.energy, low, high]);

  const shapes = useMemo(() => {
    const drawn: Array<{ id: string; path: string }> = [];
    for (let index = 0; index < peaks.length; index++) {
      const peak = peaks[index] as ComponentPeak;
      const trace = componentTrace(peak, low, high, samples);
      const path = areaPath(trace.x, trace.y, xScale, drawnScale);
      if (path === '') continue;
      drawn.push({ id: spectrum.components[index]?.id ?? String(index), path });
    }
    return drawn;
  }, [peaks, low, high, samples, xScale, drawnScale, spectrum.components]);

  const envelope = useMemo(() => {
    if (peaks.length === 0) return '';
    const trace = envelopeTrace(peaks, low, high, samples);
    return tracePath(trace.x, trace.y, xScale, drawnScale);
  }, [peaks, low, high, samples, xScale, drawnScale]);

  if (shapes.length === 0) return null;

  return (
    <g>
      {shapes.map((shape) => (
        <path
          key={shape.id}
          d={shape.path}
          fillOpacity={
            highlight !== undefined &&
            highlightsComponent(highlight, spectrum.id, shape.id)
              ? COMPONENT_STYLE.highlightOpacity
              : COMPONENT_STYLE.fillOpacity
          }
          strokeWidth={COMPONENT_STYLE.strokeWidth}
          style={{ fill: spectrum.color, stroke: spectrum.color }}
        />
      ))}
      {envelope === '' ? null : (
        <path
          d={envelope}
          fill="none"
          strokeWidth={COMPONENT_STYLE.envelopeWidth}
          strokeDasharray={COMPONENT_STYLE.envelopeDash}
          pointerEvents="none"
          style={envelopeStyle}
        />
      )}
    </g>
  );
}

/**
 * The fitted peaks of a spectrum, placed on the axis being drawn.
 * @param spectrum - The spectrum whose fit is drawn.
 * @param axis - The axis the chart is drawn against.
 * @returns One peak per component, in the order the file states them.
 */
function componentPeaks(
  spectrum: XpsSpectrum,
  axis: EnergyAxis,
): ComponentPeak[] {
  const peaks: ComponentPeak[] = [];
  for (const component of spectrum.components) {
    peaks.push({
      centre: axisEnergy(component.bindingEnergy, spectrum.sourceEnergy, axis),
      fwhm: component.fwhm,
      area: component.area,
      shape: component.shape,
    });
  }
  return peaks;
}

const envelopeStyle = { stroke: XPS_CHART_COLORS.envelope } as const;
