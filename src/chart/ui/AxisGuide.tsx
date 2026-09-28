import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { CHART_COLORS, CHART_FONT, LABEL_HALO } from '../core/chartTheme.ts';
import type { GuidePlacement } from '../core/guidePlacement.ts';
import { guidePlacement } from '../core/guidePlacement.ts';

/** What the rule is drawn at, and what it says about itself. */
export interface AxisGuideProps {
  /**
   * The place on the horizontal axis being pointed at, in whatever that axis
   * measures, and `null` when nothing is being looked at.
   */
  value: number | null;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The horizontal axis as it is currently zoomed. */
  xScale: ChartScale;
  /**
   * What the guide is drawn in.
   * @default the theme's highlight colour
   */
  color?: string;
  /**
   * A few words written beside the rule, for a chart carrying more than one of
   * them — `MS2 456.7`, `scan 314`. Nothing is written when it is absent, which
   * is right for a chart whose single guide answers a hover the reader is
   * already making.
   * @default nothing is written
   */
  label?: string;
}

/**
 * The vertical rule marking the place on the horizontal axis being looked at.
 *
 * A peak hovered in a table, a fragment hovered on a structure beside the chart,
 * a search result rested on, the retention time whose scan is drawn in the pane
 * below: each of them asks the chart the same question, and this is its whole
 * answer. It sits below the viewers rather than inside one of them because a
 * mass viewer's precursor rule and a chromatogram's time cursor are not two
 * pictures that resemble each other — they are one picture, drawn from a value
 * and a scale, and neither half of it can tell what it is measuring.
 *
 * When the value is inside the window the rule stands on it, solid. When it is
 * not, the rule is parked on the edge the value went out of, dashed, and
 * carries an arrow pointing that way. That is the case the component exists
 * for: a chart zoomed onto one isotopologue cluster has almost everything a
 * panel can point at outside its window, and answering with nothing drawn
 * leaves a fragment the spectrum does not carry looking exactly like one that
 * is two hundred mass units to the left. Dashed says *not here*, and the arrow
 * says where to go.
 *
 * The arrow is a triangle rather than a `◀` glyph, because whether that
 * character has one is the host's font's business and a missing one draws a
 * hollow box in the middle of the chart. It sits just under the top edge, the
 * strip of the plot a trace is least often in.
 *
 * Nothing here takes a pointer event: the guide is an answer, never a target.
 * @param props - Component props.
 * @returns The guide, or nothing when there is no value to point at and when
 * the scale maps it nowhere.
 */
export function AxisGuide(props: AxisGuideProps): ReactElement | null {
  const { value, plot, xScale, color = CHART_COLORS.highlight, label } = props;

  const placement = value === null ? null : guidePlacement(value, plot, xScale);
  const lineStyle = useMemo(() => ({ stroke: color }), [color]);
  const arrowStyle = useMemo(() => ({ fill: color }), [color]);
  const labelStyle = useMemo(
    () => ({ fill: color, fontSize: CHART_FONT.label, ...LABEL_HALO }),
    [color],
  );

  if (placement === null) return null;
  const { x, direction } = placement;
  const labelPlace = labelPlacement(placement, plot);

  return (
    <g pointerEvents="none">
      <line
        x1={x}
        y1={plot.top}
        x2={x}
        y2={plot.bottom}
        strokeWidth={GUIDE_WIDTH}
        strokeDasharray={direction === null ? undefined : PARKED_DASH}
        style={lineStyle}
      />
      {direction === null ? null : (
        <path d={arrowPath({ x, direction }, plot)} style={arrowStyle} />
      )}
      {label === undefined ? null : (
        <text
          x={labelPlace.x}
          y={plot.top + ARROW_TOP_INSET}
          textAnchor={labelPlace.anchor}
          dominantBaseline="central"
          style={labelStyle}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** How thick the rule is: thin enough to read a peak beside, not through. */
const GUIDE_WIDTH = 1.5;

/** What a parked guide is dashed with. */
const PARKED_DASH = '4 3';

/** How far the arrow reaches back into the plot from its point. */
const ARROW_LENGTH = 7;

/** Half the width of its base. */
const ARROW_HALF_HEIGHT = 5;

/** How far below the top of the plot it sits. */
const ARROW_TOP_INSET = 8;

/** The clear space between the rule, or its arrow, and the label beside it. */
const LABEL_GAP = 4;

/**
 * How much room a label is assumed to want.
 *
 * Measuring the text would mean rendering it first, which is a whole layout
 * pass for a decision that only has to be right at the edges. Sixty pixels is
 * about eight characters at the label size — `MS2 456.7` — and a label longer
 * than that is one written for a panel rather than for a plot.
 */
const LABEL_ROOM = 60;

/**
 * The triangle a parked guide carries, pointing off the edge it is parked on.
 *
 * Only a parked guide has one, and the parameter says so rather than a guard
 * inside: a guide standing on its own value has no edge to point at, and the
 * caller has already told the two apart to decide whether to draw a path at all.
 * @param placement - Where the guide is parked, and which edge its value lies past.
 * @param plot - The plotting area, whose top the arrow hangs under.
 * @returns The `d` of the triangle.
 */
function arrowPath(
  placement: GuidePlacement & { direction: 'left' | 'right' },
  plot: PlotRect,
): string {
  const { x, direction } = placement;
  const back = direction === 'left' ? x + ARROW_LENGTH : x - ARROW_LENGTH;
  const y = plot.top + ARROW_TOP_INSET;
  return `M${x} ${y}L${back} ${y - ARROW_HALF_HEIGHT}L${back} ${y + ARROW_HALF_HEIGHT}Z`;
}

/**
 * Which side of the rule the label is written on.
 *
 * It runs to the right and flips to the left as soon as it would otherwise
 * cross the right edge — flipping rather than sliding, for the reason the
 * pointer readout flips: a label pinned to the edge drifts away from the rule
 * it belongs to and the pair stops reading as one thing. A guide parked on an
 * edge has only one side that is inside the plot at all, so there the flip is
 * forced, and the gap clears the arrow rather than the rule.
 * @param placement - Where the guide ended up, and which way its value lies.
 * @param plot - The plotting area the label has to stay inside.
 * @returns The anchor, and which way the text runs from it.
 */
function labelPlacement(
  placement: GuidePlacement,
  plot: PlotRect,
): { x: number; anchor: 'start' | 'end' } {
  const { x, direction } = placement;
  if (direction === 'left') {
    return { x: x + ARROW_LENGTH + LABEL_GAP, anchor: 'start' };
  }
  if (direction === 'right') {
    return { x: x - ARROW_LENGTH - LABEL_GAP, anchor: 'end' };
  }
  const runsRight = x + LABEL_GAP + LABEL_ROOM <= plot.right;
  return {
    x: runsRight ? x + LABEL_GAP : x - LABEL_GAP,
    anchor: runsRight ? 'start' : 'end',
  };
}
