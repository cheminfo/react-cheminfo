import type { ReactElement } from 'react';

import { CHART_COLORS } from '../../chart/core/chartTheme.ts';
import { SPECTRUM_COLORS } from '../../chart/core/spectrumColor.ts';

export interface MassLogoProps {
  /**
   * Width and height of the mark, in pixels.
   * @default 16
   */
  size?: number;
}

/**
 * The viewer's mark: a labelled spectrum, drawn the way the chart draws one.
 *
 * Three sticks on a baseline with a triangle on the tallest — the same shapes,
 * the same blue and the same orange the chart itself uses, so the mark is a
 * small piece of the tool's output rather than a picture of it. Three sticks is
 * what survives being shrunk to a toolbar icon; a fourth closes the gaps between
 * them and the mark reads as a solid block at 16 pixels.
 * @param props - Component props.
 * @returns The mark, as SVG.
 */
export function MassLogo(props: MassLogoProps): ReactElement {
  const { size = 16 } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      role="img"
      aria-label="Mass spectrum viewer"
    >
      <line
        x1={2}
        y1={BASELINE}
        x2={30}
        y2={BASELINE}
        strokeWidth={BASELINE_WIDTH}
        style={baselineStyle}
      />
      {STICKS.map((stick) => (
        <line
          key={stick.x}
          x1={stick.x}
          y1={BASELINE}
          x2={stick.x}
          y2={stick.top}
          strokeWidth={STICK_WIDTH}
          strokeLinecap="butt"
          style={stickStyle}
        />
      ))}
      <path d={MARK} style={markStyle} />
    </svg>
  );
}

/** Cropped to the ink: a mark carrying its own margin reads as the smaller one. */
const VIEW_BOX = '1 0 30 29';

/** Where the sticks stand, in the same units. */
const BASELINE = 27;

const BASELINE_WIDTH = 1.4;
const STICK_WIDTH = 2.6;

/** The base peak in the middle, with a shoulder either side of it. */
const STICKS = [
  { x: 6, top: 15 },
  { x: 16, top: 7 },
  { x: 26, top: 19 },
] as const;

/** The triangle on the base peak: apex on the tip, body clear of it. */
const MARK = 'M16 6L12.4 0.6L19.6 0.6Z';

const baselineStyle = { stroke: CHART_COLORS.axis } as const;

const stickStyle = { stroke: SPECTRUM_COLORS[0] } as const;

const markStyle = { fill: CHART_COLORS.highlight } as const;
