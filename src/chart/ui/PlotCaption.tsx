import type { ReactElement } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import { CHART_COLORS, LABEL_HALO } from '../core/chartTheme.ts';
import {
  CHARACTER_WIDTH,
  FONT_SIZE,
  GAP,
  MARGIN,
  ROW_HEIGHT,
} from '../core/legendBox.ts';

/** What the caption says, and how much of the plot it may say it across. */
export interface PlotCaptionProps {
  /** What the plot is a picture of, in one line. */
  text: string;
  /** The plot it is written on. */
  plot: PlotRect;
  /**
   * The x it must stop short of, in the plot's own pixels.
   *
   * The left edge of a legend sharing the top of the plot, which `legendBox`
   * answers for whoever is drawing one. Nothing here works that out on its own:
   * a caption is written wherever a caller asks and only the caller knows what
   * else it put up there.
   * @default the plot's right edge
   */
  until?: number;
}

/**
 * What a plot is a picture of, written in its top left corner.
 *
 * The opposite corner from the legend, and it says the opposite kind of thing:
 * a legend names the curves against each other, while a caption says which
 * measurement the whole pane is of — which file, which acquisition of it, when
 * it was measured. A stack of panes is where that matters, since three charts
 * one above another are three pictures of three different scans and the axes
 * say nothing about which.
 *
 * Drawn **inside the SVG**, for the reason `TraceLegend` states: a picture is
 * exported by cloning the chart's own `SVGSVGElement`, so a caption living in a
 * `<div>` beside it would be missing from every figure while looking perfectly
 * right on screen — and a figure that does not say what it is a picture of is
 * the one thing a caption exists to prevent.
 *
 * It is written on the plot rather than above it. The room over a plot belongs
 * to the tallest peak's label, and taking it for a caption would either push
 * the measurement down or have the two collide on whichever spectrum happens to
 * peak at the left.
 * @param props - Component props.
 * @returns The caption, or nothing where there is no room to write it.
 */
export function PlotCaption(props: PlotCaptionProps): ReactElement | null {
  const { text, plot, until } = props;

  const said = elide(text, (until ?? plot.right) - GAP - plot.left - MARGIN);
  if (said === '') return null;

  return (
    <text
      x={plot.left + MARGIN}
      y={plot.top + MARGIN + ROW_HEIGHT / 2}
      fontSize={FONT_SIZE}
      dominantBaseline="middle"
      style={captionStyle}
      pointerEvents="none"
      aria-hidden="true"
    >
      {said}
    </text>
  );
}

/**
 * The caption cut to the room it has, with an ellipsis where it was cut.
 *
 * Measured from character counts rather than from the DOM, for the reason
 * `legendBox` gives: the text is decided during render, where a
 * `getComputedTextLength` would need a layout pass that has not happened, and
 * the clone an export takes gets no layout at all — so a caption that measured
 * itself would come out one length on screen and another in the figure.
 * @param text - What the pane would say.
 * @param room - How wide it may be, in pixels.
 * @returns What it says, or nothing where a caption would be a stub.
 */
function elide(text: string, room: number): string {
  const fits = Math.floor(room / CHARACTER_WIDTH);
  if (fits >= text.length) return text;
  // A caption cut to three characters is not a caption, and a reader has to
  // guess at what it was — better a pane that says nothing than one that
  // appears to answer and does not.
  if (fits < MINIMUM_CHARACTERS) return '';
  return `${text.slice(0, fits - 1).trimEnd()}…`;
}

/** The shortest caption still worth writing, in characters. */
const MINIMUM_CHARACTERS = 8;

/**
 * The face it is set in: the axis titles' ink, haloed like a peak label.
 *
 * The halo is what lets it be written straight onto the plot rather than in a
 * box: a box in the top left would hide the very trace the pane is a picture
 * of, while a hairline of paper around each glyph clears the letters and
 * nothing else.
 */
const captionStyle = { fill: CHART_COLORS.title, ...LABEL_HALO } as const;
