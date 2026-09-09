/**
 * How one group outline is drawn, wherever it is drawn.
 *
 * The map and the pair grid measure their groups differently — the map over
 * two columns of points, the grid over one shared block of covariances — but a
 * reader moving between the two tabs has to see the same picture, so the one
 * decision about fill and the collinear case lives here rather than once per
 * figure.
 */

import type { ReactElement } from 'react';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import type { ConfidenceEllipse } from '../core/confidenceEllipse.ts';
import type { PixelEllipse } from '../core/ellipseProjection.ts';
import { ellipsePolygon, projectEllipse } from '../core/ellipseProjection.ts';

/** How one outline is inked. */
export interface ScatterOutlineInk {
  /** The group's own colour, which the region is filled with. */
  color: string;
  /**
   * How strongly the whole outline is drawn, which is what a muted legend
   * entry turns down.
   * @default undefined — the outline is drawn at full strength
   */
  opacity?: number;
  /**
   * How solid the region is; `0` draws nothing at all, since the fill is the
   * whole shape.
   * @default SCATTER_OUTLINE_FILL_OPACITY
   */
  fillOpacity?: number;
}

/**
 * One group outline, mapped onto a plot and ready to be drawn.
 *
 * The region is fill only, with no boundary drawn: a stroked edge reads as a
 * measured limit the ellipse never claims to be, and it competes with the dots
 * the reader is there to count. The fill is deliberately faint for the same
 * reason it is the whole shape — fills stack where groups overlap, and a tint
 * heavy enough to see on its own turns two overlapping species into a third
 * colour the reader then looks for in the legend.
 *
 * A group whose points lie on a straight line is drawn as the segment it
 * actually is, and that one is stroked, since a shape of no height fills to
 * nothing: that a group is perfectly correlated in these two axes is a
 * finding, and dropping its outline would hide it.
 * @param group - Which group it belongs to, for the key and the attribute the tests read.
 * @param ellipse - The outline in data units, from `confidenceEllipse` or `scatterPairEllipse`.
 * @param scaleX - Data to pixels, horizontally.
 * @param scaleY - Data to pixels, vertically; its `factor` is negative.
 * @param ink - See {@link ScatterOutlineInk}.
 * @returns The element, keyed by group.
 */
export function scatterOutlineShape(
  group: number,
  ellipse: ConfidenceEllipse,
  scaleX: ChartScale,
  scaleY: ChartScale,
  ink: ScatterOutlineInk,
): ReactElement {
  const drawn = projectEllipse(ellipse, scaleX, scaleY);
  return drawn === null
    ? sampledOutline(group, ellipse, scaleX, scaleY, ink)
    : projectedOutline(group, drawn, ink);
}

/**
 * How solid a group's region is.
 *
 * Three iris species overlap in the leading components, and fills compound
 * where they do: at 0.2 two of them stack to 0.36 and read as a fourth group
 * with a colour of its own, while at 0.1 they stack to 0.19 — denser than
 * either, plainly still the same family. Below about 0.06 the region stops
 * being visible against a white ground at all, which is the other failure.
 * A caller drawing ten groups should turn it down.
 */
export const SCATTER_OUTLINE_FILL_OPACITY = 0.1;

/** Firm enough to read over a cloud of its own colour. */
const SEGMENT_STROKE_WIDTH = 1.5;

const HALF_TURN_DEGREES = 180;

function projectedOutline(
  group: number,
  shape: PixelEllipse,
  ink: ScatterOutlineInk,
): ReactElement {
  const { cx, cy, rx, ry, angleDegrees } = shape;
  const shared = { 'data-group': group, opacity: ink.opacity };
  if (ry > 0) {
    return (
      <ellipse
        key={group}
        {...shared}
        {...fillOf(ink)}
        cx={round(cx)}
        cy={round(cy)}
        rx={round(rx)}
        ry={round(ry)}
        transform={`rotate(${round(angleDegrees)} ${round(cx)} ${round(cy)})`}
      />
    );
  }
  const radians = (angleDegrees * Math.PI) / HALF_TURN_DEGREES;
  const alongX = rx * Math.cos(radians);
  const alongY = rx * Math.sin(radians);
  return (
    <line
      key={group}
      {...shared}
      fill="none"
      stroke={ink.color}
      strokeWidth={SEGMENT_STROKE_WIDTH}
      x1={round(cx - alongX)}
      y1={round(cy - alongY)}
      x2={round(cx + alongX)}
      y2={round(cy + alongY)}
    />
  );
}

/*
 * The outline sampled and mapped point by point, for the one case the exact
 * projection gives up on: coordinates large enough that squaring the mapping
 * overflows. Mapping each point stays linear and so survives what squaring
 * does not.
 */
function sampledOutline(
  group: number,
  ellipse: ConfidenceEllipse,
  scaleX: ChartScale,
  scaleY: ChartScale,
  ink: ScatterOutlineInk,
): ReactElement {
  const outline = ellipsePolygon(ellipse);
  let path = '';
  for (let index = 0; index < outline.length; index++) {
    const point = outline[index];
    if (point === undefined) continue;
    const px = round(scaleX.offset + point.x * scaleX.factor);
    const py = round(scaleY.offset + point.y * scaleY.factor);
    path += `${index === 0 ? 'M' : 'L'}${px} ${py}`;
  }
  return (
    <path
      key={group}
      data-group={group}
      d={path === '' ? path : `${path}Z`}
      opacity={ink.opacity}
      {...fillOf(ink)}
    />
  );
}

/* A fill of no opacity is left off the element rather than painted invisibly. */
function fillOf(ink: ScatterOutlineInk): {
  fill: string;
  fillOpacity?: number;
} {
  const share = ink.fillOpacity ?? SCATTER_OUTLINE_FILL_OPACITY;
  if (!(share > 0)) return { fill: 'none' };
  return { fill: ink.color, fillOpacity: share };
}

const round = (value: number): number => Math.round(value * 100) / 100;
