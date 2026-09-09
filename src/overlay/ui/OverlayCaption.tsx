import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

import { overlayCaptionStyle } from './overlayFigureStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayCaption} says, and where. */
export interface OverlayCaptionProps {
  /**
   * One sentence, in words the reader already has. It is the figure's own
   * explanation, so it names what a mark is before it names what an axis is.
   */
  children: ReactNode;
  /**
   * Whether it floats over the figure or is laid out in the flow beneath it.
   *
   * A figure reserves the foot of its own box for the horizontal axis title, so
   * a band floating there prints the sentence over the axis name. `below` is
   * therefore what a standing explanation wants: it explains the picture rather
   * than annotating a gesture, and nothing it says is worth covering the axis
   * for. `over` is left for a sentence that has to reach the reader without the
   * figure moving under their pointer.
   * @default 'over'
   */
  placement?: 'over' | 'below';
  /**
   * Which edge it sits against, when it floats over the figure. A docked
   * caption ignores it — it has only the one place to be.
   * @default 'bottom'
   */
  edge?: 'top' | 'bottom';
  /**
   * How loud it is. `quiet` is the standing explanation; `strong` is live
   * state the reader has just caused — `Adding to selection`, `31 samples
   * selected`.
   * @default 'quiet'
   */
  tone?: 'quiet' | 'strong';
  /**
   * Whether a screen reader is told about it as it changes. Turn it on for
   * `strong`, so a selection made by keyboard is announced.
   * @default false
   */
  live?: boolean;
}

/**
 * The band across a figure that says, in one sentence, what it is showing.
 *
 * Floating, it is a gradient rather than a filled strip: the sentence stays
 * readable while the marks under its far edge stay visible, so it never looks
 * as though it has cropped the data. Docked, it needs neither — there is
 * nothing under it to see through to.
 * @param props - See {@link OverlayCaptionProps}.
 * @returns The band.
 */
export function OverlayCaption(props: OverlayCaptionProps): ReactElement {
  const { children, placement = 'over', edge = 'bottom' } = props;
  const { tone = 'quiet', live = false } = props;
  const { metrics } = useOverlaySurface();

  return (
    <div
      style={placement === 'below' ? DOCKED_STYLE : bandStyle(edge, metrics)}
    >
      <span
        style={overlayCaptionStyle(metrics, tone)}
        aria-live={live ? 'polite' : undefined}
        aria-atomic={live ? true : undefined}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * The band is the one piece of chrome that spans the whole figure, so it keeps
 * the pointer away from itself even though a card takes it back: a sentence
 * across the foot of a scatter would otherwise swallow the start of every
 * lasso drawn near the bottom edge.
 * @param edge - Which edge the sentence sits against.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The band's rules.
 */
function bandStyle(
  edge: 'top' | 'bottom',
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: edge === 'top' ? 0 : undefined,
    bottom: edge === 'bottom' ? 0 : undefined,
    display: 'flex',
    alignItems: 'center',
    padding: `${metrics.paddingY}px ${metrics.inset}px`,
    background: `linear-gradient(to ${edge === 'bottom' ? 'top' : 'bottom'}, ${GROUND}, ${GROUND} 45%, ${CLEAR})`,
    pointerEvents: 'none',
  };
}

/**
 * Nearly the page's own surface where the words are, and the same colour at
 * zero strength where they stop. Fading to plain `transparent` interpolates
 * through transparent black, which draws a grey bruise across the middle of a
 * light figure.
 */
const GROUND = 'color-mix(in srgb, var(--surface) 86%, transparent)';
const CLEAR = 'color-mix(in srgb, var(--surface) 0%, transparent)';

/**
 * A docked caption's own row: a block in the flow, with no ground of its own.
 *
 * It keeps the pointer, unlike the floating band. Below the figure there is no
 * lasso to start underneath it, and a sentence a reader cannot select is a
 * sentence they cannot quote.
 */
const DOCKED_STYLE = {
  display: 'flex',
  alignItems: 'center',
} as const satisfies CSSProperties;
