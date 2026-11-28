/**
 * The two pieces every page keeping drafts writes around its session: the
 * signals a drafts list reads, and a synchronous way to keep the document
 * from an effect that must hand back its stop at once.
 */

import type { Cell } from '../../state/core/cells.ts';

import type { DraftSession, DraftStatus } from './draftSessionTypes.ts';

/** How {@link DraftSession.keep} starts keeping the document. */
export interface KeepDraftOptions {
  /**
   * Whether the address opened something a link asked for, such as an
   * example, which the last work must not replace.
   */
  linked: boolean;
  /**
   * Whether the page is framed in another, where nothing is kept.
   * @default false
   */
  framed?: boolean;
  /**
   * What runs before the session starts, such as taking in a draft kept the
   * way the site kept it before. A failure does not stop the drafts.
   * @default nothing runs
   */
  before?: () => Promise<void>;
}

/**
 * The signals a drafts list reads, made from the site's own `signal`.
 * @param signal - `signal` from the site's copy of `@preact/signals-react`.
 * @returns Whether drafts are kept, whether the last work is back, and a
 * counter bumped when the drafts change.
 */
export function createDraftStatus(
  signal: <T>(value: T) => Cell<T>,
): DraftStatus {
  return {
    available: signal<boolean | undefined>(undefined),
    settled: signal(false),
    version: signal(0),
  };
}

/**
 * Start a session and hand back its stop at once. Stopping before the start
 * resolves stops the session as soon as it has started.
 * @param start - The session's `start`.
 * @param options - Whether a link opened the page, whether it is framed, and
 * what runs first.
 * @returns The function that stops keeping the document.
 */
export function keepStarted(
  start: DraftSession['start'],
  options: KeepDraftOptions,
): () => void {
  const { linked, framed = false, before } = options;
  if (framed) return () => undefined;
  let stopped = false;
  let stop: (() => void) | undefined;
  const ready = before ? before().catch(() => undefined) : Promise.resolve();
  void ready
    .then(() => start({ linked }))
    .then((started) => {
      if (stopped) started();
      else stop = started;
    });
  return () => {
    stopped = true;
    stop?.();
  };
}
