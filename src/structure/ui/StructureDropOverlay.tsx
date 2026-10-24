import { Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { DropHandlers } from './useStructureDrop.ts';

/** What {@link StructureDropOverlay} needs. */
export interface StructureDropOverlayProps {
  /** What the overlay says. */
  label: string;
  /** The overlay handlers of `useStructureDrop`. */
  handlers: DropHandlers;
}

/**
 * The veil a drop target raises while a file or text is dragged over it.
 * @param props - See {@link StructureDropOverlayProps}.
 * @returns The overlay.
 */
export function StructureDropOverlay(
  props: StructureDropOverlayProps,
): ReactElement {
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
