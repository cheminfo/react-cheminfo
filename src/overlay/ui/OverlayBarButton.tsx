import type { IconName, PopoverNextPlacement } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { OverlayPlacement } from '../core/overlayPlacement.ts';

import { OverlayIconButton } from './OverlayIconButton.tsx';
import { overlayPanelStyle } from './overlayStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayBarButton} opens. */
export interface OverlayBarButtonProps {
  /**
   * The controls it holds: whatever has folded away, then the second tier —
   * everything an expert changes and a reader never does.
   */
  children: ReactNode;
  /** Where the bar sits, which is what decides the way the panel opens. */
  placement: OverlayPlacement;
  /** What the button is called, for the pointer and for a screen reader. */
  label: string;
  /** Its glyph. */
  icon: IconName;
  /**
   * Whether the panel is drawn with the card's own padding around it. Turn it
   * off for an {@link OverlayPanel}, which brings its own: nested inside a
   * padded surface a panel's header rule stops short of both edges and reads
   * as a mis-drawn line rather than as a header.
   * @default true
   */
  padded?: boolean;
}

/**
 * The button at the end of a bar, and the panel behind it.
 *
 * Both shapes of bar draw this one, so a reader who has opened the controls of
 * a floating card knows where the controls of an embedded figure are. It is
 * the domain's own icon button rather than a general one, which is what keeps
 * it the same weight of ink as the glyph beside it and lets it say, while the
 * panel is open, that it is the thing holding the panel open.
 * @param props - See {@link OverlayBarButtonProps}.
 * @returns The button and its panel.
 */
export function OverlayBarButton(props: OverlayBarButtonProps): ReactElement {
  const { children, placement, label, icon, padded = true } = props;
  const { metrics } = useOverlaySurface();
  const [open, setOpen] = useState(false);

  return (
    <PopoverNext
      placement={POPOVER_PLACEMENTS[placement]}
      onInteraction={(next) => setOpen(next)}
      content={
        padded ? (
          <div style={overlayPanelStyle(metrics)}>{children}</div>
        ) : (
          <>{children}</>
        )
      }
    >
      <OverlayIconButton icon={icon} label={label} active={open} opensMenu />
    </PopoverNext>
  );
}

/**
 * Which way the panel opens, per placement.
 *
 * Away from the nearest edge in both axes, so the panel that opens is never
 * the thing that pushes the reader's attention off the figure. A docked bar
 * opens over the figure, which is the only direction it has.
 */
const POPOVER_PLACEMENTS: Record<OverlayPlacement, PopoverNextPlacement> = {
  'top-left': 'bottom-start',
  'top-right': 'bottom-end',
  'bottom-left': 'top-start',
  'bottom-right': 'top-end',
  above: 'bottom-end',
  below: 'top-end',
  stretch: 'bottom-end',
};
