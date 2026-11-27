import { useMemo, useState } from 'react';

/** The two handlers that keep an overlay control's pointer state. */
interface OverlayInteractionHandlers {
  /** The pointer arrived over the control. */
  onPointerEnter: () => void;
  /** The pointer left it. */
  onPointerLeave: () => void;
}

/** Whether a control is pointed at. */
interface OverlayInteraction {
  /** Whether the pointer is over it. */
  hovered: boolean;
  /** Spread onto the control's own element. */
  handlers: OverlayInteractionHandlers;
}

/**
 * The pointer state every button of a floating bar draws from. The focus
 * draws nothing: the family shows no focus ring, from the keyboard or not.
 * @returns The state, and the handlers that keep it.
 */
export function useOverlayInteraction(): OverlayInteraction {
  const [hovered, setHovered] = useState(false);
  const handlers = useMemo<OverlayInteractionHandlers>(
    () => ({
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
    }),
    [],
  );
  return { hovered, handlers };
}
