import type { ReactElement } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { OverlayBarButton } from './OverlayBarButton.tsx';
import {
  overlayBarGlyphsStyle,
  overlayBarGroupStyle,
  overlayBarSideStyle,
  overlayBarStartStyle,
} from './overlayBarRowStyles.ts';
import type { OverlayBarShapeProps } from './overlayBarShape.ts';
import { naturalRowWidth } from './overlayBarWidths.ts';
import {
  overlayBarContentStyle,
  overlayBarGroundStyle,
  overlayBarRestStyle,
  overlayCardStyle,
} from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/**
 * The bar that spans the width of the figure: the settings from the left edge,
 * the glyphs — help, saving, the button the rest folds into — at the right.
 *
 * It is in the flow above the picture rather than on it, and its ground is
 * solid rather than translucent, because a strip reaching from one edge of the
 * figure to the other is chrome the picture is mounted in — a floating card
 * that wide would cover the very data it is there to explain.
 *
 * What folds when the figure is too narrow is the far end alone: the start
 * holds the strip a reader moves between views with, and a reader who cannot
 * leave the view they are on is stuck rather than merely short of options.
 * The far end folds when the bar is told to, and a bar left to fold on its
 * own (`foldsWhenCrowded`) also folds it as soon as the row no longer holds
 * every control at its own width, measured. The glyphs never give up their
 * width, so nothing is ever drawn over the start: a start wider than what is
 * left of the row wraps its controls onto a second line.
 * @param props - See {@link OverlayBarShapeProps}.
 * @returns The bar.
 */
export function OverlayBarStrip(props: OverlayBarShapeProps): ReactElement {
  const { children, end, tools, info, more, placement, label } = props;
  const { moreIcon, morePadded, folded, testId, rest = 'visible' } = props;
  const { foldsWhenCrowded = false } = props;
  const { metrics, awake, width } = useOverlaySurface();
  const start = useRef<HTMLDivElement>(null);
  const ending = useRef<HTMLDivElement>(null);
  const glyphs = useRef<HTMLDivElement>(null);
  // The row's own width without its far end, and the far end's, measured
  // while it was last in the row.
  const [needs, setNeeds] = useState({ row: 0, end: 0 });
  const crowded =
    foldsWhenCrowded &&
    end !== undefined &&
    width > 0 &&
    needs.row + needs.end > width;
  const isFolded = folded || crowded;

  useLayoutEffect(() => {
    // Only a bar left to fold on its own reads its row.
    if (!foldsWhenCrowded) return;
    // A bar with nothing behind its button draws it only while folded: the
    // row it would unfold into has no room to keep for it.
    const foldOnly =
      more === undefined && isFolded ? glyphs.current?.lastElementChild : null;
    const row =
      naturalRowWidth(
        [start.current, glyphs.current],
        metrics.gap,
        metrics.paddingX,
      ) -
      (foldOnly instanceof HTMLElement
        ? foldOnly.offsetWidth + metrics.gap
        : 0);
    const far = isFolded
      ? needs.end
      : naturalRowWidth([ending.current], metrics.gap, 0) + metrics.gap;
    if (row !== needs.row || far !== needs.end) {
      setNeeds({ row, end: far });
    }
    // Measured again whenever what the bar holds or the room it has changes.
  }, [
    children,
    end,
    tools,
    info,
    more,
    isFolded,
    foldsWhenCrowded,
    width,
    metrics.gap,
    metrics.paddingX,
    needs.end,
    needs.row,
  ]);

  const opens = more !== undefined || (isFolded && end !== undefined);

  return (
    <div style={overlayCardStyle(placement, metrics)} data-testid={testId}>
      <div style={overlayBarGroundStyle(rest, awake)} />
      <div
        style={{
          ...overlayBarContentStyle(metrics),
          ...overlayBarRestStyle(rest, awake),
        }}
      >
        {children === null || children === undefined ? null : (
          <div ref={start} style={overlayBarStartStyle(metrics)}>
            {children}
          </div>
        )}
        <div
          role="group"
          aria-label={label}
          style={overlayBarGroupStyle(metrics)}
        >
          <div ref={ending} style={overlayBarSideStyle(metrics)}>
            {isFolded ? null : end}
          </div>
          <div ref={glyphs} style={overlayBarGlyphsStyle(metrics)}>
            {tools}
            {info}
            {opens ? (
              <OverlayBarButton
                placement={placement}
                label={label}
                icon={moreIcon}
                padded={morePadded}
              >
                {isFolded ? end : null}
                {more}
              </OverlayBarButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
