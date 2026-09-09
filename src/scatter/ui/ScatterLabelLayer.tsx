import type { ReactElement } from 'react';
import { memo } from 'react';

import {
  SCATTER_GROUP_LABEL_SIZE,
  SCATTER_LABEL_SIZE,
} from './scatterLabelBoxes.ts';
import type { PlacedScatterLabel } from './scatterLabelPlacement.ts';

/** What {@link ScatterLabelLayer} draws. */
export interface ScatterLabelLayerProps {
  /** The words and where they go, from `placeScatterLabels`. */
  labels: readonly PlacedScatterLabel[];
  /**
   * Radius of the dot a label stands beside, which a line back to it starts
   * clear of.
   * @default 3.5
   */
  radius?: number;
  /**
   * Whether the words are set in the heavier weight, for a group's name over
   * its own crowd rather than a sample's name beside one dot.
   * @default false
   */
  strong?: boolean;
}

/**
 * The words written on a cloud of points.
 *
 * Every label is drawn twice over: once in the page's own background as a
 * thick stroke and once in its colour as a fill. Without that halo a name
 * landing on a crowd of dots is unreadable exactly where a reader most wants
 * to read it, and the alternatives — a solid box behind each word, or moving
 * the words off the data — either hide the dots the label is about or break
 * the link between the two.
 *
 * A word that had to be pushed clear of another word gets a thin line back to
 * what it names; the lines are drawn first so every halo cuts through them,
 * which is what keeps a line from striking through the word it arrives at.
 *
 * The layer carries no event handler and no state, like every other layer of
 * the plot: the gestures land on one transparent rectangle above it.
 * @param props - See {@link ScatterLabelLayerProps}.
 * @returns The words.
 */
export const ScatterLabelLayer = memo(function ScatterLabelLayer(
  props: ScatterLabelLayerProps,
): ReactElement {
  const { labels, radius = 3.5, strong = false } = props;

  const lines: ReactElement[] = [];
  const written: ReactElement[] = [];
  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    if (label === undefined) continue;
    const leader = label.leader;
    if (leader !== undefined) {
      const across = leader.x - label.x;
      const down = leader.y - label.y;
      const away = Math.hypot(across, down);
      const start = Math.min((radius + LEADER_GAP) / away, 1);
      lines.push(
        <line
          key={index}
          x1={round(label.x + across * start)}
          y1={round(label.y + down * start)}
          x2={round(leader.x)}
          y2={round(leader.y)}
          stroke={label.color}
          {...LEADER_STYLE}
        />,
      );
    }
    written.push(
      <text
        key={index}
        x={round(label.textX)}
        y={round(label.textY)}
        fill={label.color}
        textAnchor={label.anchor}
        dominantBaseline="middle"
        style={strong ? STRONG_LABEL_STYLE : LABEL_STYLE}
      >
        {label.text}
      </text>,
    );
  }

  return (
    <g data-layer="labels" paintOrder="stroke" stroke="var(--surface)">
      {lines}
      {written}
    </g>
  );
});

/** How far a line back to a dot starts clear of that dot. */
const LEADER_GAP = 2;

/**
 * The line from a word to what it names. Thin and faint: it is a pointer and
 * not a reading, and drawn at full strength forty of them read as data.
 */
const LEADER_STYLE = {
  strokeWidth: 0.75,
  strokeOpacity: 0.55,
  fill: 'none',
} as const;

/**
 * A sample's own name. Small, because there is one per dot and the map is the
 * thing being read; the halo is what makes it legible rather than the size.
 */
const LABEL_STYLE = {
  fontSize: SCATTER_LABEL_SIZE,
  strokeWidth: 3,
  strokeLinejoin: 'round',
  userSelect: 'none',
} as const;

/** A group's name, which stands over a crowd and has to win against it. */
const STRONG_LABEL_STYLE = {
  fontSize: SCATTER_GROUP_LABEL_SIZE,
  fontWeight: 600,
  strokeWidth: 3.5,
  strokeLinejoin: 'round',
  userSelect: 'none',
} as const;

/*
 * Two decimals, which is under a tenth of a device pixel at any zoom a browser
 * offers and keeps the markup short enough to read in a failing test.
 */
const round = (value: number): number => Math.round(value * 100) / 100;
