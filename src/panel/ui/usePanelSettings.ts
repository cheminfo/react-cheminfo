import { useState } from 'react';

/** How {@link usePanelSettings} reads a panel's settings and puts them back. */
export interface PanelSettingsValues<T> {
  /** The settings as they are now, read when the panel turns to them. */
  read: () => T;
  /**
   * Put the settings back as they were read, when the changes are cancelled.
   * @param values - What {@link PanelSettingsValues.read} returned.
   */
  restore: (values: T) => void;
}

/** Whether a panel shows its settings, and the three ways to move between. */
export interface PanelSettings {
  /** Whether the panel shows its settings in place of its content. */
  isOpen: boolean;
  /** Turn the panel to its settings, remembering them as they are. */
  onOpen: () => void;
  /** Keep the settings as they were changed, and go back to the content. */
  onConfirm: () => void;
  /** Put the settings back as they were opened, and go back to the content. */
  onCancel: () => void;
}

/**
 * A panel turned over to its settings and back, the way a panel's gear does
 * it on every site: the settings change as they are set, so the panel shows
 * what a choice does before it is kept; confirming keeps them, cancelling puts
 * back what they were when the panel turned to them.
 *
 * Spread the result over a `<PanelSettingsButton>`, and show the settings
 * while `isOpen`. A panel closed with its settings open keeps them as they
 * were changed.
 * @param values - How the settings are read and put back.
 * @returns Whether they are open, and the handlers of the button.
 */
export function usePanelSettings<T>(
  values: PanelSettingsValues<T>,
): PanelSettings {
  const [opened, setOpened] = useState<{ values: T } | null>(null);
  return {
    isOpen: opened !== null,
    onOpen: () => {
      setOpened({ values: values.read() });
    },
    onConfirm: () => {
      setOpened(null);
    },
    onCancel: () => {
      if (opened) values.restore(opened.values);
      setOpened(null);
    },
  };
}
