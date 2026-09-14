import { useMemo, useState } from 'react';

/** The four handlers that keep an overlay control's pointer and focus state. */
interface OverlayInteractionHandlers {
  /** The pointer arrived over the control. */
  onPointerEnter: () => void;
  /** The pointer left it. */
  onPointerLeave: () => void;
  /** The keyboard, or a press, moved focus onto it. */
  onFocus: () => void;
  /** Focus left it. */
  onBlur: () => void;
}

/** Whether a control is pointed at and whether it holds focus. */
interface OverlayInteraction {
  /** Whether the pointer is over it. */
  hovered: boolean;
  /** Whether it holds focus. */
  focused: boolean;
  /** Spread onto the control's own element. */
  handlers: OverlayInteractionHandlers;
}

/**
 * The pointer and focus state every button of a floating bar draws from.
 *
 * Kept as two separate answers rather than one "lit" flag, because a reader
 * tabbing through a bar has to be shown a ring where the focus is, and a
 * control that looks merely hovered under the keyboard tells them nothing.
 * @returns The state, and the handlers that keep it.
 */
export function useOverlayInteraction(): OverlayInteraction {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const handlers = useMemo<OverlayInteractionHandlers>(
    () => ({
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    [],
  );
  return { hovered, focused, handlers };
}
