import { useCallback, useMemo, useRef, useState } from 'react';

import type { ScreenPoints } from '../core/screenPoints.ts';
import { nearestPointIndex } from '../core/screenPoints.ts';

/** Where a hover card is placed, and what it is about. */
export interface HoverAnchor {
  /** Horizontal position to place the card against, in the plot's pixels. */
  x: number;
  /** Vertical position. */
  y: number;
  /** The row the card describes. */
  index: number;
  /** Whether the reader pinned it, which is what stops it following. */
  pinned: boolean;
}

/** What {@link usePointHover} needs. */
export interface PointHoverOptions {
  /** Where every point sits on screen. */
  points: ScreenPoints;
  /**
   * How far from the pointer a point still counts as aimed at, in pixels.
   * Wider than a dot: a reader aims at a cloud, not at three and a half
   * pixels, and a card that only appears on a direct hit reads as broken.
   * @default 12
   */
  radius?: number;
  /**
   * One entry per point, a zero meaning it cannot be hovered — which is how a
   * muted group stops answering for points the reader can barely see.
   * @default undefined — every point can be hovered
   */
  included?: Uint8Array;
  /**
   * Whether a click keeps the card open. Worth leaving on wherever the card
   * holds more than a line: an unpinned card follows the pointer, so a reader
   * moving towards a long list pushes it away and never reaches it.
   * @default true
   */
  pinnable?: boolean;
  /**
   * Called with the row under the pointer, or `-1`, whenever that changes.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called with the pinned row, or `-1` when the card is let go.
   * @default undefined
   */
  onPinChange?: (index: number) => void;
}

/** The point a card is about, and how the reader moves it. */
export interface PointHoverApi {
  /** The row the card describes: the pinned one, else the hovered one, else `-1`. */
  index: number;
  /** The row under the pointer, whether or not a card is pinned. */
  hovered: number;
  /** Whether the card is pinned. */
  pinned: boolean;
  /** Where to place the card, or `null` when there is nothing to place. */
  anchor: HoverAnchor | null;
  /** Report a pointer position, in the same space the points were measured in. */
  moveTo: (x: number, y: number) => void;
  /** Report the pointer leaving the figure. */
  leave: () => void;
  /** Pin the row under the pointer, or let a pinned card go. */
  togglePin: () => void;
  /** Pin a named row, anchored on the point itself — what a key press uses. */
  pin: (index: number) => void;
  /** Let the card go. */
  unpin: () => void;
}

/**
 * The point under the pointer, and the card that says everything about it.
 *
 * The nearest point within a radius rather than the one actually under the
 * pointer, because a scatter is aimed at with a hand and not with a pixel; the
 * search runs once per position reported, so give it positions that have
 * already been coalesced to a frame.
 *
 * Pinning is the part that matters for a card with a long list in it. An
 * unpinned card follows the pointer, so a reader moving to read it pushes it
 * away and the list can never be reached, let alone selected from. A pinned
 * card stops where it was and stays on the row it was about, while the hover
 * carries on underneath so the ring still tracks the pointer.
 * @param options - See {@link PointHoverOptions}.
 * @returns The hover. See {@link PointHoverApi}.
 */
export function usePointHover(options: PointHoverOptions): PointHoverApi {
  const {
    points,
    radius = DEFAULT_HOVER_RADIUS,
    included,
    pinnable = true,
    onHoverChange,
    onPinChange,
  } = options;

  const [hovered, setHovered] = useState(-1);
  const [position, setPosition] = useState<PointerPosition | null>(null);
  const [pinnedAnchor, setPinnedAnchor] = useState<HoverAnchor | null>(null);
  const hoveredRef = useRef(-1);

  const reportHover = useCallback(
    (index: number) => {
      if (hoveredRef.current === index) return;
      hoveredRef.current = index;
      setHovered(index);
      onHoverChange?.(index);
    },
    [onHoverChange],
  );

  const moveTo = useCallback(
    (x: number, y: number) => {
      setPosition({ x, y });
      reportHover(nearestPointIndex(points, x, y, radius, included));
    },
    [included, points, radius, reportHover],
  );

  const leave = useCallback(() => {
    setPosition(null);
    reportHover(-1);
  }, [reportHover]);

  const unpin = useCallback(() => {
    if (pinnedAnchor === null) return;
    setPinnedAnchor(null);
    onPinChange?.(-1);
  }, [onPinChange, pinnedAnchor]);

  const pin = useCallback(
    (index: number) => {
      const x = points.x[index];
      const y = points.y[index];
      if (x === undefined || y === undefined) return;
      setPinnedAnchor({ x, y, index, pinned: true });
      onPinChange?.(index);
    },
    [onPinChange, points],
  );

  const togglePin = useCallback(() => {
    if (!pinnable) return;
    if (pinnedAnchor !== null) {
      unpin();
      return;
    }
    const index = hoveredRef.current;
    if (index === -1 || position === null) return;
    setPinnedAnchor({ x: position.x, y: position.y, index, pinned: true });
    onPinChange?.(index);
  }, [onPinChange, pinnable, pinnedAnchor, position, unpin]);

  const anchor = useMemo<HoverAnchor | null>(() => {
    if (pinnedAnchor !== null) return pinnedAnchor;
    if (hovered === -1 || position === null) return null;
    return { x: position.x, y: position.y, index: hovered, pinned: false };
  }, [hovered, pinnedAnchor, position]);

  return {
    index: pinnedAnchor === null ? hovered : pinnedAnchor.index,
    hovered,
    pinned: pinnedAnchor !== null,
    anchor,
    moveTo,
    leave,
    togglePin,
    pin,
    unpin,
  };
}

/** How far a point may be from the pointer and still be the one meant. */
export const DEFAULT_HOVER_RADIUS = 12;

/** The last place the pointer was seen, in the points' own space. */
interface PointerPosition {
  /** Horizontal position, in pixels. */
  x: number;
  /** Vertical position, in pixels. */
  y: number;
}
