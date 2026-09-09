import type { ReactElement } from 'react';

import { OverlayBarButton } from './OverlayBarButton.tsx';
import type { OverlayBarShapeProps } from './overlayBarShape.ts';
import {
  overlayCardStyle,
  overlayContentStyle,
  overlayGroundStyle,
  overlayRestingOpacity,
} from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayBarCard} needs on top of the shape both bars share. */
export interface OverlayBarCardProps extends OverlayBarShapeProps {
  /** How opaque the ground is while nothing is pointing at the figure. */
  restingOpacity: number;
}

/**
 * The small card of controls floating in a corner of a figure.
 *
 * It rests at three quarters strength and wakes when the pointer reaches the
 * figure or the keyboard reaches one of its controls; only the ground fades,
 * never the text, and the tab order is the same whether it is resting or
 * awake, so the fade is a courtesy to the eye and never a gate on the
 * interaction.
 *
 * Folded, it is the button alone: a card has only the one tier, and a corner
 * of a narrow figure is not somewhere half a strip of controls can live — the
 * tools fold away with the controls, since what they act on is the very figure
 * the card would then be covering.
 * @param props - See {@link OverlayBarCardProps}.
 * @returns The card.
 */
export function OverlayBarCard(props: OverlayBarCardProps): ReactElement {
  const { children, end, tools, info, more, placement, label } = props;
  const { moreIcon, morePadded, folded, testId, restingOpacity } = props;
  const { metrics, awake, busy } = useOverlaySurface();

  const opener =
    folded || more !== undefined ? (
      <OverlayBarButton
        placement={placement}
        label={label}
        icon={moreIcon}
        padded={morePadded}
      >
        {folded ? children : null}
        {more}
      </OverlayBarButton>
    ) : null;

  return (
    <div style={overlayCardStyle(placement, metrics)} data-testid={testId}>
      <div
        style={overlayGroundStyle(
          awake ? 1 : overlayRestingOpacity(restingOpacity),
          busy,
        )}
      />
      {folded ? (
        <div style={overlayContentStyle(metrics)}>{opener}</div>
      ) : (
        <div
          role="group"
          aria-label={label}
          style={overlayContentStyle(metrics)}
        >
          {children}
          {end}
          {tools}
          {info}
          {opener}
        </div>
      )}
    </div>
  );
}
