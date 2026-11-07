import type { ReactElement, ReactNode } from 'react';

import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { FigureNotice } from '../core/copyFigure.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigureResolutionUnit } from '../core/figureDpi.ts';
import { figureLayoutSize } from '../core/figureLayout.ts';
import { FIGURE_PNG_TYPE } from '../core/figurePng.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { FIGURE_SVG_TYPE } from '../core/figureSvg.ts';
import { canShareFile } from '../core/shareFile.ts';

import type { FigureSizing } from './FigureSizeRows.tsx';
import { FigureSizeRows } from './FigureSizeRows.tsx';
import { hintOf } from './figureDownloadHint.ts';
import { resolutionHelp, scaleChoices } from './resolutionChoices.ts';

/**
 * Files of another kind offered after the two a picture is saved as, such as a
 * molfile.
 */
export interface FigureFileChoice<TFile extends string> {
  /** The files offered. */
  options: ReadonlyArray<OverlayOption<TFile>>;
  /** The one picked, or `null` while a picture is. */
  value: TFile | null;
  /** Called with the file picked, and with `null` when a picture is. */
  onChange: (value: TFile | null) => void;
  /** The line at the foot of the panel while one is picked. */
  hint: string;
}

/** What {@link FigureDownloadPanel} is drawn from. */
export interface FigureDownloadPanelProps<TFile extends string = never> {
  /** What the panel is called. */
  title: string;
  /** Which picture the reader is about to write. */
  format: FigureFormat;
  /**
   * Files of another kind on offer. Nothing is painted for one, so no
   * resolution is offered while it is picked.
   * @default undefined — only pictures are offered
   */
  file?: FigureFileChoice<TFile>;
  /** The multiple of the figure on screen it is painted at. */
  scale: number;
  /** The multiples offered. */
  scales: readonly number[];
  /**
   * How the resolution reads: multiples of the figure on screen, or the dots
   * per inch it has printed at its size on the page — 1× is 96 dpi.
   * @default 'multiple'
   */
  unit?: FigureResolutionUnit;
  /**
   * Whether an SVG is saved at the size it states, whatever the resolution:
   * the resolution then paints the PNG alone, and is not offered for the SVG.
   * @default false
   */
  svgAtOwnSize?: boolean;
  /** How big the figure is on the page, or `null` where there is none. */
  size: FigurePixels | null;
  /** What went wrong the last time save was pressed, if anything. */
  failure: string | null;
  /**
   * What the last copy came to, while the choices it was made with still
   * stand.
   * @default null
   */
  notice?: FigureNotice | null;
  /** Whether a file or a copy is being written right now. */
  saving: boolean;
  /** Called with the format the reader picked. */
  onFormatChange: (format: FigureFormat) => void;
  /** Called with the multiple they picked. */
  onScaleChange: (scale: number) => void;
  /** Called when they press save. */
  onSave: () => void;
  /**
   * Called when they press copy, which puts a PNG at the resolution picked on
   * the clipboard.
   */
  onCopy: () => void;
  /**
   * Called when they press send, which hands the file save would write to the
   * share sheet of the device. The button is shown only where the browser has
   * one that takes a picture — a phone, Safari, Chrome on a desktop — and only
   * a picture is sent: a file of another kind is greyed.
   * @default undefined — nothing is offered to send
   */
  onSend?: () => void;
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
  /**
   * Rows of the figure's own, shown after the format: what else decides the
   * file, such as which frames of an animation go into it.
   * @default undefined
   */
  children?: ReactNode;
}

/**
 * The choices behind the save glyph, and the buttons that write the file, copy
 * the picture, and send the file to another app.
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
export function FigureDownloadPanel<TFile extends string = never>(
  props: FigureDownloadPanelProps<TFile>,
): ReactElement {
  const { title, format, scale, scales, size, failure, saving } = props;
  const { file } = props;
  const { onFormatChange, onScaleChange, onSave, rasterSvg = false } = props;
  const { sizing, onCopy, onSend, notice = null, children } = props;
  const { unit = 'multiple', svgAtOwnSize = false } = props;
  const t = useChromeT();
  const language = useLanguage();

  // What the file is drawn at: the figure on screen, or the shape picked.
  const drawn =
    size === null || sizing === undefined
      ? size
      : figureLayoutSize(sizing.layout, size, sizing.custom ?? size);

  const picked = file && file.value !== null ? file : undefined;
  const painted = format === 'png' || rasterSvg;
  const offerResolution =
    picked === undefined && (format === 'png' || !svgAtOwnSize);
  const cannotWrite = picked === undefined && size === null;

  return (
    <OverlayPanel
      title={title}
      width={unit === 'dpi' ? DPI_PANEL_WIDTH : PANEL_WIDTH}
      hint={
        picked
          ? (failure ?? picked.hint)
          : hintOf(
              {
                format,
                size: drawn,
                scale,
                failure,
                notice,
                rasterSvg,
                unit,
                language,
              },
              t,
            )
      }
      actions={
        <>
          <OverlayAction
            text={t('download.save')}
            icon="download"
            intent="primary"
            disabled={cannotWrite}
            busy={saving}
            onClick={onSave}
          />
          <OverlayAction
            text={t('clipboard.copy')}
            icon="clipboard"
            disabled={cannotWrite}
            busy={saving}
            onClick={onCopy}
          />
          {onSend !== undefined && canSendFigure('png') ? (
            <OverlayAction
              text={t('download.send')}
              icon="send-message"
              disabled={
                picked !== undefined || size === null || !canSendFigure(format)
              }
              busy={saving}
              onClick={onSend}
            />
          ) : null}
        </>
      }
    >
      <OverlaySegmented<FigureFormat | TFile>
        label={t('download.format')}
        help={{
          title: t('download.format'),
          body: t('download.formatHelp'),
        }}
        value={file?.value ?? format}
        options={file ? [...FORMAT_CHOICES, ...file.options] : FORMAT_CHOICES}
        onChange={(value) => {
          if (isFigureFormat(value)) {
            file?.onChange(null);
            onFormatChange(value);
          } else {
            file?.onChange(value);
          }
        }}
      />
      {children}
      {sizing === undefined ? null : (
        <FigureSizeRows sizing={sizing} size={size} />
      )}
      {offerResolution ? (
        <OverlaySegmented
          label={t('download.resolution')}
          help={resolutionHelp(unit, t)}
          value={String(scale)}
          options={scaleChoices(scales, drawn, painted, unit)}
          onChange={(picked) => onScaleChange(Number(picked))}
        />
      ) : null}
    </OverlayPanel>
  );
}

/**
 * Wide enough for the longest hint on one line in English, so switching
 * between PNG and SVG — whose hints differ in length — never resizes the panel.
 */
const PANEL_WIDTH = '27em';

/** Wide enough for the four dots per inch on one row, `1200 dpi` last. */
const DPI_PANEL_WIDTH = '33em';

/**
 * Whether the share sheet here takes a picture of that format.
 * @param format - The format.
 * @returns Whether it does.
 */
function canSendFigure(format: FigureFormat): boolean {
  return format === 'svg'
    ? canShareFile('figure.svg', FIGURE_SVG_TYPE)
    : canShareFile('figure.png', FIGURE_PNG_TYPE);
}

function isFigureFormat(value: string): value is FigureFormat {
  return value === 'png' || value === 'svg';
}

/** The two files a figure can leave the page as. */
const FORMAT_CHOICES: ReadonlyArray<OverlayOption<FigureFormat>> = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
];
