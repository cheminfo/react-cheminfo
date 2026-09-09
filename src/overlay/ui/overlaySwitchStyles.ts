/**
 * The rules a switch is drawn with.
 *
 * A panel's booleans are the settings whose state has to be readable without
 * touching them: `One scale for all` drawn as a grey chip answers the reader's
 * only question about it — is it on? — with nothing at all. So on and off are
 * said twice over, by the colour of the track and by which end the knob is at,
 * and the target the reader aims at is kept larger than the switch they see.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/** Every measurement a switch is drawn from. */
export interface OverlaySwitchTrack {
  /** Width of the track, in pixels. */
  width: number;
  /** Height of the track, in pixels. */
  height: number;
  /** Side of the knob, in pixels. */
  knob: number;
  /** Room between the knob and the edge of the track, in pixels. */
  inset: number;
  /** How far the knob slides when it is turned on, in pixels. */
  travel: number;
}

/**
 * How big a switch is drawn.
 *
 * Three quarters of a control's height, held even so that the knob is centred
 * on a whole pixel, and half again as wide as it is tall — thirty by eighteen
 * at the compact size. It follows the control height rather than a constant,
 * which is what makes it grow with everything else on a phone: a switch a
 * finger cannot hit is a setting that cannot be changed.
 * @param metrics - The measurements the card is drawn from.
 * @returns The switch's measurements.
 */
export function overlaySwitchTrack(
  metrics: OverlayMetrics,
): OverlaySwitchTrack {
  const height = Math.round((metrics.controlHeight * 0.75) / 2) * 2;
  const width = Math.round((height * 5) / 3);
  const inset = 2;
  const knob = height - inset * 2;
  return { width, height, knob, inset, travel: width - knob - inset * 2 };
}

/**
 * The button a switch is, which is bigger than the switch drawn on it.
 *
 * The track is eighteen pixels tall and the target is the card's full control
 * height, so the thing the reader aims at is forty pixels on a phone even
 * though the thing they see never grows past thirty.
 * @param metrics - The measurements the card is drawn from.
 * @param track - The switch's measurements.
 * @param disabled - Whether it cannot be pressed.
 * @returns The button's rules.
 */
export function overlaySwitchStyle(
  metrics: OverlayMetrics,
  track: OverlaySwitchTrack,
  disabled: boolean,
): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: track.width,
    height: metrics.controlHeight,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };
}

/**
 * The track a switch's knob sits in.
 *
 * On and off are told apart by the ground rather than by the position of the
 * knob alone, because a fourteen-pixel dot twelve pixels to the left of where
 * it was is not a difference anybody reads across a panel of six settings.
 * @param track - The switch's measurements.
 * @param checked - Whether it is on.
 * @returns The track's rules.
 */
export function overlaySwitchTrackStyle(
  track: OverlaySwitchTrack,
  checked: boolean,
): CSSProperties {
  return {
    position: 'relative',
    display: 'inline-block',
    width: track.width,
    height: track.height,
    borderRadius: 999,
    background: checked ? 'var(--accent)' : 'var(--border-strong)',
    transition: `background ${OVERLAY_SWITCH_TRANSITION}ms ease`,
  };
}

/**
 * The knob a switch slides.
 *
 * It slides rather than jumping, so the reader who pressed it sees which of
 * the two ends it went to instead of only finding the panel changed.
 * @param track - The switch's measurements.
 * @param checked - Whether it is on.
 * @returns The knob's rules.
 */
export function overlaySwitchKnobStyle(
  track: OverlaySwitchTrack,
  checked: boolean,
): CSSProperties {
  return {
    position: 'absolute',
    top: track.inset,
    left: checked ? track.inset + track.travel : track.inset,
    width: track.knob,
    height: track.knob,
    borderRadius: '50%',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-sm)',
    transition: `left ${OVERLAY_SWITCH_TRANSITION}ms ease`,
  };
}

/**
 * How long the knob takes to cross.
 *
 * Long enough to be seen as a movement and short enough that a reader turning
 * three settings on in a row never waits for the animation.
 */
const OVERLAY_SWITCH_TRANSITION = 150;
