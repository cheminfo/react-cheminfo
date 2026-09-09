import type { IconName } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { Button } from 'react-science/ui';

import type { OverlayControlProps } from './OverlayRow.tsx';
import { OverlayRow } from './OverlayRow.tsx';
import { overlaySwatchStyle } from './overlayControlStyles.ts';
import { useOverlayPanelShape } from './overlayPanelContext.ts';
import { useOverlaySurface } from './overlaySurface.ts';
import {
  overlaySwitchKnobStyle,
  overlaySwitchStyle,
  overlaySwitchTrack,
  overlaySwitchTrackStyle,
} from './overlaySwitchStyles.ts';

/** How a toggle is drawn. */
export type OverlayToggleAppearance = 'button' | 'switch';

/** What {@link OverlayToggle} needs. */
export interface OverlayToggleProps extends OverlayControlProps {
  /** Whether it is on. */
  checked: boolean;
  /** Called with the new state. */
  onChange: (checked: boolean) => void;
  /**
   * How it is drawn: a pressed button carrying its own words, or a switch
   * beside a name in a panel's control column.
   * @default `'switch'` inside an {@link OverlayPanel}, `'button'` anywhere else
   */
  appearance?: OverlayToggleAppearance;
  /**
   * Colour of the square in front of the caption. Give it the series' own
   * colour and a row of toggles becomes the figure's legend, each entry
   * showing and hiding what it names. Drawn by the button appearance alone.
   * @default undefined — no square is drawn
   */
  swatch?: string;
  /**
   * Blueprint glyph in front of the caption, for a toggle short of room. Drawn
   * by the button appearance alone.
   * @default undefined
   */
  icon?: IconName;
}

/**
 * One thing on the figure turned on and off.
 *
 * On a bar it is a pressed button, because the same control has to work as a
 * legend entry — a swatch and a series name that dim when the series is hidden
 * — and a checkbox beside a colour square reads as two separate claims about
 * one series. In a panel it is a switch, because a row of grey chips is a row
 * whose state cannot be read: `One scale for all` drawn as a chip answers the
 * reader's only question about it — is it on? — with nothing at all, and the
 * reader has to click it to find out.
 *
 * It stays a real `button` reporting `aria-pressed` in both appearances rather
 * than becoming a checkbox in one of them, since a control that reports its
 * state one way on a bar and another in a panel is a control a reader who
 * cannot see it has to learn twice. A native button is also operated by Space
 * and by Enter for nothing, where a checkbox built out of a `div` has to
 * reimplement both and usually gets one of them subtly wrong.
 *
 * A swatch takes the glyph's place when both are given, since the colour is
 * what ties the entry to a mark on the chart.
 * @param props - See {@link OverlayToggleProps}.
 * @returns The toggle.
 */
export function OverlayToggle(props: OverlayToggleProps): ReactElement {
  const {
    checked,
    onChange,
    label,
    help,
    hideLabel = false,
    disabled = false,
    testId,
    swatch,
    icon,
  } = props;
  const { metrics } = useOverlaySurface();
  const panel = useOverlayPanelShape();
  const appearance =
    props.appearance ?? (panel === undefined ? 'button' : 'switch');

  if (appearance === 'switch') {
    const track = overlaySwitchTrack(metrics);
    return (
      <OverlayRow
        label={label}
        help={help}
        hideLabel={hideLabel}
        disabled={disabled}
      >
        <button
          type="button"
          aria-pressed={checked}
          aria-label={label}
          disabled={disabled}
          data-testid={testId}
          style={overlaySwitchStyle(metrics, track, disabled)}
          onClick={() => onChange(!checked)}
        >
          <span style={overlaySwitchTrackStyle(track, checked)}>
            <span style={overlaySwitchKnobStyle(track, checked)} />
          </span>
        </button>
      </OverlayRow>
    );
  }

  return (
    <OverlayRow label={label} help={help} hideLabel disabled={disabled}>
      <Button
        variant="minimal"
        size={metrics.blueprintSize}
        active={checked}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={label}
        title={hideLabel ? label : undefined}
        icon={
          swatch === undefined ? (
            icon
          ) : (
            <span style={overlaySwatchStyle(swatch)} />
          )
        }
        text={hideLabel ? undefined : label}
        data-testid={testId}
        onClick={() => onChange(!checked)}
      />
    </OverlayRow>
  );
}
