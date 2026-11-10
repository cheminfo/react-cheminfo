import type { ReactElement } from 'react';

import { CHART_COLORS } from '../../chart/core/chartTheme.ts';
import { SPECTRUM_COLORS } from '../../chart/core/spectrumColor.ts';

export interface XpsLogoProps {
  /**
   * Width and height of the mark, in pixels.
   * @default 32
   */
  size?: number;
}

/**
 * The mark of the viewer: a fitted core level, drawn the way it draws one.
 *
 * A measured envelope with one component filled under it, standing on the
 * energy axis — the same shapes, the same blue and the same orange the chart
 * itself uses, so the mark is a small piece of the tool's output rather than a
 * picture of it. The filled component is what makes it this tool's mark and not
 * a line graph: an envelope somebody has decomposed into chemistry is the whole
 * point of the viewer.
 *
 * Three shapes is what survives being shrunk to a toolbar icon; a second
 * component closes the gap between them and the mark reads as a solid blob at
 * 16px.
 * @param props - Component props.
 * @returns The mark, as SVG.
 */
export function XpsLogo(props: XpsLogoProps): ReactElement {
  const { size = 32 } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      role="presentation"
      focusable="false"
    >
      <line
        x1={2}
        y1={BASELINE}
        x2={30}
        y2={BASELINE}
        strokeWidth={BASELINE_WIDTH}
        style={baselineStyle}
      />
      <path d={COMPONENT} style={componentStyle} />
      <path
        d={ENVELOPE}
        fill="none"
        strokeWidth={ENVELOPE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={envelopeStyle}
      />
    </svg>
  );
}

/** Cropped to the ink: a mark carrying its own margin reads as the smaller one. */
const VIEW_BOX = '1 0 30 29';

/** Where the trace stands, in the same units. */
const BASELINE = 27;

const BASELINE_WIDTH = 1.4;
const ENVELOPE_WIDTH = 2.2;

/**
 * The measurement: a main line with the shoulder a second chemistry puts on it,
 * running high binding energy on the left as every published spectrum does.
 */
const ENVELOPE =
  'M2 25.6C6 25.6 8 3 12 3C16 3 16.8 13 19.6 14C22.4 15 23.5 25.6 30 25.6';

/** The one component of the fit that is filled, under the main line. */
const COMPONENT = 'M6 27C9 27 9.4 8 12 8C14.6 8 15 27 18 27Z';

const baselineStyle = { stroke: CHART_COLORS.axis } as const;

const componentStyle = { fill: CHART_COLORS.highlight } as const;

const envelopeStyle = { stroke: SPECTRUM_COLORS[0] } as const;
