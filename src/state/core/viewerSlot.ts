/**
 * Where a viewer is, as the site reaches it from outside its page: a figure
 * handed to a host or saved writes down what the viewer on screen holds, and a
 * figure opened again is put back into the viewer once it opens.
 */

/** What a viewer's ref is: React's `RefObject`, or anything holding one. */
export interface HandleRef<THandle> {
  /** The handle, once the viewer has opened. */
  readonly current: THandle | null;
}

/** One viewer's slot. */
export interface ViewerSlot<THandle, TPending> {
  /**
   * Say where the viewer is, for as long as its page is on screen.
   * @param ref - The ref the viewer fills in.
   * @returns What forgets it again, for an effect's clean-up.
   */
  register: (ref: HandleRef<THandle>) => () => void;
  /**
   * The viewer, when its page is on screen and it is open.
   * @returns Its handle, or `null`.
   */
  current: () => THandle | null;
  /**
   * Keep what the viewer is to show once it opens, beside what it opens on.
   * @param pending - Where it stood and how it read what it shows.
   */
  keep: (pending: TPending) => void;
  /**
   * Take what the viewer is to show, once: the viewer that opens next shows
   * it, and the one after shows its own.
   * @returns What was kept for it, or `null`.
   */
  take: () => TPending | null;
}

/**
 * The slot of one viewer; a site with a viewer per tab makes one per tab.
 * @returns The slot.
 */
export function createViewerSlot<THandle, TPending>(): ViewerSlot<
  THandle,
  TPending
> {
  let ref: HandleRef<THandle> | null = null;
  let pending: TPending | null = null;
  return {
    register(next) {
      ref = next;
      return () => {
        if (ref === next) ref = null;
      };
    },
    current: () => ref?.current ?? null,
    keep(next) {
      pending = next;
    },
    take() {
      const kept = pending;
      pending = null;
      return kept;
    },
  };
}
