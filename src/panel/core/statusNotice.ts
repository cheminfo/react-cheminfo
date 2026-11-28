/**
 * What an editor's status line says for a few seconds in place of its hint:
 * the sentence a save, an open or a refusal leaves, and whether it says that
 * something went wrong. The same twelve lines every editor wrote around its
 * own timer, kept on the site's own signal.
 */

import type { Cell } from '../../state/core/cells.ts';

/** A sentence the status line shows in place of its hint. */
export interface StatusNotice {
  /** The sentence. */
  text: string;
  /** Whether it says that something went wrong, drawn in `--danger`. */
  danger: boolean;
}

/** What {@link createStatusNotice} is given. */
export interface StatusNoticeOptions {
  /** The site's signal the status line reads; null shows the hint. */
  notice: Cell<StatusNotice | null>;
  /**
   * How long a sentence stays, in milliseconds.
   * @default 6000
   */
  duration?: number;
}

/** Says something in the status line, for a while. */
export type SayInStatusLine = (
  text: string,
  intent?: 'success' | 'danger',
) => void;

/**
 * The `say` of an editor: it writes a sentence into the status line's signal
 * and takes it away after `duration`, a later sentence replacing an earlier
 * one and restarting the wait. It is the `notify` the draft session, the
 * saver and the folder panel are given.
 * @param options - See {@link StatusNoticeOptions}.
 * @returns `say(text, intent)`.
 */
export function createStatusNotice(
  options: StatusNoticeOptions,
): SayInStatusLine {
  const { notice, duration = 6000 } = options;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (text, intent) => {
    clearTimeout(timer);
    notice.value = { text, danger: intent === 'danger' };
    timer = setTimeout(() => {
      notice.value = null;
    }, duration);
  };
}
