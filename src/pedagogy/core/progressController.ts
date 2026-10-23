/**
 * The handful of actions every exercise page performs on the progress it keeps:
 * read one record, mark it, open a hint, show the answer, forget it.
 *
 * The records live in whatever the page already holds its state in — a signal
 * of `@preact/signals-react`, or anything with a writable `value` — and every
 * action replaces that value rather than mutating it, so whatever renders from
 * it is told.
 */

import type { ExerciseProgress, ProgressRecords } from './progress.ts';
import { emptyProgress } from './progress.ts';
import type { ExerciseStatus } from './types.ts';

/** A writable box holding the records, which a signal is. */
export interface ProgressSignal<TProgress> {
  /** The records by exercise id; replaced, never mutated. */
  value: ProgressRecords<TProgress>;
}

/** The least a record has to carry for the controller to act on it. */
export interface ControlledProgress {
  /** Where the student stands. */
  status: ExerciseStatus;
  /** How many hints are open. */
  hintsRevealed: number;
  /** Whether the sample answer is on screen. */
  showSolution: boolean;
}

/** What {@link createProgressController} is built with. */
export interface ProgressControllerOptions<TProgress> {
  /**
   * The record an exercise nobody has touched reads as.
   * @default emptyProgress — status, answer, hints and solution
   */
  empty?: () => TProgress;
}

/** The actions on one page's progress. */
export interface ProgressController<TProgress extends ControlledProgress> {
  /** One exercise's record, defaults included; reads the signal. */
  getExerciseProgress: (id: string) => TProgress;
  /** Record an attempt or a success. */
  setExerciseStatus: (id: string, status: ExerciseStatus) => void;
  /** Change any fields of one record, the others kept. */
  updateProgress: (id: string, patch: Partial<TProgress>) => void;
  /**
   * Open the next hint, one at a time, stopping at the last when the count is
   * given.
   */
  revealNextHint: (id: string, hintCount?: number) => void;
  /** Show or hide the sample answer. */
  setShowSolution: (id: string, show: boolean) => void;
  /** Forget one exercise. */
  resetExercise: (id: string) => void;
  /**
   * Forget every exercise. The page puts this behind a confirmation dialog,
   * because it wipes a week of a student's work.
   */
  clearAllProgress: () => void;
}

/**
 * The actions on the progress a page keeps in a signal.
 * @param progress - The signal holding the records by exercise id.
 * @param options - What an untouched exercise reads as.
 * @returns The actions.
 */
export function createProgressController<
  TProgress extends ControlledProgress = ExerciseProgress,
>(
  progress: ProgressSignal<TProgress>,
  options: ProgressControllerOptions<TProgress> = {},
): ProgressController<TProgress> {
  const empty = options.empty ?? (emptyProgress as unknown as () => TProgress);

  function getExerciseProgress(id: string): TProgress {
    return { ...empty(), ...progress.value[id] };
  }

  function updateProgress(id: string, patch: Partial<TProgress>): void {
    progress.value = {
      ...progress.value,
      [id]: { ...getExerciseProgress(id), ...patch },
    };
  }

  return {
    getExerciseProgress,
    updateProgress,
    setExerciseStatus(id, status) {
      updateProgress(id, { status } as Partial<TProgress>);
    },
    revealNextHint(id, hintCount) {
      const revealed = getExerciseProgress(id).hintsRevealed + 1;
      updateProgress(id, {
        hintsRevealed:
          hintCount === undefined ? revealed : Math.min(revealed, hintCount),
      } as Partial<TProgress>);
    },
    setShowSolution(id, show) {
      updateProgress(id, { showSolution: show } as Partial<TProgress>);
    },
    resetExercise(id) {
      const next: ProgressRecords<TProgress> = {};
      for (const [key, value] of Object.entries(progress.value)) {
        if (key !== id) next[key] = value;
      }
      progress.value = next;
    },
    clearAllProgress() {
      progress.value = {};
    },
  };
}
