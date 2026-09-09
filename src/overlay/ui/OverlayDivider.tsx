import type { ReactElement } from 'react';

import { overlayDividerStyle } from './overlayControlStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/**
 * A hairline between two clusters of controls.
 *
 * It is a real separator rather than a decorative line, so a reader moving
 * through the card with a screen reader is told where one group of controls
 * ends — which is the whole reason the line is there for everyone else.
 * @returns The rule.
 */
export function OverlayDivider(): ReactElement {
  const { metrics } = useOverlaySurface();

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      style={overlayDividerStyle(metrics)}
    />
  );
}
