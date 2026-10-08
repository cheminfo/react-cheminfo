import { copyFigure } from '../core/copyFigure.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { downloadFigure } from '../core/downloadFigure.ts';
import { figurePng } from '../core/figurePng.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { figureSvg } from '../core/figureSvg.ts';

import type { FigureRedraw } from './useFigureRedraw.tsx';
import type { FigureTask } from './useFigureTask.ts';
import { useFigureTask } from './useFigureTask.ts';

/** What {@link useFigureActions} works from. */
export interface FigureActionsOptions {
  /** The `id` of the box the figure is mounted in. */
  targetId: string;
  /** Which file save writes. */
  format: FigureFormat;
  /** The multiple of the figure on screen it is painted at. */
  scale: number;
  /** What the saved file is called, without its extension. */
  fileName?: string;
  /** What is painted under the figure. */
  background?: string;
  /**
   * The size the figure is drawn again at, off the page, or `null` to take
   * the figure as it is on screen.
   */
  redrawAt: FigurePixels | null;
  /** Draws the figure again, from {@link FigureRedraw}. */
  redraw: FigureRedraw['redraw'];
}

/** What {@link useFigureActions} hands back. */
export interface FigureActions extends Omit<FigureTask, 'run'> {
  /** Write the figure to a file, in the format picked. */
  save: () => void;
  /** Put the figure on the clipboard, as a PNG at the resolution picked. */
  copy: () => void;
}

/**
 * The two things the figure panel does: save the figure, and copy it.
 *
 * A copy is always a PNG, whatever format save is set to: a clipboard carries
 * a picture, and the one every slide, chat window and issue accepts is a PNG.
 * @param options - See {@link FigureActionsOptions}.
 * @returns See {@link FigureActions}.
 */
export function useFigureActions(options: FigureActionsOptions): FigureActions {
  const { targetId, format, scale, fileName, background } = options;
  const { redrawAt, redraw } = options;
  const { run, busy, failure, notice, clear } = useFigureTask();

  function withFigure(write: (box: string | Element) => Promise<void>) {
    return redrawAt === null
      ? write(targetId)
      : redraw(targetId, redrawAt, write);
  }

  function save(): void {
    const options = { format, scale, fileName, background };
    run(withFigure((box) => downloadFigure(box, options)).then(() => null));
  }

  function copy(): void {
    // The clipboard is written before anything is awaited, with the picture
    // still being painted: Safari only allows a write the click itself started.
    const png = new Promise<Blob>((resolve, reject) => {
      withFigure(async (box) => {
        resolve(await figurePng(figureSvg(box, { background }), scale));
      }).catch(reject);
    });
    run(copyFigure(png));
  }

  return { save, copy, busy, failure, notice, clear };
}
