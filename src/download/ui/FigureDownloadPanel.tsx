import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { FigureFormat } from '../core/downloadFigure.ts';
import { figureLayoutSize } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import {
  figurePixels,
  figureScaleFits,
  figureScaleLabel,
  formatFigurePixels,
} from '../core/figureScale.ts';

import type { FigureSizing } from './FigureSizeRows.tsx';
import { FigureSizeRows } from './FigureSizeRows.tsx';

/** What {@link FigureDownloadPanel} is drawn from. */
export interface FigureDownloadPanelProps {
  /** What the panel is called. */
  title: string;
  /** Which file the reader is about to write. */
  format: FigureFormat;
  /** The multiple of the figure on screen it is painted at. */
  scale: number;
  /** The multiples offered. */
  scales: readonly number[];
  /** How big the figure is on the page, or `null` where there is none. */
  size: FigurePixels | null;
  /** What went wrong the last time save was pressed, if anything. */
  failure: string | null;
  /** Whether a file is being written right now. */
  saving: boolean;
  /** Called with the format the reader picked. */
  onFormatChange: (format: FigureFormat) => void;
  /** Called with the multiple they picked. */
  onScaleChange: (scale: number) => void;
  /** Called when they press save. */
  onSave: () => void;
  /**
   * Whether the SVG holds a rendered picture rather than vector drawings, as
   * for a WebGL scene: its resolution is then the pixels of that picture, it
   * meets the same ceiling as a PNG, and the hint says so.
   * @default false
   */
  rasterSvg?: boolean;
  /**
   * The shape the figure is drawn at, for a figure that can be drawn again at
   * another size. Without it the figure is saved at the size it has on screen,
   * and no size is offered.
   * @default undefined
   */
  sizing?: FigureSizing;
}

/**
 * The choices behind the save glyph, and the button that writes the file.
 *
 * The resolution applies to both formats, and means what the reader needs it
 * to: a PNG is painted with that many more pixels, and an SVG, drawn the same,
 * opens that many times larger in the slide or the document it is dropped
 * into. Only a PNG meets the ceiling of what a browser can paint, so only its
 * choices past that ceiling are greyed.
 *
 * The sentence at the foot is the panel's own hint line rather than a row of its own: it
 * is not a setting, it is what the two settings above it currently amount to,
 * and it is the only thing here that answers the question a reader actually
 * has, which is how big the file is going to be. Saving itself is a command
 * rather than a setting, so it sits at the foot under the hairline: a button
 * filed among the settings is read as one, and a press nobody meant to make.
 * @param props - See {@link FigureDownloadPanelProps}.
 * @returns The panel.
 */
export function FigureDownloadPanel(
  props: FigureDownloadPanelProps,
): ReactElement {
  const { title, format, scale, scales, size, failure, saving } = props;
  const { onFormatChange, onScaleChange, onSave, rasterSvg = false } = props;
  const { sizing } = props;
  const t = useChromeT();

  // What the file is drawn at: the figure on screen, or the shape picked.
  const drawn =
    size === null || sizing === undefined
      ? size
      : figureLayoutSize(sizing.layout, size, sizing.custom ?? size);

  const painted = format === 'png' || rasterSvg;

  return (
    <OverlayPanel
      title={title}
      hint={hintOf(format, drawn, scale, failure, rasterSvg, t)}
      actions={
        <OverlayAction
          text={t('download.save')}
          icon="download"
          intent="primary"
          disabled={saving || size === null}
          onClick={onSave}
        />
      }
    >
      <OverlaySegmented<FigureFormat>
        label={t('download.format')}
        help={{
          title: t('download.format'),
          body: t('download.formatHelp'),
        }}
        value={format}
        options={FORMAT_CHOICES}
        onChange={onFormatChange}
      />
      {sizing === undefined ? null : (
        <FigureSizeRows sizing={sizing} size={size} />
      )}
      <OverlaySegmented
        label={t('download.resolution')}
        help={{
          title: t('download.resolution'),
          body: t('download.resolutionHelp'),
          example: {
            code: '2×',
            note: t('download.resolutionExample'),
          },
        }}
        value={String(scale)}
        options={scaleChoices(scales, drawn, painted)}
        onChange={(picked) => onScaleChange(Number(picked))}
      />
    </OverlayPanel>
  );
}

/** The two files a figure can leave the page as. */
const FORMAT_CHOICES: ReadonlyArray<OverlayOption<FigureFormat>> = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
];

/**
 * The multiples offered, each saying what it would actually produce.
 *
 * One too large for the browser to paint is greyed rather than dropped, so the
 * reader learns the ceiling exists before they meet it as a blank file. An SVG
 * is not painted, so it has no such ceiling.
 * @param scales - The multiples the caller offers.
 * @param size - How big the figure is drawn for the file.
 * @param painted - Whether the file is painted into pixels.
 * @returns The choices, in the order offered.
 */
function scaleChoices(
  scales: readonly number[],
  size: FigurePixels | null,
  painted: boolean,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const scale of scales) {
    const pixels = size === null ? null : figurePixels(size, scale);
    choices.push({
      value: String(scale),
      label: figureScaleLabel(scale),
      title: pixels === null ? undefined : formatFigurePixels(pixels),
      disabled: painted && size !== null && !figureScaleFits(size, scale),
    });
  }
  return choices;
}

/**
 * The line at the foot of the panel: what pressing save is about to do.
 * @param format - Which file the reader is about to write.
 * @param size - How big the figure is drawn for the file.
 * @param scale - The multiple it is saved at.
 * @param failure - What went wrong last time, if anything.
 * @param rasterSvg - Whether the SVG embeds a rendered picture.
 * @param t - The chrome's formatter, so the sentence is in the language of
 * the page.
 * @returns The sentence.
 */
function hintOf(
  format: FigureFormat,
  size: FigurePixels | null,
  scale: number,
  failure: string | null,
  rasterSvg: boolean,
  t: Translate<ChromeKey>,
): string {
  if (failure !== null) return failure;
  if (size === null) return t('download.noFigure');
  if (format === 'svg' && rasterSvg) {
    return t('download.hintRasterSvg', {
      pixels: formatFigurePixels(figurePixels(size, scale)),
    });
  }
  const pixels = formatFigurePixels(figurePixels(size, scale));
  return format === 'svg'
    ? t('download.hintSvg', { pixels })
    : t('download.hintPng', { pixels });
}
