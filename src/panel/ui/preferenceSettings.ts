import {
  hydrateSignalBucket,
  snapshotSignalBucket,
} from '../../state/core/signalBucket.ts';

import type { PanelSettingsValues } from './usePanelSettings.ts';

/** How {@link preferenceSettings} writes a tree back. */
export interface PreferenceSettingsOptions {
  /**
   * Runs the writes of one restore as one change, so what watches the tree
   * hears it once: `batch` from `@preact/signals-react`.
   * @default the writes run one after another
   */
  batch?: (callback: () => void) => void;
}

/**
 * How a panel's settings, kept in a tree of preferences, are read when the
 * panel turns to them and put back when their changes are cancelled.
 * @param bucket - The tree of preference signals the settings change.
 * @param options - How the tree is written back.
 * @returns What `usePanelSettings` reads and restores.
 */
export function preferenceSettings(
  bucket: object,
  options: PreferenceSettingsOptions = {},
): PanelSettingsValues<Record<string, unknown>> {
  const { batch = (callback: () => void) => callback() } = options;
  return {
    read: () => snapshotSignalBucket(bucket),
    restore: (values) => {
      batch(() => {
        hydrateSignalBucket(bucket, values);
      });
    },
  };
}
