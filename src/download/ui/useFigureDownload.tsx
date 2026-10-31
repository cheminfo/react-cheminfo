import type { ReactElement, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import {
  DEFAULT_FIGURE_DPI,
  FIGURE_DPIS,
  dpiScale,
} from '../core/figureDpi.ts';
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
import type { FigureDownloadOptions } from './figureDownloadOptions.ts';
import { useFigureActions } from './useFigureActions.ts';
import { useFigureRedraw } from './useFigureRedraw.tsx';

export type { FigureDownloadOptions } from './figureDownloadOptions.ts';

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

/** The dots per inch offered, as the multiples the figure is painted at. */
const DPI_SCALES = FIGURE_DPIS.map(dpiScale);

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
  const { targetId, writeFigure, fileName, background } = options;
  const { unit = 'multiple', defaultFormat = 'png' } = options;
  const { title, renderFigure, onScaleChange } = options;
  const dpi = unit === 'dpi';
  const scales = options.scales ?? (dpi ? DPI_SCALES : FIGURE_SCALES);
  const defaultScale =
    options.defaultScale ??
    (dpi ? dpiScale(DEFAULT_FIGURE_DPI) : DEFAULT_FIGURE_SCALE);
  // A figure with a printed size, or one its page wrote, keeps the size its
  // SVG states: the resolution is then the PNG's alone.
  const svgAtOwnSize = dpi || writeFigure !== undefined;
  const redraws = renderFigure !== undefined && writeFigure === undefined;

  const t = useChromeT();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<FigureFormat>(defaultFormat);
  const [picked, setPicked] = useState<Record<FigureFormat, number>>(() => ({
    png: defaultScale,
    svg: defaultFigureScale('svg'),
  }));
  const scale = format === 'svg' && svgAtOwnSize ? 1 : picked[format];
  const [size, setSize] = useState<FigurePixels | null>(null);
  const opening = useRef(0);
  const [layout, setLayout] = useState<FigureLayout>('screen');
  const [custom, setCustom] = useState<FigurePixels | null>(null);
  const { redraw, portal } = useFigureRedraw(
    redraws ? renderFigure : undefined,
  );
  const redrawAt =
    redraws &&
    size !== null &&
    figureLayoutRedraws(layout, size, custom ?? size)
      ? figureLayoutSize(layout, size, custom ?? size)
      : null;
  const { save, copy, busy, failure, notice, clear } = useFigureActions({
    targetId,
    writeFigure,
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
      clear();
      if (writeFigure === undefined) {
        setSize(targetId === undefined ? null : figureSize(targetId));
        return;
      }
      // A written figure is measured once it is written; only the last
      // opening is answered.
      opening.current += 1;
      const ticket = opening.current;
      writeFigure().then(
        (figure) => {
          if (ticket !== opening.current) return;
          setSize({ width: figure.width, height: figure.height });
        },
        () => {
          if (ticket === opening.current) setSize(null);
        },
      );
    },
    [targetId, writeFigure, clear],
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
      unit={unit}
      svgAtOwnSize={svgAtOwnSize}
      size={size}
      failure={failure}
      notice={notice}
      saving={busy}
      onFormatChange={changed(setFormat)}
      onScaleChange={changed((next: number) => {
        setPicked((current) => ({ ...current, [format]: next }));
        if (format === 'png') onScaleChange?.(next);
      })}
      onSave={save}
      onCopy={copy}
      sizing={
        redraws
          ? {
              layout,
              custom,
              onLayoutChange: changed(setLayout),
              onCustomChange: changed(setCustom),
            }
          : undefined
      }
    />
  );

  return { isOpen, setOpen, panel, format, portal };
}
