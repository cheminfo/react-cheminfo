import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
} from '../../chart/core/chartTheme.ts';
import type { AssignedBand } from '../core/assignBands.ts';
import { BAND_MARK, planBandLabels } from '../core/bandLabelPlan.ts';
import type { IrBand } from '../core/irBand.ts';
import { sameIrBand } from '../core/irBand.ts';
import { bandsPointDown } from '../core/irMode.ts';
import type { IrMode } from '../core/irSpectrum.ts';

export interface BandMarksProps {
  /** The bands to mark, with whatever the table said about them. */
  assigned: readonly AssignedBand[];
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The wavenumber axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The value axis as it is currently zoomed. */
  yScale: ChartScale;
  /** Which value axis is being drawn. */
  mode: IrMode;
  /**
   * Whether each label names the assignment as well as the wavenumber.
   * @default false
   */
  showAssignments?: boolean;
  /**
   * At most how many bands are named. Marks are drawn on all of them.
   * @default 12
   */
  limit?: number;
  /**
   * The band the pointer has come to rest on, drawn larger, `null` for none.
   * @default null
   */
  highlight?: IrBand | null;
}

/**
 * A mark on every band, and a label on the ones there is room for.
 *
 * The mark reaches *away* from the label, into the band, because the clear space
 * on the label's side is where the numbers are written and the mark is there to
 * say which band they are about. So in transmittance both hang downwards from a
 * dip and in absorbance both rise from a maximum, and the pair reads the same way
 * up in either.
 *
 * A leader line is drawn only when a label had to be slid off its band to clear
 * its neighbours — a leader from a label that is already directly above its band
 * is a line saying what the position already said. A label slid too far is not
 * drawn at all; the mark still says the band is there, which is the honest
 * outcome, where a label hanging over a band it says nothing about is not.
 * @param props - Component props.
 * @returns The marks and labels, as SVG.
 */
export function BandMarks(props: BandMarksProps): ReactElement {
  const {
    assigned,
    plot,
    xScale,
    yScale,
    mode,
    showAssignments = false,
    limit = 12,
    highlight = null,
  } = props;

  const plans = useMemo(
    () =>
      planBandLabels({
        assigned,
        plot,
        xScale,
        yScale,
        mode,
        showAssignments,
        limit,
      }),
    [assigned, plot, xScale, yScale, mode, showAssignments, limit],
  );

  const down = bandsPointDown(mode);
  const reach = down ? BAND_MARK : -BAND_MARK;

  return (
    <g pointerEvents="none">
      {plans.map((plan) => {
        const highlighted = sameIrBand(plan.band, highlight);
        const dropped = !Number.isFinite(plan.labelX);
        const firstBaseline = plan.baselines[0];
        const slid = !dropped && Math.abs(plan.labelX - plan.tipX) > LEADER_AT;
        return (
          <g key={`${plan.band.spectrumId} ${plan.band.wavenumber}`}>
            <line
              x1={plan.tipX}
              y1={plan.tipY}
              x2={plan.tipX}
              y2={plan.tipY + reach}
              style={highlighted ? highlightMarkStyle : markStyle}
              strokeWidth={highlighted ? 2 : 1}
            />
            {slid && firstBaseline !== undefined ? (
              <line
                x1={plan.tipX}
                y1={plan.tipY + reach}
                x2={plan.labelX}
                y2={firstBaseline}
                style={leaderStyle}
              />
            ) : null}
            {dropped
              ? null
              : plan.lines.map((line, index) => (
                  <text
                    key={line}
                    x={plan.labelX}
                    y={plan.baselines[index]}
                    textAnchor="middle"
                    style={highlighted ? highlightTextStyle : textStyle}
                  >
                    {line}
                  </text>
                ))}
          </g>
        );
      })}
    </g>
  );
}

/**
 * How far a label may sit from its band before a leader is drawn to it.
 *
 * Two pixels: below that the label is over its band and a leader would be a
 * line nobody needs, and the declutter sweep leaves most labels within a pixel
 * of where they wanted to be.
 */
const LEADER_AT = 2;

const markStyle = { stroke: CHART_COLORS.annotation } as const;

const highlightMarkStyle = { stroke: CHART_COLORS.highlight } as const;

const leaderStyle = { stroke: CHART_COLORS.leader } as const;

// Haloed: an infrared label is written over the trace as often as beside it,
// since a band is named where it dips and the neighbouring bands dip too.
const textStyle = {
  fill: CHART_COLORS.labelText,
  fontSize: CHART_FONT.label,
  ...LABEL_HALO,
} as const;

const highlightTextStyle = {
  fill: CHART_COLORS.highlight,
  fontSize: CHART_FONT.label,
  fontWeight: 600,
  ...LABEL_HALO,
} as const;
