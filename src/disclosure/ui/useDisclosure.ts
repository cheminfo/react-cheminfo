import { useCallback, useMemo, useState } from 'react';

/** Something that is either shown or not, and the three ways to change that. */
export interface Disclosure {
  /** Whether the thing is currently shown. */
  isOpen: boolean;
  /** Show it, whatever it was doing. */
  open: () => void;
  /** Hide it, whatever it was doing. */
  close: () => void;
  /** Show it when it is hidden, hide it when it is shown. */
  toggle: () => void;
}

/**
 * The open state of a dialog, a menu, a panel or a section.
 *
 * The three actions keep the same identity for the life of the component, so
 * passing `close` to a dialog or a keyboard handler does not re-subscribe it on
 * every render.
 * @param initialOpen - Whether it starts out shown.
 * @returns The state and the three actions.
 */
export function useDisclosure(initialOpen = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((shown) => !shown), []);

  return useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );
}
