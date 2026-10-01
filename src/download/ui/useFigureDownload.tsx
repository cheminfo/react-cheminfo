import type { ReactElement, ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigureLayout } from '../core/figureLayout.ts';
import { figureLayoutRedraws, figureLayoutSize } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import {
  DEFAULT_FIGURE_SCALE,
  FIGURE_SCALES,
  defaultFigureScale,
} from '../core/figureScale.ts';
import { figureSize } from '../core/figureTarget.ts';

import { FigureDownloadPanel } from './FigureDownloadPanel.tsx';
import { useFigureActions } from './useFigureActions.ts';
import type { FigureRenderer } from './useFigureRedraw.tsx';
import { useFigureRedraw } from './useFigureRedraw.tsx';

/** What the "Save figure" panel is set up with. */
export interface FigureDownloadOptions {
  /**
   * The `id` of the box the figure is mounted in. Everything drawn inside it
   * is saved — sixteen charts of a pair grid as readily as one scatter plot —
   * and the controls floating over it are left behind.
   */
  targetId: string;
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
   * The resolution a PNG opens on, as a multiple of the figure on screen. An
   * SVG opens at 1×, the size it has on screen, and each format keeps the
   * multiple the reader last picked for it.
   * @default 2
   */
  defaultScale?: number;
  /**
   * The resolutions offered.
   * @default [1, 2, 3, 4]
   */
  scales?: readonly number[];
  /**
   * What is painted under the figure. `transparent` leaves it unpainted, for a
   * figure going onto a coloured slide.
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
   * zoom and colours; only the box changes.
   * @default undefined — the figure is saved at the size it has on screen
   */
  renderFigure?: FigureRenderer;
}

/** What {@link useFigureDownload} hands back. */
export interface FigureDownloadState {
  /** Whether the panel is showing. */
  isOpen: boolean;
  /**
   * Show or hide the panel. Showing it measures the figure, so hand this to
   * the popover's `onInteraction` rather than a setter of your own.
   */
  setOpen: (open: boolean) => void;
  /** The panel, for the popover's `content`. */
  panel: ReactElement;
  /** The format picked, for a trigger that shows it. */
  format: FigureFormat;
  /**
   * The copy drawn off the page while a figure is saved at another size, to
   * be rendered anywhere in the caller's tree.
   */
  portal: ReactNode;
}

/**
 * The "Save figure" panel — save as PNG or SVG, or copy as PNG — for a caller
 * that brings its own trigger, such as a button in an editor's toolbar.
 * `FigureDownload` is the same panel behind the family's own glyph.
 * @param options - See {@link FigureDownloadOptions}.
 * @returns See {@link FigureDownloadState}.
 */
export function useFigureDownload(
  options: FigureDownloadOptions,
): FigureDownloadState {
  const { targetId, fileName, background, scales = FIGURE_SCALES } = options;
  const { defaultFormat = 'png', defaultScale = DEFAULT_FIGURE_SCALE } =
    options;
  const { title, renderFigure } = options;

  const t = useChromeT();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<FigureFormat>(defaultFormat);
  const [picked, setPicked] = useState<Record<FigureFormat, number>>(() => ({
    png: defaultScale,
    svg: defaultFigureScale('svg'),
  }));
  const scale = picked[format];
  const [size, setSize] = useState<FigurePixels | null>(null);
  const [layout, setLayout] = useState<FigureLayout>('screen');
  const [custom, setCustom] = useState<FigurePixels | null>(null);
  const { redraw, portal } = useFigureRedraw(renderFigure);
  const redrawAt =
    renderFigure !== undefined &&
    size !== null &&
    figureLayoutRedraws(layout, size, custom ?? size)
      ? figureLayoutSize(layout, size, custom ?? size)
      : null;
  const { save, copy, busy, failure, notice, clear } = useFigureActions({
    targetId,
    format,
    scale,
    fileName,
    background,
    redrawAt,
    redraw,
  });

  // The panel is held open from here rather than left to itself, because the
  // figure has to be measured at the moment it opens: its size is what the
  // panel writes out, and reading a bounding box on every render would cost a
  // layout pass on a bar that is re-rendered on every pointer move.
  const setOpen = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      if (!next) return;
      setSize(figureSize(targetId));
      clear();
    },
    [targetId, clear],
  );

  // What the last copy came to only describes the choices it was made with.
  function changed<T>(apply: (value: T) => void): (value: T) => void {
    return (value) => {
      clear();
      apply(value);
    };
  }

  const panel = (
    <FigureDownloadPanel
      title={title ?? t('download.saveFigure')}
      format={format}
      scale={scale}
      scales={scales}
      size={size}
      failure={failure}
      notice={notice}
      saving={busy}
      onFormatChange={changed(setFormat)}
      onScaleChange={changed((next: number) =>
        setPicked((current) => ({ ...current, [format]: next })),
      )}
      onSave={save}
      onCopy={copy}
      sizing={
        renderFigure === undefined
          ? undefined
          : {
              layout,
              custom,
              onLayoutChange: changed(setLayout),
              onCustomChange: changed(setCustom),
            }
      }
    />
  );

  return { isOpen, setOpen, panel, format, portal };
}
