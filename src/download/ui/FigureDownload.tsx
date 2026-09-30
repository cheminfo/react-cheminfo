import type { IconName } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayIconButton } from '../../overlay/ui/OverlayIconButton.tsx';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { downloadFigure } from '../core/downloadFigure.ts';
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
import type { FigureRenderer } from './useFigureRedraw.tsx';
import { useFigureRedraw } from './useFigureRedraw.tsx';

/** What {@link FigureDownload} needs. */
export interface FigureDownloadProps {
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
   * What the glyph is called, for the pointer and for a screen reader.
   * @default the chrome's own line, in the language of the page
   */
  label?: string;
  /**
   * What the panel behind it is called.
   * @default the chrome's own line, in the language of the page
   */
  title?: string;
  /**
   * Its glyph.
   * @default 'download'
   */
  icon?: IconName;
  /**
   * Value of the `data-testid` attribute of the glyph.
   * @default undefined
   */
  testId?: string;
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

/**
 * The glyph that takes the figure off the page as a file.
 *
 * It works from the `id` of the box the figure is mounted in rather than from
 * the figure itself, so the control is free to sit in the bar above the
 * picture — or anywhere else on the page — without the component that drew the
 * figure having to hand anything over. That is also what lets one control save
 * a view that is really several charts: whatever is inside the box is what is
 * saved.
 *
 * Both formats are offered because they answer different questions. An SVG is
 * the figure itself, sharp at any size and still editable, which is what a
 * paper wants; a PNG is a picture of it, which is what every chat window and
 * slide deck accepts. The resolution paints a PNG with more pixels and makes
 * an SVG open larger, and the panel writes out the size it is about to
 * produce so nobody has to guess what `3×` means for the figure in front of
 * them.
 * @param props - See {@link FigureDownloadProps}.
 * @returns The glyph and its panel.
 */
export function FigureDownload(props: FigureDownloadProps): ReactElement {
  const { targetId, fileName, background, scales = FIGURE_SCALES } = props;
  const { defaultFormat = 'png', defaultScale = DEFAULT_FIGURE_SCALE } = props;
  const { label, title } = props;
  const { icon = 'download', testId, renderFigure } = props;

  const t = useChromeT();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<FigureFormat>(defaultFormat);
  const [picked, setPicked] = useState<Record<FigureFormat, number>>(() => ({
    png: defaultScale,
    svg: defaultFigureScale('svg'),
  }));
  const scale = picked[format];
  const [size, setSize] = useState<FigurePixels | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState<FigureLayout>('screen');
  const [custom, setCustom] = useState<FigurePixels | null>(null);
  const { redraw, portal } = useFigureRedraw(renderFigure);

  // The panel is held open from here rather than left to itself, because the
  // figure has to be measured at the moment it opens: its size is what the
  // panel writes out, and reading a bounding box on every render would cost a
  // layout pass on a bar that is re-rendered on every pointer move.
  function interact(next: boolean): void {
    setOpen(next);
    if (!next) return;
    setSize(figureSize(targetId));
    setFailure(null);
  }

  async function save(): Promise<void> {
    setSaving(true);
    try {
      const options = { format, scale, fileName, background };
      if (
        renderFigure !== undefined &&
        size !== null &&
        figureLayoutRedraws(layout, size, custom ?? size)
      ) {
        const drawn = figureLayoutSize(layout, size, custom ?? size);
        await redraw(targetId, drawn, (box) => downloadFigure(box, options));
      } else {
        await downloadFigure(targetId, options);
      }
      setFailure(null);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PopoverNext
        isOpen={open}
        placement="bottom-end"
        onInteraction={interact}
        content={
          <FigureDownloadPanel
            title={title ?? t('download.saveFigure')}
            format={format}
            scale={scale}
            scales={scales}
            size={size}
            failure={failure}
            saving={saving}
            onFormatChange={setFormat}
            onScaleChange={(next) =>
              setPicked((current) => ({ ...current, [format]: next }))
            }
            onSave={() => void save()}
            sizing={
              renderFigure === undefined
                ? undefined
                : {
                    layout,
                    custom,
                    onLayoutChange: setLayout,
                    onCustomChange: setCustom,
                  }
            }
          />
        }
      >
        <OverlayIconButton
          icon={icon}
          label={label ?? t('download.saveThisFigure')}
          value={format.toUpperCase()}
          active={open}
          testId={testId}
          opensMenu
        />
      </PopoverNext>
      {portal}
    </>
  );
}
