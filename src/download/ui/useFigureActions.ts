import { useCallback, useState } from 'react';

import { writeImageToClipboard } from '../../clipboard/core/copyPng.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { downloadFigure } from '../core/downloadFigure.ts';
import { figurePng } from '../core/figurePng.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { figureSvg } from '../core/figureSvg.ts';

import type { FigureRedraw } from './useFigureRedraw.tsx';

/** What the last copy came to, when it is worth a line of its own. */
export type FigureNotice = 'copied' | 'copyUnsupported';

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
export interface FigureActions {
  /** Write the figure to a file, in the format picked. */
  save: () => void;
  /** Put the figure on the clipboard, as a PNG at the resolution picked. */
  copy: () => void;
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
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<FigureNotice | null>(null);

  function withFigure(write: (box: string | Element) => Promise<void>) {
    return redrawAt === null
      ? write(targetId)
      : redraw(targetId, redrawAt, write);
  }

  function run(task: Promise<FigureNotice | null>): void {
    setBusy(true);
    setFailure(null);
    setNotice(null);
    void task
      .then(setNotice, (error: unknown) => {
        setFailure(error instanceof Error ? error.message : String(error));
      })
      .finally(() => setBusy(false));
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
    // A browser whose clipboard takes text only never reads the picture, so
    // its failure would otherwise go unhandled.
    png.catch(() => undefined);
    run(
      writeImageToClipboard(png).then((copied) =>
        copied ? 'copied' : 'copyUnsupported',
      ),
    );
  }

  const clear = useCallback(() => {
    setFailure(null);
    setNotice(null);
  }, []);

  return { save, copy, busy, failure, notice, clear };
}
