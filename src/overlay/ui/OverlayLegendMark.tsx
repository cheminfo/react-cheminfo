import type { ReactElement } from 'react';

import type { OverlayMarkShape } from '../core/overlayMarks.ts';
import { isFilledMark } from '../core/overlayMarks.ts';

/** What {@link OverlayLegendMark} draws. */
export interface OverlayLegendMarkProps {
  /** The colour the mark carries on the figure. */
  color: string;
  /**
   * Which mark it is.
   * @default 'dot'
   */
  shape?: OverlayMarkShape;
  /**
   * Side of the square the mark is drawn in, in pixels.
   * @default 12
   */
  size?: number;
  /**
   * Whether it is drawn faint, which is what a switched-off entry looks like.
   * @default false
   */
  muted?: boolean;
}

/**
 * The small picture of a mark, in front of what the mark means.
 *
 * The strokes are heavier than the geometry would suggest: a hairline rule
 * beside a filled dot of the same width reads as a paler colour rather than as
 * a different shape, and a reader comparing the two then believes the series
 * is drawn in two colours. It carries no label of its own — the entry beside it
 * is the label — so a screen reader is told to skip it rather than to announce
 * an image with no name.
 * @param props - See {@link OverlayLegendMarkProps}.
 * @returns The mark.
 */
export function OverlayLegendMark(props: OverlayLegendMarkProps): ReactElement {
  const { color, shape = 'dot', size = 12, muted = false } = props;
  const filled = isFilledMark(shape);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        flex: 'none',
        opacity: muted ? MUTED_OPACITY : 1,
      }}
    >
      <g
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
        strokeLinecap="round"
      >
        {MARK_GEOMETRY[shape]}
      </g>
    </svg>
  );
}

/**
 * Each mark once, at module level: the geometry never depends on the colour —
 * the group above it carries that — so one element per shape is shared by every
 * legend on the page rather than rebuilt per entry per render.
 */
const MARK_GEOMETRY: Record<OverlayMarkShape, ReactElement> = {
  dot: <circle cx="6" cy="6" r="4.2" />,
  ring: <circle cx="6" cy="6" r="3.4" strokeWidth="2.2" />,
  square: <rect x="2" y="2" width="8" height="8" rx="1.5" />,
  line: <line x1="0.5" y1="6" x2="11.5" y2="6" strokeWidth="2.8" />,
  dashed: (
    <line
      x1="0.5"
      y1="6"
      x2="11.5"
      y2="6"
      strokeWidth="2.8"
      strokeDasharray="3.4 2.6"
    />
  ),
  cross: <path d="M2.2 2.2 L9.8 9.8 M9.8 2.2 L2.2 9.8" strokeWidth="2.4" />,
};

/**
 * Faint enough to read as switched off at a glance, dark enough that the
 * colour is still identifiable — a reader turning a group back on has to
 * recognise which one it was.
 */
const MUTED_OPACITY = 0.35;
