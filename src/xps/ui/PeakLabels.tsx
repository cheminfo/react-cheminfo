import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel, chartValue } from '../../chart/core/chartScale.ts';
import { CHART_COLORS, CHART_FONT } from '../../chart/core/chartTheme.ts';
import { labelStackBaselines } from '../../chart/core/labelStack.ts';
import { axisEnergy, bindingFromAxis } from '../core/energyAxis.ts';
import { selectLabelledPeaks } from '../core/labelledPeaks.ts';
import { normalisationFactor, normalisedScale } from '../core/normalise.ts';
import { peakLabelLines } from '../core/peakLabelLines.ts';
import { XPS_PEAK_LABEL } from '../core/xpsChartTheme.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';

export interface PeakLabelsProps {
  /** The spectrum whose peaks are named. */
  spectrum: XpsSpectrum;
  /** The axis the chart is drawn against. */
  axis: EnergyAxis;
  /** Where the plot sits, which is what a stack may not be pushed out of. */
  plot: PlotRect;
  /** The energy axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The counts axis as it is currently zoomed. */
  yScale: ChartScale;
  /** How many peaks are named at most, the most intense first. */
  limit: number;
  /**
   * Whether the trace is drawn against its own maximum in the window, which the
   * labels have to follow or they would float above peaks of another height.
   * @default false
   */
  normalise?: boolean;
  /**
   * The ink the stacks are written in — worth passing the spectrum's own colour
   * on a chart holding several, where an unattributed energy belongs to any of
   * them.
   * @default the theme's label colour
   */
  color?: string;
}

/**
 * The energies of the best peaks of one spectrum, written above them.
 *
 * Two things drawn together because they are one claim: a short mark reaching
 * down from the maximum, and the number written over it. The mark is what makes
 * the pair unambiguous on a crowded doublet, where a stack floating between two
 * shoulders says which region was picked but never which point of it.
 *
 * Which peaks are named follows the zoom, and in two ways. Only those inside the
 * window are candidates, so a survey scan names its strongest lines and the same
 * spectrum zoomed onto one transition names every feature in it; and how near
 * two of them may be is converted from the pixels a label occupies, so a pair an
 * eV apart is one label on a survey and two once they are pulled apart.
 *
 * Nothing here takes a pointer event. A label is an answer to a question already
 * asked, and a stack standing over a peak is exactly where a reader is about to
 * put the pointer to interrogate the peak underneath it.
 * @param props - Component props.
 * @returns The marks and the labels, as SVG.
 */
export function PeakLabels(props: PeakLabelsProps): ReactElement | null {
  const {
    spectrum,
    axis,
    plot,
    xScale,
    yScale,
    limit,
    normalise = false,
    color = CHART_COLORS.labelText,
  } = props;

  const from = chartValue(xScale, plot.left);
  const to = chartValue(xScale, plot.right);
  const low = Math.min(from, to);
  const high = Math.max(from, to);

  const drawnScale = useMemo(() => {
    if (!normalise) return yScale;
    const trace = spectrum.energy;
    return normalisedScale(
      yScale,
      normalisationFactor(trace.x, trace.y, low, high),
    );
  }, [normalise, yScale, spectrum.energy, low, high]);

  // A label is chosen in binding energy, which is what a peak records, so the
  // window is converted back rather than the peaks converted forward — one pair
  // of numbers instead of one per peak.
  const bounds = useMemo<[number, number]>(() => {
    const first = bindingFromAxis(low, spectrum.sourceEnergy, axis);
    const second = bindingFromAxis(high, spectrum.sourceEnergy, axis);
    return [Math.min(first, second), Math.max(first, second)];
  }, [low, high, spectrum.sourceEnergy, axis]);

  const spacing = useMemo(() => {
    const perPixel = Math.abs(1 / xScale.factor);
    return Number.isFinite(perPixel) ? perPixel * XPS_PEAK_LABEL.width : 0;
  }, [xScale]);

  const peaks = useMemo(
    () =>
      selectLabelledPeaks(spectrum.peaks, {
        from: bounds[0],
        to: bounds[1],
        limit,
        minimumSpacing: spacing,
        maximumIntensity: chartValue(drawnScale, plot.top),
      }),
    [spectrum.peaks, bounds, limit, spacing, drawnScale, plot.top],
  );

  const plotBounds = useMemo<[number, number]>(
    () => [plot.top, plot.bottom],
    [plot.top, plot.bottom],
  );
  const stackStyle = useMemo(
    () => ({ fill: color, fontSize: CHART_FONT.label }),
    [color],
  );
  const markStyle = useMemo(() => ({ stroke: color }), [color]);

  if (peaks.length === 0) return null;

  const stacks = peaks.map((peak) => {
    const lines = peakLabelLines(peak);
    const tip = chartPixel(drawnScale, peak.intensity);
    return {
      id: peak.id,
      x: chartPixel(
        xScale,
        axisEnergy(peak.bindingEnergy, spectrum.sourceEnergy, axis),
      ),
      tip,
      lines,
      baselines: labelStackBaselines(tip, lines.length, plotBounds),
    };
  });

  return (
    <g pointerEvents="none">
      {/* Its own group, because the stroke that draws a mark would outline every
          glyph of a label sharing the group with it. */}
      <g style={markStyle}>
        {stacks.map((stack) => (
          <line
            key={stack.id}
            x1={stack.x}
            y1={stack.tip}
            x2={stack.x}
            y2={stack.tip + XPS_PEAK_LABEL.topMark}
          />
        ))}
      </g>
      <g style={stackStyle}>
        {stacks.map((stack) => (
          <text key={stack.id} textAnchor="middle">
            {stack.lines.map((line, index) => (
              <tspan key={line.kind} x={stack.x} y={stack.baselines[index]}>
                {line.text}
              </tspan>
            ))}
          </text>
        ))}
      </g>
    </g>
  );
}
