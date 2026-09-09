import type { ReactElement } from 'react';

import { OverlayBarButton } from './OverlayBarButton.tsx';
import type { OverlayBarShapeProps } from './overlayBarShape.ts';
import {
  OVERLAY_BAR_GROUND_STYLE,
  overlayBarContentStyle,
  overlayBarSideStyle,
  overlayCardStyle,
} from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/**
 * The bar that spans the width of the figure, its two ends pushed apart.
 *
 * It is in the flow above the picture rather than on it, and its ground is
 * solid rather than translucent, because a strip reaching from one edge of the
 * figure to the other is chrome the picture is mounted in — a floating card
 * that wide would cover the very data it is there to explain.
 *
 * What folds when the figure is too narrow is the far end alone: the start
 * holds the strip a reader moves between views with, and a reader who cannot
 * leave the view they are on is stuck rather than merely short of options.
 * @param props - See {@link OverlayBarShapeProps}.
 * @returns The bar.
 */
export function OverlayBarStrip(props: OverlayBarShapeProps): ReactElement {
  const { children, end, tools, info, more, placement, label } = props;
  const { moreIcon, morePadded, folded, testId } = props;
  const { metrics } = useOverlaySurface();

  const opens = more !== undefined || (folded && end !== undefined);

  return (
    <div style={overlayCardStyle(placement, metrics)} data-testid={testId}>
      <div style={OVERLAY_BAR_GROUND_STYLE} />
      <div style={overlayBarContentStyle(metrics)}>
        <div style={overlayBarSideStyle(metrics)}>{children}</div>
        <div
          role="group"
          aria-label={label}
          style={overlayBarSideStyle(metrics)}
        >
          {folded ? null : end}
          {tools}
          {info}
          {opens ? (
            <OverlayBarButton
              placement={placement}
              label={label}
              icon={moreIcon}
              padded={morePadded}
            >
              {folded ? end : null}
              {more}
            </OverlayBarButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
