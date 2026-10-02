import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { axisLabeller } from '../core/axisLabels.ts';
import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import { chartAxisScale } from '../core/chartAxisScale.ts';
import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartPixel } from '../core/chartScale.ts';
import { CHART_COLORS, CHART_FONT } from '../core/chartTheme.ts';

export interface AxesProps {
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The window on screen, which the ticks along the bottom are chosen for. */
  xDomain: readonly [number, number];
  /** The window on screen, which the ticks up the side are chosen for. */
  yDomain: readonly [number, number];
  /**
   * The horizontal axis as it is currently zoomed. A scale built onto a
   * reversed pixel range is drawn reversed with no further ceremony, which is
   * what an infrared spectrum running from 4000 down to 400 needs.
   */
  xScale: ChartScale;
  /** The vertical axis as it is currently zoomed. */
  yScale: ChartScale;
  /**
   * Whether the vertical labels are written by magnitude, so the half below
   * the rule reads `100 50 0 50 100` rather than `-100 -50 0 50 100`. What the
   * lower half of a mirrored pair means is a second spectrum drawn downwards,
   * never a negative value, and a minus sign in front of every one of its
   * labels says otherwise.
   * @default false
   */
  absYTicks?: boolean;
  /**
   * Whether the numbers along the bottom are written.
   *
   * Panes stacked over one window would each repeat `2.5 5.0 7.5` and spend a
   * tick row of height on it, so only the pane at the foot writes them. The
   * grid and the axis line stay — they are what a peak's height is read against.
   * @default true
   */
  showXTicks?: boolean;
  /**
   * Whether the name of the horizontal axis is written under it.
   *
   * Separate from `showXTicks` because the two go at different moments — a pane
   * above the foot of a stack keeps neither, a chart in a narrow panel keeps its
   * numbers. `xTitle` stays required either way: which pane is the foot changes.
   * @default true
   */
  showXTitle?: boolean;
  /**
   * What the horizontal axis is called — `m/z`, `wavenumber (cm⁻¹)`.
   *
   * Required rather than defaulted, because there is no name that is right for
   * every spectrum and a default would be one viewer's units silently drawn
   * under another's data.
   */
  xTitle: string;
  /** What the vertical axis is called — `intensity`, `absorbance`, `%T`. */
  yTitle: string;
  /**
   * How much room one label along the bottom is given, in pixels.
   *
   * The default is the width of the widest number a spectrum axis writes — a
   * mass at four decimals — so that a chart in a narrow panel carries three
   * labels rather than six run together. A chart whose numbers are known to be
   * short says so and gets more of them: a fixed axis over a few hundred mass
   * units writes `400 600 800`, and at the default spacing a column that narrow
   * is given a single tick, which says nothing about the range at all.
   * @default 90
   */
  xTickSpacing?: number;
  /**
   * How much room one label up the side is given, in pixels.
   * @default 44
   */
  yTickSpacing?: number;
  /**
   * The values to rule the vertical axis at, instead of the ones the room
   * allows.
   *
   * An axis whose ticks are decided by what is being measured rather than by
   * how much space there is: a concentration read over fifteen decades is ruled
   * at the decades, and a tick at 0.0037 between two of them says nothing. The
   * values outside the window are dropped, so one list serves every zoom.
   * @default the ticks worked out from the window and the room
   */
  yTickValues?: readonly number[];
  /**
   * How a value up the side is written, instead of as a plain number.
   *
   * What goes with `yTickValues`: an axis ruled at the decades writes `10⁻³`,
   * and the exponent is the only part of it a reader is reading.
   * @default the notation the window's step calls for
   */
  formatYTick?: (value: number) => string;
}

/**
 * The frame the spectra are read against: two axis lines, a grid, and titles.
 *
 * The ticks are rules across the whole plot rather than dashes at its edge. A
 * feature is read for its height against the ones around it — is this the base
 * peak, is that band half of it — and a dash on the far left is a measuring
 * stick nobody can lay across the peak they are looking at. The rules
 * are drawn in the palest colour the theme carries and under the data band, so
 * a grid line is never mistaken for a trace.
 *
 * Every number is written outside the plot, and every line inside it. That is
 * what lets the data band be clipped without a label being cut in half, and it
 * keeps the plot itself free for the only thing it is about.
 *
 * The axis pair is one L rather than a box: the top and the right of a spectrum
 * are open, because a peak that runs out of the top is a peak the zoom has cut
 * off, and a rule along the top would read as a ceiling the measurement stopped
 * at.
 *
 * How many ticks there are follows the room there is for them — a chart in a
 * narrow panel is given fewer, rather than the same six labels overprinting one
 * another — and the precision each is written to comes from the step, so a
 * window two millimass units wide is labelled to four decimals and a full scan
 * to none. The notation is settled once per axis rather than per label, so an
 * intensity axis running to two hundred million reads `5e+7 1e+8 1.5e+8 2e+8`
 * and not a column of nine digits the title has to be read around.
 * @param props - Component props.
 * @returns The axes, as SVG.
 */
