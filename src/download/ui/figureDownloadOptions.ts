import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigureResolutionUnit } from '../core/figureDpi.ts';
import type { FigureSvg } from '../core/figureSvg.ts';

import type { FigureRenderer } from './useFigureRedraw.tsx';

/** What the "Save figure" panel is set up with. */
export interface FigureDownloadOptions {
  /**
   * The `id` of the box the figure is mounted in. Everything drawn inside it
   * is saved — sixteen charts of a pair grid as readily as one scatter plot —
   * and the controls floating over it are left behind. Give this or
   * `writeFigure`.
   * @default undefined
   */
  targetId?: string;
  /**
   * Writes the figure as an SVG document, in place of reading it off the
   * page: for a drawing whose file carries more than its picture, such as the
   * chemistry behind a structure. It is called when the panel opens, to
   * measure the figure, and again for every save and copy. The SVG is saved as
   * written, at the size it states; the resolution paints the PNG alone.
   * @default undefined
   */
  writeFigure?: () => Promise<FigureSvg>;
  /**
   * What the saved file is called, without its extension. Name it after the
   * data rather than after the tool: a reader with four of these in a
   * downloads folder cannot tell four `figure.png` apart.
   * @default 'figure'
   */
  fileName?: string;
  /**
   * The format it opens on.
   * @default 'png'
   */
  defaultFormat?: FigureFormat;
  /**
   * How the resolution is offered: as multiples of the figure on screen, or —
   * for a figure drawn to the size it prints at — in dots per inch. In dots
   * per inch an SVG keeps the size it states, and 1× is 96 dpi.
   * @default 'multiple'
   */
  unit?: FigureResolutionUnit;
  /**
   * The resolution a PNG opens on, as a multiple of the figure on screen:
   * `dpiScale(600)` opens on 600 dpi. An SVG opens at 1×, the size it has on
   * screen, and each format keeps the multiple the reader last picked for it.
   * @default 2, or 300 dpi
   */
  defaultScale?: number;
  /**
   * The resolutions offered, as multiples of the figure on screen.
   * @default [1, 2, 3, 4], or 150, 300, 600 and 1200 dpi
   */
  scales?: readonly number[];
  /**
   * Called with the multiple a PNG is set to, for a page that keeps the
   * reader's choice — to paint its own PNGs at it, or to open on it next time.
   * @default undefined
   */
  onScaleChange?: (scale: number) => void;
  /**
   * What is painted under the figure. `transparent` leaves it unpainted, for a
   * figure going onto a coloured slide. A written figure paints its own.
   * @default the surface the figure is drawn on
   */
  background?: string;
  /**
   * What the panel is called.
   * @default the chrome's own line, in the language of the page
   */
  title?: string;
  /**
   * Draws the figure at a size, for a file. When it is given the panel offers
   * a size — as shown, 4:3, 16:9, a journal column, or typed — and a figure
   * saved at a size other than its own is drawn again at that size, off the
   * page, so its axes and labels are laid out for the new shape rather than
   * stretched into it. Draw exactly what is on screen, with the same data,
   * zoom and colours; only the box changes. A written figure has the size it
   * states, and is offered none.
   * @default undefined — the figure is saved at the size it has on screen
   */
  renderFigure?: FigureRenderer;
}
