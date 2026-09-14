/**
 * What either shape of a bar of controls is handed.
 *
 * A bar has two shapes that share almost everything and agree on nothing about
 * how they sit — a card floating in a corner of the figure, and a strip
 * spanning the width above it — so what they have in common is written here
 * once and each of them is left free to lay itself out.
 */

import type { IconName } from '@blueprintjs/core';
import type { ReactNode } from 'react';

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
