import type { ReactElement, ReactNode } from 'react';
import { useRef } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { placeOverlayCard } from '../../overlay/core/placeOverlayCard.ts';

import { parallelTooltipStyle } from './parallelStyles.ts';

/** What {@link ParallelTooltip} shows, and where. */
export interface ParallelTooltipProps {
  /** Where the pointer is, in pixels from the figure's left edge. */
  x: number;
  /** Where it is, in pixels from its top edge. */
  y: number;
  /** Width of the figure, so the card is flipped rather than clipped. */
  boxWidth: number;
  /** Its height. */
  boxHeight: number;
  /** What the card says, written by the caller. */
  children: ReactNode;
}

/**
 * The card over the row under the pointer.
 *
 * It measures itself and flips rather than being clipped, because a card that
 * runs off the bottom right of a figure is exactly where a reader points last
 * — and it never takes the pointer, so moving towards it never dismisses it by
 * moving off the line underneath.
 * @param props - See {@link ParallelTooltipProps}.
 * @returns The card.
 */
export function ParallelTooltip(props: ParallelTooltipProps): ReactElement {
  const { x, y, boxWidth, boxHeight, children } = props;
  const card = useRef<HTMLDivElement>(null);
  const size = useContainerSize(card);
  const placed = placeOverlayCard({
    pointerX: x,
    pointerY: y,
    cardWidth: size.width,
    cardHeight: size.height,
    boxWidth,
    boxHeight,
  });

  return (
    <div
      ref={card}
      className="parallel-coordinates-tooltip"
      style={parallelTooltipStyle(placed.left, placed.top)}
    >
      {children}
    </div>
  );
}
