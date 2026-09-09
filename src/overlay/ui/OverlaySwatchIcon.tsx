import type { CSSProperties, ReactElement } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlaySwatchIcon} draws. */
export interface OverlaySwatchIconProps {
  /**
   * The colours the figure is drawn in, in the order it draws them. Hand it
   * the very colours on the chart: the whole point of this glyph is that a
   * reader recognises the plot in it without being taught anything.
   */
  colors: readonly string[];
}

/**
 * The colours of a figure, as the glyph of the control that changes them.
 *
 * Every other icon on a bar has to be learned before it means anything. This
 * one does not: a reader who has just looked at four groups of dots knows what
 * a row of those four colours opens, which is why the control that picks what
 * the figure is coloured by wears its palette rather than a paint-pot.
 *
 * Past four colours it becomes three and a count. Eight dots inside a
 * twenty-four pixel button is a smear, and a smear says less about the figure
 * than three honest colours and the news that there are more.
 * @param props - See {@link OverlaySwatchIconProps}.
 * @returns The row of dots.
 */
export function OverlaySwatchIcon(props: OverlaySwatchIconProps): ReactElement {
  const { colors } = props;
  const { metrics } = useOverlaySurface();

  const shown =
    colors.length > OVERLAY_SWATCH_DOTS
      ? OVERLAY_SWATCH_DOTS - 1
      : colors.length;
  const rest = colors.length - shown;
  const size = dotSize(metrics);
  const dots: ReactElement[] = [];
  for (let index = 0; index < shown; index++) {
    const color = colors[index];
    if (color === undefined) continue;
    dots.push(
      <span
        key={`${index}:${color}`}
        style={overlaySwatchDotStyle(color, size)}
      />,
    );
  }

  return (
    <span aria-hidden="true" style={OVERLAY_SWATCH_ROW_STYLE}>
      {dots}
      {rest > 0 ? (
        <span style={overlaySwatchRestStyle(metrics)}>{`+${rest}`}</span>
      ) : null}
    </span>
  );
}

/** How many dots the glyph holds before the last one becomes a count. */
const OVERLAY_SWATCH_DOTS = 4;

/** The dots side by side, with the button's own ink for the count. */
const OVERLAY_SWATCH_ROW_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
} as const satisfies CSSProperties;

/**
 * One dot.
 *
 * Round rather than square, because these stand for the marks on a scatter
 * rather than for the series of a bar chart.
 *
 * The hairline that keeps a pale group visible against the card is drawn only
 * once the dot is wide enough to carry it: inside a four pixel dot a one pixel
 * ring is half the dot, and the reader is then shown a grey ring with a speck
 * of the group's colour in it — which is the one thing this glyph exists not
 * to do.
 * @param color - The colour of the group it stands for.
 * @param size - How wide the dot is.
 * @returns The dot's rules.
 */
function overlaySwatchDotStyle(color: string, size: number): CSSProperties {
  return {
    display: 'inline-block',
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    boxShadow: size >= 6 ? 'inset 0 0 0 1px var(--border)' : undefined,
  };
}

/**
 * The count standing in for the colours that did not fit.
 *
 * It takes the button's own ink rather than a colour of its own, so it fades
 * and lights with the button instead of reading as a fifth group.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The count's rules.
 */
function overlaySwatchRestStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    fontSize: Math.max(9, metrics.labelSize - 1),
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    lineHeight: 1,
  };
}

/**
 * How wide one dot is.
 *
 * A sixth of the button, so the row of four fills it the way a glyph would
 * rather than sitting in the middle of it as four specks.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The dot's width in pixels.
 */
function dotSize(metrics: OverlayMetrics): number {
  return Math.max(4, Math.round(metrics.buttonSize / 6));
}
