import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';

import type { ElementSize } from '../../hooks/ui/useResizeObserver.ts';
import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import type { OverlayCardPlacementOptions } from '../core/placeOverlayCard.ts';
import { placeOverlayCard } from '../core/placeOverlayCard.ts';

/** Where a card is wanted: everything {@link placeOverlayCard} reads but the card's own size. */
export type MeasuredPlacementOptions = Omit<
  OverlayCardPlacementOptions,
  'cardWidth' | 'cardHeight'
>;

/** A card's element and where it goes. */
export interface MeasuredPlacement {
  /** The ref the card's element is handed through. */
  attach: (element: HTMLElement | null) => void;
  /**
   * Its `left` and `top` in the box it stays inside; until it has been
   * measured, drawn hidden at the box's corner, so its size can be read.
   */
  style: CSSProperties;
}

/** A card not measured yet: drawn where it does not show. */
const UNMEASURED: CSSProperties = { left: 0, top: 0, visibility: 'hidden' };

/**
 * Place a card by its size as drawn — never by a guess of its text's width,
 * which drifts with the fonts, the language and the numbers it writes: it is
 * drawn hidden once, measured (its border box), then placed beside its anchor
 * and flipped rather than cut at the box's edges (`placeOverlayCard`), and it
 * follows its size afterwards.
 * @param options - Where it is wanted, in the box's pixels.
 * @returns The ref to hand the card, and its style.
 */
export function useMeasuredPlacement(
  options: MeasuredPlacementOptions,
): MeasuredPlacement {
  return useMeasuredPlace((size) =>
    placeOverlayCard({
      ...options,
      cardWidth: size.width,
      cardHeight: size.height,
    }),
  );
}

/** Where a card of a measured size goes, in the box it stays inside. */
export type PlaceMeasuredCard = (size: ElementSize) => {
  left: number;
  top: number;
};

/**
 * Place a card by its size as drawn, by a rule of the caller's: the card is
 * drawn hidden once, measured (its border box), then put where `place` says
 * for that size, and it follows its size afterwards. `useMeasuredPlacement`
 * is this with the pointer's rule (`placeOverlayCard`); a card placed among
 * other marks — beside a node, clear of what it lights — brings its own.
 * @param place - Where a card of a size goes; read at every render.
 * @returns The ref to hand the card, and its style.
 */
export function useMeasuredPlace(place: PlaceMeasuredCard): MeasuredPlacement {
  const [card, setCard] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState<ElementSize | null>(null);
  const attach = useCallback((element: HTMLElement | null) => {
    setCard(element);
    if (element === null) setSize(null);
  }, []);
  useResizeObserver(
    card,
    (measured) => {
      // An element mid-teardown measures zero: not a size to place by.
      if (!(measured.width > 0) || !(measured.height > 0)) return;
      setSize((last) =>
        last?.width === measured.width && last.height === measured.height
          ? last
          : measured,
      );
    },
    { box: 'border-box' },
  );
  if (size === null) return { attach, style: UNMEASURED };
  const { left, top } = place(size);
  return { attach, style: { left, top } };
}
