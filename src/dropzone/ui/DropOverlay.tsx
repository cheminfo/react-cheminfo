import { Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { DropHandlers } from './useDropTarget.ts';

/** What {@link DropOverlay} needs. */
export interface DropOverlayProps {
  /** What the overlay says. */
  label: string;
  /** The overlay handlers of `useDropTarget`. */
  handlers: DropHandlers;
}

/**
 * The veil a drop target raises while a file or text is dragged over it. Its
 * test id is the one the family's end-to-end tests have always found it by.
 * @param props - See {@link DropOverlayProps}.
 * @returns The overlay.
 */
export function DropOverlay(props: DropOverlayProps): ReactElement {
  const { label, handlers } = props;
  return (
    <div data-testid="structure-drop-overlay" style={OVERLAY} {...handlers}>
      {/* Nothing inside takes the pointer, so leaving the overlay is the only
          dragleave it hears. */}
      <Icon icon="import" size={28} style={PASSIVE} />
      <span style={PASSIVE}>{label}</span>
    </div>
  );
}

const OVERLAY: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  border: '2px dashed var(--accent)',
  borderRadius: 'inherit',
  background: 'color-mix(in oklab, var(--accent) 10%, rgb(255 255 255 / 88%))',
  color: 'var(--accent)',
  fontSize: 14,
  fontWeight: 600,
};

const PASSIVE: CSSProperties = { pointerEvents: 'none' };
