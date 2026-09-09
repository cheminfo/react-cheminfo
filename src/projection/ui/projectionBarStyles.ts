/**
 * Every rule the settings bar over the figure is drawn with.
 *
 * They sit apart from the rules the tabs themselves are drawn with because the
 * bar is the viewer's own chrome rather than part of any figure: it is one row
 * whatever the tab, and what changes with the figure's width is how much of
 * itself it writes rather than what it holds. Every colour is a family token,
 * so the bar on any site of the family is that site's own grey.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';

/**
 * The row the settings bar is laid into, which is one height for every tab.
 *
 * Two of the four tabs put a picker on the bar and two put a stepper, and a
 * picker is the taller of the two whatever size the surface asks it for.
 * Without a floor the bar would be six pixels shorter on the pair grid than on
 * the map, and the whole figure under it would jump every time the reader
 * moved between them — which is the one thing an embedded figure must never do
 * to the page hosting it.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The row's rules.
 */
export function projectionBarRowStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'stretch',
    minHeight:
      metrics.paddingY * 2 + Math.max(metrics.controlHeight, PICKER_HEIGHT),
  };
}

/** How tall a picker stands, which no measurement of ours makes it smaller. */
const PICKER_HEIGHT = 30;

/**
 * The box the strip of views sits in.
 *
 * On every width but the narrowest it refuses to shrink, so a bar whose
 * estimate was a few pixels out clips nothing and the views keep their words.
 * At the last rung it becomes a scroller instead: a figure three hundred
 * pixels wide cannot hold four names however short they are written, and a
 * strip that scrolls is one the reader can still reach every view from, where
 * a strip squeezed further is a row of initials nobody can read.
 *
 * Two things make that scroller read as deliberate rather than as a fault. Its
 * ceiling is set by the caller from what the settings and the glyphs need, so
 * the row can never push the cog off the edge of the figure; and its trailing
 * edge fades, so a name cut in half says there is more to the right instead of
 * looking clipped. The scrollbar itself is hidden — inside a thirty pixel bar
 * it would take a fifth of the height and say nothing the fade does not.
 * @param scrolls - Whether the strip is at the rung that lets it scroll.
 * @param maxWidth - The most it may take, in pixels.
 * @returns The box's rules.
 */
export function projectionTabTrackStyle(
  scrolls: boolean,
  maxWidth: number,
): CSSProperties {
  if (!scrolls) return { display: 'flex', flexShrink: 0 };
  return {
    boxSizing: 'border-box',
    display: 'flex',
    minWidth: 0,
    maxWidth,
    paddingRight: PROJECTION_TRACK_FADE,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    maskImage: TRACK_FADE_MASK,
    WebkitMaskImage: TRACK_FADE_MASK,
  };
}

/**
 * How wide the strip's trailing edge fades over.
 *
 * The same run of pixels is kept clear after the last view as well, so a
 * reader scrolled to the end of the strip is not shown its last name fading
 * out — which would say there is more when there is not.
 */
const PROJECTION_TRACK_FADE = 14;

const TRACK_FADE_MASK = `linear-gradient(to right, black calc(100% - ${PROJECTION_TRACK_FADE}px), transparent)`;

/**
 * Where a scrolling strip has to sit for the view in force to be read.
 *
 * A view wider than the strip itself is shown from its start rather than its
 * end: on the narrowest figures the name in force does not fit at all, and a
 * reader shown its last three letters cannot tell which view they are on.
 * @param left - The view's left edge inside the strip.
 * @param right - Its right edge.
 * @param scrollLeft - Where the strip is scrolled to now.
 * @param clientWidth - How much of the strip is in sight.
 * @returns Where it should be scrolled to; unchanged when the view is in sight.
 */
export function projectionTabScroll(
  left: number,
  right: number,
  scrollLeft: number,
  clientWidth: number,
): number {
  const room = clientWidth - PROJECTION_TRACK_FADE;
  if (right - left >= room || left < scrollLeft) return left;
  if (right > scrollLeft + room) return right - room;
  return scrollLeft;
}

/**
 * The settings at the far end of the bar.
 *
 * They never shrink. A flex row hands its shrinkage out in proportion to what
 * each side asked for, which would take pixels off a chip that is already the
 * shortest honest way to write the configuration — so the strip of views is
 * the one thing that gives, and it gives by scrolling rather than by clipping.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The end's rules.
 */
export function projectionBarEndStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: metrics.gap,
  };
}

/**
 * The figure's own explanation, once it has folded in behind the cog.
 *
 * On the narrowest figures the question mark is the glyph that goes, because
 * the reader still has to be able to reach the settings and the second tier —
 * so the paragraph it used to open is written at the head of the panel the cog
 * opens instead. Not one word of it is dropped in the move.
 *
 * It brings its own room and its own hairline, because the panel under it
 * brings both of those and the popover holding the two brings neither: a
 * paragraph flush against the edge of a card reads as a rendering fault, and
 * one running straight into a panel header reads as part of the header.
 *
 * The band and the measure are two rules rather than one. Capping the band
 * itself would stop its hairline short of both edges of a panel wider than the
 * cap, which reads as a mis-drawn line rather than as a division — so the band
 * takes the panel's width and the sentence inside it is what is held to a
 * readable measure.
 * @param metrics - The measurements the chrome is drawn from.
 * @returns The band's rules.
 */
export function projectionFoldedCaptionStyle(
  metrics: OverlayMetrics,
): CSSProperties {
  return {
    padding: `${metrics.gap + 5}px ${metrics.gap + 8}px ${metrics.gap + 4}px`,
    borderBottom: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: metrics.labelSize + 1,
    lineHeight: 1.4,
    textWrap: 'pretty',
  };
}

/**
 * The sentence inside that band.
 *
 * Capped short of a wide panel, because a line running the full width of one
 * is a line the eye loses the start of on the way back from the end of it.
 */
export const PROJECTION_CAPTION_TEXT_STYLE = {
  margin: 0,
  maxWidth: 280,
} as const satisfies CSSProperties;
