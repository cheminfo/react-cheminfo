import type { ReactElement } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { PlotRect } from '../core/chartGeometry.ts';
import {
  CLOSE_COLUMN,
  FONT_SIZE,
  GAP,
  PADDING,
  ROW_HEIGHT,
  SWATCH,
  hiddenLabel,
  legendBox,
  legendLabel,
  legendNames,
} from '../core/legendBox.ts';

/** One trace the legend names. */
export interface LegendEntry {
  /** Identity, which is what the list is keyed on. */
  id: string;
  /** What it is called. */
  name: string;
  /** The colour it is drawn in. */
  color: string;
  /**
   * Whether it is drawn solid or faint — a trace that is present but not the
   * one being read.
   * @default false
   */
  dimmed?: boolean;
  /**
   * A 1-based number written before the name.
   *
   * The palette hands out six hues and `nextSpectrumColor` deliberately falls
   * back to the least-used one rather than reaching for a colour only some
   * readers can place, so the seventh trace legitimately repeats a colour and
   * the legend stops being able to tell two rows apart by swatch alone. A
   * number tells them apart at twelve traces and at thirty, survives a
   * monochrome print, and survives a trace too short to show its colour
   * clearly — the row then reads `3 · x 132, y 88`.
   * @default undefined
   */
  index?: number;
  /**
   * A short remark written at the right of the row, in grey.
   * @default undefined
   */
  note?: string;
}

export interface TraceLegendProps {
  /** The traces, in the order they are drawn. */
  entries: readonly LegendEntry[];
  /** The plot the legend sits inside. */
  plot: PlotRect;
  /**
   * How many entries are named before the rest are counted instead.
   *
   * A legend taller than the plot is a legend that hides the measurement it is
   * explaining, which is the failure a scrollbar in a legend admits to. Past
   * this many the last line reads `+ 4 more`.
   * @default 8
   */
  limit?: number;
  /**
   * How few named traces are still worth a legend.
   *
   * Two is right for a chart standing on its own: the axis title already says
   * what the single curve is, so a box naming the only trace is furniture. It
   * is wrong for a pane of a stack, where the panes share their axes and the
   * legend is the only thing saying which measurement this one is of — there a
   * single name is the whole point, and the pane passes 1.
   * @default 2
   */
  minimumEntries?: number;
  /**
   * Whether a column is left at the right of every row for a control.
   *
   * The picture never draws that control — a cross drawn here would be cloned
   * into every exported figure as a dead glyph, and a press on the SVG root is
   * read as the start of a chart gesture — but it has to leave the room for it,
   * or the box painted behind the rows comes out narrower than the rows an HTML
   * layer places over it and every cross hangs off the end of the legend.
   * @default false
   */
  closable?: boolean;
}

/**
 * What each curve on a chart is, written in the top right of the plot.
 *
 * Drawn **inside the SVG** and never as HTML beside it, which is not a style
 * choice: `stackDrawings` exports a picture by cloning the chart's own
 * `SVGSVGElement`, so a legend living in a `<div>` would be missing from every
 * exported figure while looking perfectly correct on screen — a picture that is
 * wrong only once it leaves the application is the worst kind to ship.
 *
 * Top right because that is where a chromatogram has room: a trace rises from
 * the baseline and the tallest peak is rarely at the right-hand edge. It is
 * drawn over the plot rather than in a gutter beside it so that adding a legend
 * does not narrow the measurement.
 *
 * Where it sits and how tall it is comes from `legendBox` rather than from
 * arithmetic of its own, because a legend whose rows carry an interactive
 * control is drawn a second time in HTML over this one, and two owners of a row
 * position is a cross that drifts off the name it closes.
 *
 * A trace with no name is not given one here. An unnamed curve in a legend is a
 * row of colour and nothing else, which is worse than being left out, and the
 * caller knows what it drew.
 * @param props - Component props.
 * @returns The legend, or nothing when there are too few traces to name.
 */
export function TraceLegend(props: TraceLegendProps): ReactElement | null {
  const {
    entries,
    plot,
    limit = 8,
    minimumEntries = 2,
    closable = false,
  } = props;
  const named = legendNames(entries, minimumEntries);
  if (named.length === 0) return null;

  // The very options the control layer measures with, or the two disagree by
  // exactly the width of the column a cross stands in.
  const box = legendBox(named, plot, { limit, closable });
  const noteX = box.left + box.width - PADDING - (closable ? CLOSE_COLUMN : 0);

  return (
    <g aria-hidden="true" pointerEvents="none">
      <rect
        x={box.left}
        y={box.top}
        width={box.width}
        height={box.height}
        rx={3}
        fill="rgb(255 255 255 / 82%)"
        stroke="rgb(217 223 230)"
        strokeWidth={0.5}
      />
      {box.rows.map((row, index) => {
        const entry = named[index];
        if (entry === undefined) return null;
        return (
          <g key={row.id} opacity={entry.dimmed === true ? 0.45 : 1}>
            <line
              x1={box.left + PADDING}
              x2={box.left + PADDING + SWATCH}
              y1={row.middle}
              y2={row.middle}
              stroke={entry.color}
              strokeWidth={2}
            />
            <text
              x={box.left + PADDING + SWATCH + GAP}
              y={row.middle}
              fontSize={FONT_SIZE}
              dominantBaseline="middle"
              fill="rgb(28 33 39)"
            >
              {legendLabel(entry)}
            </text>
            {entry.note !== undefined && (
              <text
                x={noteX}
                y={row.middle}
                fontSize={FONT_SIZE}
                dominantBaseline="middle"
                textAnchor="end"
                fill={TOKEN.textMuted}
              >
                {entry.note}
              </text>
            )}
          </g>
        );
      })}
      {box.hidden > 0 && (
        <text
          x={box.left + PADDING + SWATCH + GAP}
          y={box.top + box.height - PADDING - ROW_HEIGHT / 2}
          fontSize={FONT_SIZE}
          dominantBaseline="middle"
          fill={TOKEN.textMuted}
        >
          {hiddenLabel(box.hidden)}
        </text>
      )}
    </g>
  );
}
