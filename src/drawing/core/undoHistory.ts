/**
 * The undo history of an editor's document, kept on the site's own signals: a
 * change that is done is committed and can be undone, and a gesture shows the
 * document as it goes with `preview`, then commits once when it ends, so one
 * drag is one step back.
 */

import type { Cell, SignalTools } from '../../state/core/cells.ts';

/** What an undo history is kept on. */
export interface UndoHistoryOptions<D> {
  /** The document on screen: the site's own signal. */
  document: Cell<D>;
  /**
   * A counter the history moves at every step, so `canUndo` and `canRedo`,
   * read inside a `computed`, follow it.
   */
  steps: Cell<number>;
  /** `batch` from the site's signals, so a step is one change. */
  signals: Pick<SignalTools, 'batch'>;
  /**
   * Called once undo or redo has put a step on screen, in the same batch: a
   * site keeps there only the selection the step still holds.
   * @default nothing is called
   */
  shown?: (document: D) => void;
  /**
   * How many steps can be undone.
   * @default 200
   */
  limit?: number;
}

/** The undo history of a document. */
export interface UndoHistory<D> {
  /** Whether there is a step to undo; a `computed` reading it follows it. */
  canUndo: () => boolean;
  /** Whether there is a step to redo; a `computed` reading it follows it. */
  canRedo: () => boolean;
  /** Show a document while a gesture is under way, without making a step. */
  preview: (next: D) => void;
  /**
   * Commit a change.
   * @param next - The document after it.
   * @param before - What the step goes back to: the document a gesture
   * started from; the one on screen when omitted.
   */
  commit: (next: D, before?: D) => void;
  /** Put a document on screen with no history: a file opened, a draft back. */
  restart: (next: D) => void;
  /** Go back one step. */
  undo: () => void;
  /** Go forward again one step. */
  redo: () => void;
}

/**
 * Keep the undo history of a document.
 * @param options - The document, the step counter and the site's `batch`.
 * @returns The history.
 */
export function createUndoHistory<D>(
  options: UndoHistoryOptions<D>,
): UndoHistory<D> {
  const { document, steps, signals, shown, limit = 200 } = options;
  const past: D[] = [];
  const future: D[] = [];

  const step = () => {
    steps.value = steps.peek() + 1;
  };
  const showStep = (shownDocument: D) => {
    signals.batch(() => {
      document.value = shownDocument;
      shown?.(shownDocument);
      step();
    });
  };

  return {
    canUndo: () => steps.value >= 0 && past.length > 0,
    canRedo: () => steps.value >= 0 && future.length > 0,
    preview: (next) => {
      document.value = next;
    },
    commit: (next, before = document.peek()) => {
      signals.batch(() => {
        if (next !== before) {
          past.push(before);
          if (past.length > limit) past.shift();
          future.length = 0;
          step();
        }
        document.value = next;
      });
    },
    restart: (next) => {
      past.length = 0;
      future.length = 0;
      signals.batch(() => {
        document.value = next;
        step();
      });
    },
    undo: () => {
      const previous = past.pop();
      if (previous === undefined) return;
      future.push(document.peek());
      showStep(previous);
    },
    redo: () => {
      const next = future.pop();
      if (next === undefined) return;
      past.push(document.peek());
      showStep(next);
    },
  };
}
