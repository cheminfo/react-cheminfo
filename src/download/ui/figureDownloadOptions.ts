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
   * @default 'svg'
   */
  defaultFormat?: FigureFormat;
  /**
   * How the resolution of a PNG is offered: in dots per inch, at the width the
   * figure is taken at, as on every site of the family — or as multiples of
   * that width. 1× is 96 dpi.
   * @default 'dpi'
   */
  unit?: FigureResolutionUnit;
  /**
   * The resolution a PNG opens on — copied, sent or saved — as a multiple of
   * the figure at the width picked: `dpiScale(600)` opens on 600 dpi. An SVG
   * is stated at the width picked, whatever the resolution.
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
   * Draws the figure at a size, for a file. Every figure is offered a width —
   * as shown, one or two journal columns, or typed — and one saved at another
   * width is scaled to it; given this, it is drawn again at that width
   * instead, off the page, so its axes and labels keep the size they read on
   * screen rather than shrinking with it. Draw exactly what is on screen, with
   * the same data, zoom and colours; only the box changes. A written figure
   * is always scaled.
   * @default undefined — the figure is scaled to the width picked
   */
  renderFigure?: FigureRenderer;
}