export function Axes(props: AxesProps): ReactElement {
  const {
    plot,
    xDomain,
    yDomain,
    xScale,
    yScale,
    absYTicks = false,
    showXTicks = true,
    showXTitle = true,
    xTitle,
    yTitle,
    xTickSpacing = X_TICK_SPACING,
    yTickSpacing = Y_TICK_SPACING,
    yTickValues,
    formatYTick,
  } = props;

  const xTicks = useMemo(
    () => spectrumAxis(xDomain, tickCount(plot.width, xTickSpacing)),
    [xDomain, plot.width, xTickSpacing],
  );
  const yTicks = useMemo(
    () => spectrumAxis(yDomain, tickCount(plot.height, yTickSpacing)),
    [yDomain, plot.height, yTickSpacing],
  );
  const writeXTick = useMemo(() => axisLabeller(xTicks), [xTicks]);
  const labelYTick = useMemo(() => axisLabeller(yTicks), [yTicks]);
  const writeYTick = formatYTick ?? labelYTick;

  // Ruled where the quantity asks rather than where there is room; a value the
  // zoom has left behind is dropped rather than drawn onto the margin.
  const yRules = useMemo(
    () => (yTickValues ? insideWindow(yTickValues, yDomain) : yTicks.values),
    [yTickValues, yDomain, yTicks],
  );

  const middleX = plot.left + plot.width / 2;
  const middleY = plot.top + plot.height / 2;
  // Beside the numbers rather than in a fixed column at the edge of the margin.
  // One gutter holds `100` on a spectrum and `1.5e+8` on a chromatogram, and a
  // title pinned where the wider of the two would leave it stands twenty pixels
  // clear of the narrower — far enough to read as naming the chart rather than
  // the axis.
  const titleColumn = useMemo(
    () => valueTitleColumn(yRules, writeYTick, absYTicks, plot.left),
    [yRules, writeYTick, absYTicks, plot.left],
  );
  // The rule a mirrored pair is reflected in only exists while both halves are
  // on screen; on an ordinary chart zero is the baseline and already drawn.
  const zero = chartPixel(yScale, 0);
  const showsZeroRule = yDomain[0] < 0 && yDomain[1] > 0;

  return (
    <g pointerEvents="none">
      {xTicks.values.map((tick) => (
        <line
          key={tick}
          x1={chartPixel(xScale, tick)}
          y1={plot.top}
          x2={chartPixel(xScale, tick)}
          y2={plot.bottom}
          style={gridStyle}
        />
      ))}
      {yRules.map((tick) => (
        <line
          key={tick}
          x1={plot.left}
          y1={chartPixel(yScale, tick)}
          x2={plot.right}
          y2={chartPixel(yScale, tick)}
          style={gridStyle}
        />
      ))}
      {showsZeroRule ? (
        <line
          x1={plot.left}
          y1={zero}
          x2={plot.right}
          y2={zero}
          style={zeroRuleStyle}
        />
      ) : null}
      <path
        d={`M${plot.left} ${plot.top}V${plot.bottom}H${plot.right}`}
        fill="none"
        style={axisStyle}
      />
      {showXTicks &&
        xTicks.values.map((tick) => (
          <text
            key={tick}
            x={chartPixel(xScale, tick)}
            y={plot.bottom + TICK_LABEL_GAP}
            textAnchor="middle"
            dominantBaseline="hanging"
            style={tickStyle}
          >
            {writeXTick(tick)}
          </text>
        ))}
      {yRules.map((tick) => (
        <text
          key={tick}
          x={plot.left - TICK_LABEL_GAP}
          y={chartPixel(yScale, tick)}
          textAnchor="end"
          dominantBaseline="central"
          style={tickStyle}
        >
          {writeYTick(absYTicks ? Math.abs(tick) : tick)}
        </text>
      ))}
      {showXTitle && (
        <text
          x={middleX}
          y={plot.bottom + TITLE_GAP}
          textAnchor="middle"
          dominantBaseline="hanging"
          style={titleStyle}
        >
          {xTitle}
        </text>
      )}
      <text
        x={titleColumn}
        y={middleY}
        transform={`rotate(-90 ${titleColumn} ${middleY})`}
        textAnchor="middle"
        dominantBaseline="central"
        style={titleStyle}
      >
        {yTitle}
      </text>
    </g>
  );
}

/**
 * The values of a given list that the window still shows.
 * @param values - Every value the axis would be ruled at.
 * @param domain - The window on screen, `[from, to]`.
 * @returns Those inside it, in the order they were given.
 */
