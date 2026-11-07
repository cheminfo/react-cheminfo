import { useRef } from 'react';

import type { FigureNotice } from '../core/copyFigure.ts';
import { shareFile } from '../core/shareFile.ts';

import type { FigureTask } from './useFigureTask.ts';

/**
 * Hand a figure to the share sheet, writing it first.
 * @param write - Writes the file, as save would.
 */
export type FigureSend = (write: () => Promise<File>) => void;

/**
 * The send button of the figure panel: the file written as save writes it,
 * then handed to the share sheet of the device.
 *
 * A file that took longer to write than the press stayed fresh is kept, and
 * the panel says it is ready: the next press shares it before anything is
 * awaited, which every browser accepts. A choice changed in between clears the
 * notice, and with it the file, which no longer is what the panel describes.
 * @param task - The panel's task, which the outcome is reported through.
 * @returns What the send button calls.
 */
export function useFigureSend(
  task: Pick<FigureTask, 'run' | 'notice'>,
): FigureSend {
  const { run, notice } = task;
  const kept = useRef<File | null>(null);

  async function handOn(
    file: File,
    late: boolean,
  ): Promise<FigureNotice | null> {
    const outcome = await shareFile(file);
    if (outcome === 'sent') return 'sent';
    if (outcome === 'cancelled') return null;
    if (outcome === 'expired' && late) {
      kept.current = file;
      return 'sendReady';
    }
    return 'sendUnsupported';
  }

  return (write) => {
    const ready = notice === 'sendReady' ? kept.current : null;
    kept.current = null;
    if (ready === null) {
      run(write().then((file) => handOn(file, true)));
    } else {
      run(handOn(ready, false));
    }
  };
}
