/**
 * Every rule the floating chrome is drawn with.
 *
 * The domain's one design decision is here rather than spread over sixteen
 * components: a card floating over a figure is a *quiet* surface. It is
 * translucent so the reader can see that there is a picture underneath it, it
 * is separated from the picture by a hairline rather than a shadow the eye
 * reads as a dialog, and at rest only its ground fades — never its text.
 *
 * That last point is why the ground is a layer of its own instead of an
 * `opacity` on the card. Fading the whole card fades the words with it, and a
 * label at three-quarters strength over a busy scatter is unreadable exactly
 * when the reader needs it. So the ground fades to `restingOpacity` and the
 * content sits above it at full strength.
 *
 * Every colour is a family token. Nothing here writes a literal, so a card
 * over a chart on any site of the family is the site's own grey.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';
import type { OverlayPlacement } from '../core/overlayPlacement.ts';
import { overlayCornerStyle } from '../core/overlayPlacement.ts';

/** The inert layer covering a figure, which every pointer event passes through. */
export const OVERLAY_LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
} as const satisfies CSSProperties;

/**
 * Where one card sits over the figure.
 *
 * The card takes the pointer back from the layer, so a control can be clicked
 * while a drag started anywhere else still reaches the figure underneath.
 *
 * A docked card is laid out in the flow but is still made `relative`, because
 * its ground is an absolutely positioned sibling of its content and has to be
 * held by the card rather than by whatever is positioned further up. Left
 * `static`, the ground escapes to the nearest positioned ancestor — the figure
 * — and paints the whole picture in opaque white, and because the ground takes
 * no pointer events, nothing under it reports being covered. That holds for
 * the stretched bar too, which is docked in exactly the same way.
 * @param placement - Which corner it sits in, or whether it is docked outside.
 * @param metrics - The measurements it is drawn from.
 * @returns The positioning rules.
 */
export function overlayCardStyle(
  placement: OverlayPlacement,
  metrics: OverlayMetrics,
): CSSProperties {
  if (placement === 'stretch') return OVERLAY_STRETCHED_CARD_STYLE;
  const corner = overlayCornerStyle(placement, metrics.inset);
  return {
    ...corner,
    position: corner.position === 'absolute' ? 'absolute' : 'relative',
    display: 'inline-flex',
    maxWidth: `calc(100% - ${metrics.inset * 2}px)`,
    borderRadius: 'var(--radius)',
    pointerEvents: 'auto',
    isolation: 'isolate',
  };
}

/**
 * The translucent ground behind a card's content.
 *
 * The blur is dropped while the figure is repainting: a backdrop filter is
 * recomputed every time the pixels behind it change, which during a lasso drag
 * is every frame, and the flat fill is indistinguishable at these opacities.
 * @param opacity - How opaque the ground is, 0 to 1.
 * @param busy - Whether the figure underneath is repainting.
 * @returns The ground's rules.
 */
export function overlayGroundStyle(
  opacity: number,
  busy: boolean,
): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: busy ? undefined : 'blur(8px) saturate(1.4)',
    opacity,
    transition: 'opacity 120ms ease-out',
    pointerEvents: 'none',
  };
}

/**
 * The row of controls inside a card, above its ground.
 * @param metrics - The measurements the card is drawn from.
 * @returns The content's rules.
 */
export function overlayContentStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: metrics.gap,
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    color: 'var(--text)',
    fontSize: metrics.fontSize,
    lineHeight: 1.2,
  };
}

/**
 * The controls a card's button opens, behind the strip.
 *
 * A column where the strip is a wrapping row, because a card folds exactly
 * when the figure is narrow, and a row of controls in a popover over a narrow
 * figure is a row that reaches past the edge of the screen.
 * @param metrics - The measurements the card is drawn from.
 * @returns The panel's rules.
 */
export function overlayPanelStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    ...overlayContentStyle(metrics),
    flexWrap: 'nowrap',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 168,
  };
}

/**
 * A bar that spans the whole width of the figure.
 *
 * It takes the width rather than hugging its contents, since the two ends are
 * only pushed apart once there is width between them to push into. It carries
 * no corner radius of its own: a rounded strip flush against the top of a
 * figure leaves two slivers of the page showing through its corners, which
 * reads as a gap in the chrome rather than as a rounded card.
 */
const OVERLAY_STRETCHED_CARD_STYLE = {
  position: 'relative',
  display: 'flex',
  width: '100%',
  maxWidth: '100%',
  pointerEvents: 'auto',
  isolation: 'isolate',
} as const satisfies CSSProperties;

/**
 * How opaque a card's ground is drawn while nothing is pointing at the figure.
 *
 * Floored whatever the caller asks for: under about six tenths the card is a
 * ghost over a busy scatter, and a control the reader cannot find is worse
 * than one that costs a little of the picture.
 * @param asked - The opacity the caller asked for.
 * @returns The opacity the ground is drawn at.
 */
export function overlayRestingOpacity(asked: number): number {
  if (!Number.isFinite(asked)) return OVERLAY_RESTING_OPACITY;
  return Math.min(1, Math.max(0.6, asked));
}

/** What a card's ground fades to when the caller does not say. */
export const OVERLAY_RESTING_OPACITY = 0.74;

/**
 * The ground behind a bar that spans the whole width of the figure.
 *
 * Solid, unblurred and never faded, where a floating card is translucent: a
 * strip across the full width is chrome the figure is mounted in rather than
 * something laid on top of it, and a blurred translucent band over the top of
 * an embedded figure reads as a rendering fault. The hairline is at the foot
 * alone, so the bar is separated from the picture it introduces without being
 * boxed off from the page that is hosting it.
 */
export const OVERLAY_BAR_GROUND_STYLE = {
  position: 'absolute',
  inset: 0,
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface)',
  pointerEvents: 'none',
} as const satisfies CSSProperties;

/**
 * The row inside a stretched bar, whose two ends are pushed apart.
 *
 * It never wraps. A bar that wrapped would change the figure's height as the
 * page around it resized, and an embedded figure that moves the host's layout
 * while it is being read is worse than one whose second-tier controls have
 * folded away into the button at its end.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The row's rules.
 */
export function overlayBarContentStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    ...overlayContentStyle(metrics),
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
  };
}

/**
 * One end of a stretched bar.
 *
 * Both ends are drawn from the same rule, so the pills at the start and the
 * controls at the end keep one rhythm across the width between them.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The end's rules.
 */
export function overlayBarSideStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: metrics.gap,
    minWidth: 0,
  };
}