function insideWindow(
  values: readonly number[],
  domain: readonly [number, number],
): number[] {
  const low = Math.min(domain[0], domain[1]);
  const high = Math.max(domain[0], domain[1]);
  const inside: number[] = [];
  for (const value of values) {
    if (value >= low && value <= high) inside.push(value);
  }
  return inside;
}

/**
 * The ticks of one axis of a chart a reader has zoomed for themselves.
 *
 * The window is exactly what the reader dragged out, so it is never widened to
 * end on a round tick — an axis that jumped outward as the drag was released
 * would show data the reader had just excluded. And the count is a budget
 * worked out from the room the panel has, so the step is rounded up rather than
 * to the nearest: one tick more than the room allows is two labels touching.
 * @param domain - The window on screen, `[from, to]`.
 * @param count - The most intervals the axis has room for.
 * @returns The axis, divided.
 */
function spectrumAxis(
  domain: readonly [number, number],
  count: number,
): ChartAxisScale {
  return chartAxisScale(domain[0], domain[1], {
    count,
    nice: false,
    step: 'atMost',
  });
}

/**
 * How many intervals an axis of a given length has room to name.
 *
 * A label at a deep zoom is eight characters wide, so the spacings are the width
 * of a label and not a fraction of the axis: a chart in a side panel then
 * carries three labels rather than the same six run together.
 * @param length - How long the axis is, in pixels.
 * @param spacing - The room one label wants along it.
 * @returns The number of intervals to aim for, never below two.
 */
function tickCount(length: number, spacing: number): number {
  return Math.max(2, Math.round(length / spacing));
}

/**
 * Where the rotated value title stands, given the numbers it has to clear.
 *
 * The widest label is measured in characters rather than in pixels, because the
 * chart has no font to measure against — `CHART_FONT` sets sizes and leaves the
 * family to the host — and a rendered measurement would mean laying the text out
 * and reading it back on every zoom.
 * @param ticks - The ticks up the side, as `chartAxisScale` chose them.
 * @param write - How this axis writes one of them.
 * @param absolute - Whether the labels are written by magnitude, which is one
 * character narrower on the half of a mirrored chart that runs negative.
 * @param left - Where the plot begins, which is the far side of the gutter.
 * @returns The column to centre the title on, never left of `TITLE_COLUMN`.
 */
function valueTitleColumn(
  ticks: readonly number[],
  write: (value: number) => string,
  absolute: boolean,
  left: number,
): number {
  let widest = 0;
  for (const tick of ticks) {
    const width = write(absolute ? Math.abs(tick) : tick).length;
    if (width > widest) widest = width;
  }
  const beside =
    left - TICK_LABEL_GAP - widest * TICK_CHARACTER - TITLE_ASIDE - HALF_TITLE;
  return Math.max(TITLE_COLUMN, beside);
}

/** Half the height of the title, which is what its rotated glyphs claim. */
const HALF_TITLE = CHART_FONT.title / 2;

/** The room a label wants along the bottom, at its widest. */
const X_TICK_SPACING = 90;

/** The room a label wants up the side. */
const Y_TICK_SPACING = 44;

/** The clear space between the plot and the numbers written outside it. */
const TICK_LABEL_GAP = 5;

/** How far under the plot the horizontal title hangs, clear of the numbers. */
const TITLE_GAP = 18;

/**
 * The column the rotated value title stands in when the numbers leave it no
 * room, inside the left margin.
 *
 * A floor rather than the place it is written: `valueTitleColumn` puts the
 * title beside the widest number instead, and this is where an axis whose
 * labels fill the whole gutter pushes it back to.
 */
const TITLE_COLUMN = 8;

/** The clear space between the widest number up the side and the title. */
const TITLE_ASIDE = 4;

/**
 * How wide one character of a tick label is, at the size the ticks are written.
 *
 * Six tenths of the type size, which is a shade wider than a digit is in any of
 * the sans faces a host is likely to be set in — the chart sets no family of its
 * own, so this is an estimate and is deliberately the generous one. Too wide
 * writes the value title a pixel or two further from the numbers than it had to
 * be; too narrow writes it over them.
 */
const TICK_CHARACTER = 0.6 * CHART_FONT.tick;

const gridStyle = { stroke: CHART_COLORS.grid } as const;

const zeroRuleStyle = { stroke: CHART_COLORS.zeroRule } as const;

const axisStyle = { stroke: CHART_COLORS.axis } as const;

const tickStyle = {
  fill: CHART_COLORS.tick,
  fontSize: CHART_FONT.tick,
} as const;

const titleStyle = {
  fill: CHART_COLORS.title,
  fontSize: CHART_FONT.title,
} as const;
