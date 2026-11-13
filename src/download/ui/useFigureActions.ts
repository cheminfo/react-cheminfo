import { copyFigure } from '../core/copyFigure.ts';
import { resizedSvgFigure } from '../core/croppedMarkup.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { downloadFigureSvg, figureSvgFile } from '../core/downloadFigure.ts';
import { figurePng } from '../core/figurePng.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import type { FigureSvg } from '../core/figureSvg.ts';
import { figureSvg } from '../core/figureSvg.ts';
import { withPageFigureSource } from '../core/pageFigureSource.ts';

import type { FigureRedraw } from './useFigureRedraw.tsx';
import { useFigureSend } from './useFigureSend.ts';
import type { FigureTask } from './useFigureTask.ts';
import { useFigureTask } from './useFigureTask.ts';

/** What {@link useFigureActions} works from. */
export interface FigureActionsOptions {
  /** The `id` of the box the figure is mounted in. */
  targetId?: string;
  /** Writes the figure, in place of reading it off the page. */
  writeFigure?: () => Promise<FigureSvg>;
  /** Which file save writes. */
  format: FigureFormat;
  /** The multiple of the figure on screen it is painted at. */
  scale: number;
  /**
   * The multiple the PNG a copy or a send carries is painted at. Neither
   * takes the choices of the panel, so this is the site's own default rather
   * than the one picked.
   */
  pictureScale: number;
  /**
   * How many times its size on screen the saved figure is stated at: the
   * width picked, for a figure that is not drawn again at it.
   * @default 1
   */
  sizeFactor?: number;
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
  /**
   * Put the figure, at the width picked, on the clipboard: as a PNG and,
   * where the browser takes one, as an SVG.
   */
  copy: () => void;
  /**
   * Hand a PNG of the figure, at the width picked, to the share sheet of the
   * device, for a chat or a mail.
   */
  send: () => void;
}

/**
 * The three things the figure panel does: save the figure, copy it, and send
 * it to another app through the share sheet.
 *
 * All three take the width picked. A copy takes none of the file's choices:
 * it carries the PNG every slide, chat window and issue accepts and the SVG
 * where the browser's clipboard takes one, and the program pasted into picks
 * the one it reads; a send hands on the PNG.
 * @param options - See {@link FigureActionsOptions}.
 * @returns See {@link FigureActions}.
 */
export function useFigureActions(options: FigureActionsOptions): FigureActions {
  const { targetId, writeFigure, format, scale, fileName, background } =
    options;
  const { pictureScale, sizeFactor = 1 } = options;
  const { redrawAt, redraw } = options;
  const { run, busy, failure, notice, clear } = useFigureTask();
  const sendFile = useFigureSend({ run, notice });

  async function withFigure(write: (box: string | Element) => Promise<void>) {
    if (targetId === undefined) throw new Error('There is no figure to save.');
    return redrawAt === null
      ? write(targetId)
      : redraw(targetId, redrawAt, write);
  }

  // Both are stated at the width picked; a PNG is painted at the resolution,
  // which it states as its dpi.
  function save(): void {
    const options = { format, scale, fileName };
    const written =
      writeFigure === undefined
        ? withFigure((box) =>
            downloadFigureSvg(
              resized(figureSvg(box, { background }), sizeFactor),
              options,
            ),
          )
        : writeFigure().then((figure) =>
            downloadFigureSvg(resized(figure, sizeFactor), options),
          );
    run(written.then(() => null));
  }

  // The figure at the width picked, for a copy or a send.
  function atSize(): Promise<FigureSvg> {
    if (writeFigure !== undefined) {
      return writeFigure().then((figure) => resized(figure, sizeFactor));
    }
    return new Promise<FigureSvg>((resolve, reject) => {
      withFigure(async (box) => {
        resolve(resized(figureSvg(box, { background }), sizeFactor));
      }).catch(reject);
    });
  }

  function copy(): void {
    // The clipboard is written before anything is awaited, with the picture
    // still being painted: Safari only allows a write the click itself started.
    const drawn = atSize();
    run(
      copyFigure(
        drawn.then((figure) => figurePng(figure, pictureScale)),
        drawn.then((figure) => withPageFigureSource(figure.markup)),
      ),
    );
  }

  // A chat or a mail shows a PNG as a picture, and an SVG as a file.
  function send(): void {
    sendFile(() =>
      atSize().then((figure) =>
        figureSvgFile(figure, { format: 'png', scale: pictureScale, fileName }),
      ),
    );
  }

  return { save, copy, send, busy, failure, notice, clear };
}

/**
 * A figure stated at a multiple of its size.
 * @param figure - The figure.
 * @param factor - The multiple.
 * @returns The figure, resized when the multiple is not 1.
 */
function resized(figure: FigureSvg, factor: number): FigureSvg {
  if (factor === 1) return figure;
  return resizedSvgFigure(figure, {
    width: figure.width * factor,
    height: figure.height * factor,
  });
}
