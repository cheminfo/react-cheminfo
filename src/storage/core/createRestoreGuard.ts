import {
  readStorageText,
  removeStorageEntry,
  writeStorageText,
} from '../../state/core/storageEntry.ts';

/** A guard against reopening, on every load, the work that crashed the page. */
export interface RestoreGuard {
  /**
   * Whether a restore of this id was begun and never finished: the page died
   * while showing it, so opening it again by itself would only crash again.
   */
  crashedOn: (id: string) => boolean;
  /** Say a restore of this id starts. */
  begin: (id: string) => void;
  /** Say the restored work is on screen and the page survived it. */
  finish: (id: string) => void;
}

/**
 * Mark each restore in `localStorage` while it runs. A page that reopens the
 * last work on load asks `crashedOn` first, and offers that work in a list
 * instead of opening it — opening it from there begins and finishes a restore
 * of its own, which clears the mark.
 *
 * Best effort: where storage is refused, nothing ever reads as crashed.
 * @param scope - Names the marks, e.g. `draw:drafts`.
 * @returns The guard.
 */
export function createRestoreGuard(scope: string): RestoreGuard {
  const keyOf = (id: string) => `${scope}:restoring:${id}`;
  return {
    crashedOn: (id) => readStorageText(keyOf(id)) !== null,
    begin: (id) => {
      writeStorageText(keyOf(id), String(Date.now()));
    },
    finish: (id) => {
      removeStorageEntry(keyOf(id));
    },
  };
}
