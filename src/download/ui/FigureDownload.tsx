import type { IconName } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { OverlayIconButton } from '../../overlay/ui/OverlayIconButton.tsx';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { downloadFigure } from '../core/downloadFigure.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { DEFAULT_FIGURE_SCALE, FIGURE_SCALES } from '../core/figureScale.ts';
import { figureSize } from '../core/figureTarget.ts';

import { FigureDownloadPanel } from './FigureDownloadPanel.tsx';

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
   * The resolution it opens on, as a multiple of the figure on screen.
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
   * @default 'Save this figure'
   */
  label?: string;
  /**
   * What the panel behind it is called.
   * @default 'Save figure'
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
 * slide deck accepts. The resolution belongs to the second alone, and the
 * panel writes out the pixels it is about to produce so nobody has to guess
 * what `3×` means for the figure in front of them.
 * @param props - See {@link FigureDownloadProps}.
 * @returns The glyph and its panel.
 */
export function FigureDownload(props: FigureDownloadProps): ReactElement {
  const { targetId, fileName, background, scales = FIGURE_SCALES } = props;
  const { defaultFormat = 'png', defaultScale = DEFAULT_FIGURE_SCALE } = props;
  const { label = 'Save this figure', title = 'Save figure' } = props;
  const { icon = 'download', testId } = props;

  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<FigureFormat>(defaultFormat);
  const [scale, setScale] = useState(defaultScale);
  const [size, setSize] = useState<FigurePixels | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      await downloadFigure(targetId, { format, scale, fileName, background });
      setFailure(null);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PopoverNext
      isOpen={open}
      placement="bottom-end"
      onInteraction={interact}
      content={
        <FigureDownloadPanel
          title={title}
          format={format}
          scale={scale}
          scales={scales}
          size={size}
          failure={failure}
          saving={saving}
          onFormatChange={setFormat}
          onScaleChange={setScale}
          onSave={() => void save()}
        />
      }
    >
      <OverlayIconButton
        icon={icon}
        label={label}
        value={format.toUpperCase()}
        active={open}
        testId={testId}
        opensMenu
      />
    </PopoverNext>
  );
}
