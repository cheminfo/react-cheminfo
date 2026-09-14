/** How the last copy went: taken by the clipboard, or refused. */
type CopyOutcome = 'copied' | 'failed';

/** What a copy leaves on screen for a moment. */
export interface CopyFeedbackState {
  /** How the last copy went, or `undefined` once its moment has passed. */
  outcome: CopyOutcome | undefined;
  /** The key the last copy was made under, so one entry of several shows it. */
  key: string | undefined;
}

/** The state before anything was copied, and after the confirmation fades. */
export const IDLE_COPY_FEEDBACK: CopyFeedbackState = {
  outcome: undefined,
  key: undefined,
};

/** The timer behind a copy confirmation. */
export interface CopyFeedback {
  /**
   * Show how a copy went, replacing whatever was shown, for `resetAfter`.
   * @param written - Whether the clipboard took it.
   * @param key - Which of several copy actions it was.
   */
  announce: (written: boolean, key?: string) => void;
  /**
   * Stop the timer for good and clear an outcome still shown; later
   * announcements show nothing.
   */
  dispose: () => void;
}

/**
 * The confirmation a copy leaves behind, and the one timer that clears it.
 *
 * Kept apart from React so every copy action of the family — a button, a
 * citation menu entry, a row of notations — confirms for the same time and
 * leaves no timer behind once its component is gone.
 * @param resetAfter - How long an outcome is shown, in milliseconds.
 * @param onChange - Called with each new state.
 * @returns The controller.
 */
export function createCopyFeedback(
  resetAfter: number,
  onChange: (state: CopyFeedbackState) => void,
): CopyFeedback {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  return {
    announce: (written, key) => {
      if (disposed) return;
      clearTimeout(timer);
      onChange({ outcome: written ? 'copied' : 'failed', key });
      timer = setTimeout(() => {
        timer = undefined;
        onChange(IDLE_COPY_FEEDBACK);
      }, resetAfter);
    },
    dispose: () => {
      disposed = true;
      if (timer === undefined) return;
      clearTimeout(timer);
      timer = undefined;
      onChange(IDLE_COPY_FEEDBACK);
    },
  };
}
