import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
  LABEL_QUIET,
  PEAK_LABEL,
} from '../../chart/core/chartTheme.ts';
import type { HoveredPeak } from '../core/labelStackBox.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import type { PeakLabelLineKind } from '../core/peakLabelLines.ts';
import { planPeakLabels } from '../core/peakLabelPlan.ts';

export interface PeakLabelsProps {
  /**
   * The spectrum whose peaks are labelled. Hand it the same one that was drawn:
   * a mirrored half is drawn normalised, and labels computed from the spectrum
   * as measured would float above sticks of another height.
   */
  spectrum: MassSpectrum;
  /** Where the plot sits, which is what a stack may not be pushed out of. */
  plot: PlotRect;
  /** The m/z axis as it is currently zoomed. */
  xScale: ChartScale;
  /**
   * The intensity axis as it is currently zoomed. Reflect it and the labels
   * follow the sticks downwards — together with `below`, which turns the stacks
   * over.
   */
  yScale: ChartScale;
  /**
   * How many peaks are labelled at most, the most intense first.
   * @default DEFAULT_LABEL_LIMIT
   */
  limit?: number;
  /**
   * Whether a peak whose charge was established says so.
   * @default false
   */
  showCharges?: boolean;
  /**
   * How many decimals the masses on screen are written with.
   * @default 4
   */
  mzDecimals?: number;
  /**
   * What explains each peak, keyed as `peakKey` keys it — the name a host
   * writes on top of a stack.
   * @default undefined
   */
  annotationLabels?: ReadonlyMap<string, string>;
  /**
   * Whether the stacks hang under the sticks rather than standing over them,
   * which is what the lower half of a mirrored pair wants.
   * @default false
   */
  below?: boolean;
  /**
   * The ink the stacks are written in — worth passing the spectrum's own colour
   * on a chart holding several, where an unattributed m/z belongs to any of them.
   * @default the theme's label colour
   */
  color?: string;
  /**
   * What one unit of the measured intensity is written as.
   * @default 1
   */
  intensityScale?: number;
  /**
   * Called with the peak whose stack the pointer is resting on, `null` when it
   * leaves. Without it the stacks answer no pointer at all.
   * @default undefined
   */
  onHover?: (peak: HoveredPeak | null) => void;
}

/**
 * The tops of the best peaks of one spectrum, and what each of them reads.
 *
 * Two things drawn together because they are one claim: a short mark on the tip
 * of the picked peak, and the numbers written over it. The mark is the half that
 * matters when the continuous trace is the one on screen — the centroid is then
 * not drawn at all, and a stack of numbers floating over a peak shape says which
 * region was picked but never which point of it, which is the number the stack
 * is quoting. With the mark on the tip the two agree by construction.
 *
 * Which peaks are labelled is `planPeakLabels`'s to decide, and it follows the
 * zoom: a survey of the whole spectrum labels its base peak and a few others,
 * and the same spectrum zoomed onto one cluster labels every line in it. Every
 * line is haloed and none of them is boxed: a number over a peak is written
 * over whatever the plot has there, and the halo clears a hairline of chart from
 * around each glyph, where a filled box would hide the very data it is about.
 *
 * The numbers take no pointer event; the room they occupy does, as one
 * transparent rectangle per stack, and only when somebody asked for it — so a
 * stack can be interrogated without becoming a control, while the crosshair
 * underneath goes on following the pointer.
 * @param props - Component props.
 * @returns The marks and the labels, as SVG.
 */
export function PeakLabels(props: PeakLabelsProps): ReactElement {
  const {
    spectrum,
    plot,
    xScale,
    yScale,
    limit,
    showCharges = false,
    mzDecimals,
    annotationLabels,
    below = false,
    color = CHART_COLORS.labelText,
    intensityScale = 1,
    onHover,
  } = props;

  const plans = useMemo(
    () =>
      planPeakLabels({
        spectrum,
        plot,
        xScale,
        yScale,
        showCharges,
        below,
        intensityScale,
        ...(limit === undefined ? {} : { limit }),
        ...(mzDecimals === undefined ? {} : { mzDecimals }),
        ...(annotationLabels === undefined ? {} : { annotationLabels }),
      }),
    [
      spectrum,
      plot,
      xScale,
      yScale,
      limit,
      showCharges,
      mzDecimals,
      annotationLabels,
      below,
      intensityScale,
    ],
  );

  // Every picked peak is marked; only the ones that kept their room are
  // written, since a stack over a peak whose neighbour took the room would be
  // written across that neighbour's.
  const written = useMemo(
    () => plans.filter((plan) => Number.isFinite(plan.labelX)),
    [plans],
  );

  const stackStyle = useMemo(
    () => ({ fill: color, fontSize: CHART_FONT.label, ...LABEL_HALO }),
    [color],
  );
  const markStyle = useMemo(() => ({ stroke: color }), [color]);

  return (
    <g>
      {/* Its own group, because the stroke that draws a mark would outline every
          glyph of a label sharing the group with it. */}
      <g pointerEvents="none" style={markStyle}>
        {plans.map((plan) => (
          <line
            key={plan.key}
            x1={plan.tipX}
            y1={plan.tipY}
            x2={plan.tipX}
            y2={
              below
                ? plan.tipY - PEAK_LABEL.topMark
                : plan.tipY + PEAK_LABEL.topMark
            }
          />
        ))}
      </g>
      <g pointerEvents="none" style={stackStyle}>
        {written.map((plan) => (
          <text key={plan.key} textAnchor="middle">
            {plan.lines.map((line, index) => (
              <tspan
                key={line.kind}
                x={plan.labelX}
                y={plan.baselines[index]}
                style={LINE_STYLES[line.kind]}
              >
                {line.text}
              </tspan>
            ))}
          </text>
        ))}
      </g>
      {onHover === undefined
        ? null
        : written.map((plan) => (
            <rect
              key={plan.key}
              x={plan.box.x}
              y={plan.box.y}
              width={plan.box.width}
              height={plan.box.height}
              fill="transparent"
              onPointerEnter={() =>
                onHover({
                  key: plan.key,
                  mz: plan.peak.x,
                  intensity: plan.peak.y,
                  charge: plan.peak.charge,
                  x: plan.labelX,
                  // A card hangs off the edge of the stack facing away from the
                  // stick, so it never covers the peak it is about.
                  y: below ? plan.box.y + plan.box.height : plan.box.y,
                })
              }
              onPointerLeave={() => onHover(null)}
            />
          ))}
    </g>
  );
}

/**
 * How each line of a stack is set.
 *
 * Four numbers in one ink and one weight are four things said at once, and the
 * eye has to read all of them to find the one it came for. So the stack is
 * graded instead: the name of what the peak is carries the weight, because it is
 * the only line that is an answer rather than a measurement; the m/z is written
 * plain, which is what a chemist is nearly always reading; and the charge and
 * the intensity are let back towards the paper.
 */
const LINE_STYLES: Record<PeakLabelLineKind, CSSProperties> = {
  annotation: { fontWeight: 600 },
  charge: { fillOpacity: LABEL_QUIET },
  mz: {},
  intensity: { fillOpacity: LABEL_QUIET },
};
