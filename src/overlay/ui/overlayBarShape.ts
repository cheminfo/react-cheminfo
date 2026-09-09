/**
 * Whether a bar of controls is folded, and what either shape of it is handed.
 *
 * A bar has two shapes that share almost everything and agree on nothing about
 * how they sit — a card floating in a corner of the figure, and a strip
 * spanning the width above it — so what they have in common is written here
 * once and each of them is left free to lay itself out.
 */

import type { IconName } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { shouldCollapseOverlay } from '../core/overlayCollapse.ts';
import type { OverlayPlacement } from '../core/overlayPlacement.ts';

/** What both shapes of a bar are drawn from, with every default resolved. */
export interface OverlayBarShapeProps {
  /** The controls at the start of the row. */
  children: ReactNode;
  /**
   * What sits at the far end of the row.
   * @default undefined — the end holds only the glyphs
   */
  end?: ReactNode;
  /**
   * The glyph-sized tools that act on the figure rather than change it.
   * @default undefined — the bar carries no tools
   */
  tools?: ReactNode;
  /**
   * The one control that never folds.
   * @default undefined — the bar carries no glyph
   */
  info?: ReactNode;
  /**
   * What waits behind the button.
   * @default undefined — nothing but whatever has folded away
   */
  more?: ReactNode;
  /** Where the bar sits. */
  placement: OverlayPlacement;
  /** What the group of controls is called. */
  label: string;
  /** Glyph of the button that opens the rest. */
  moreIcon: IconName;
  /** Whether that button's panel is drawn with the card's own padding. */
  morePadded: boolean;
  /** Whether the bar has folded its controls away behind that button. */
  folded: boolean;
  /**
   * Value of the `data-testid` attribute of the bar.
   * @default undefined
   */
  testId?: string;
}

/** What decides whether a bar is folded. */
export interface OverlayBarFoldOptions {
  /** What the caller asked for, when it is holding the fold itself. */
  collapsed: boolean | undefined;
  /** Whether the bar was asked to start folded. */
  startedFolded: boolean;
  /** Width of the figure, in pixels; `0` before it has been measured. */
  width: number;
  /** The width under which the bar folds on its own. */
  collapseBelow: number;
}

/**
 * Whether the bar is folded.
 *
 * A caller holding `collapsed` is obeyed outright, so a bar driven from
 * outside never argues with the figure's width; every other bar folds itself
 * once the figure is too narrow, or because it was asked to start that way.
 * @param options - See {@link OverlayBarFoldOptions}.
 * @returns Whether it is folded.
 */
export function overlayBarFolded(options: OverlayBarFoldOptions): boolean {
  const { collapsed, startedFolded, width, collapseBelow } = options;
  return (
    collapsed ?? (startedFolded || shouldCollapseOverlay(width, collapseBelow))
  );
}

/**
 * Tell the caller the bar folded itself.
 *
 * A caller holding `collapsed` already knows what it asked for; what it cannot
 * see is the figure crossing the breakpoint under a bar left to decide, so
 * that is the only thing reported. Whom to tell is read through a ref, so an
 * inline arrow may be passed on every render without the report firing again
 * for a fold that has not changed.
 * @param folded - Whether the bar is folded now.
 * @param onCollapsedChange - Who to tell, when there is anybody to tell.
 */
export function useFoldReport(
  folded: boolean,
  onCollapsedChange: ((collapsed: boolean) => void) | undefined,
): void {
  const tell = useRef(onCollapsedChange);
  const told = useRef(folded);

  useEffect(() => {
    tell.current = onCollapsedChange;
  });

  useEffect(() => {
    if (told.current === folded) return;
    told.current = folded;
    tell.current?.(folded);
  }, [folded]);
}
