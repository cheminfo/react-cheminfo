import { useCallback, useState } from 'react';

import type { FigureNotice } from '../core/copyFigure.ts';

/** What {@link useFigureTask} hands back. */
export interface FigureTask {
  /** Run a save or a copy, keeping what it came to. */
  run: (task: Promise<FigureNotice | null>) => void;
  /** Whether a file or a copy is being written right now. */
  busy: boolean;
  /** What went wrong the last time, if anything. */
  failure: string | null;
  /** What the last copy came to, if it is still what the panel describes. */
  notice: FigureNotice | null;
  /** Forget the last outcome, once the choices it answered have changed. */
  clear: () => void;
}

/**
 * The state behind the figure panel's save and copy buttons, whatever the
 * figure is drawn with: whether one is running, and what the last one came to.
 * @returns See {@link FigureTask}.
 */
export function useFigureTask(): FigureTask {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<FigureNotice | null>(null);

  const run = useCallback((task: Promise<FigureNotice | null>) => {
    setBusy(true);
    setFailure(null);
    setNotice(null);
    void task
      .then(setNotice, (error: unknown) => {
        setFailure(error instanceof Error ? error.message : String(error));
      })
      .finally(() => setBusy(false));
  }, []);

  const clear = useCallback(() => {
    setFailure(null);
    setNotice(null);
  }, []);

  return { run, busy, failure, notice, clear };
}
