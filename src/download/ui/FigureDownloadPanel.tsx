import type { ReactElement, ReactNode } from 'react';

import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { overlayPanelHintStyle } from '../../overlay/ui/overlayPanelStyles.ts';
import { useOverlaySurface } from '../../overlay/ui/overlaySurface.ts';
import type { FigureNotice } from '../core/copyFigure.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigureResolutionUnit } from '../core/figureDpi.ts';
import { figureLayoutSize } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';

import { FigureQuickActions } from './FigureQuickActions.tsx';
import type { FigureSizing } from './FigureSizeRows.tsx';
import { FigureSizeRows } from './FigureSizeRows.tsx';
import { fileHintOf, pictureHintOf } from './figureDownloadHint.ts';
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
   * Files of another kind on offer, saved instead of a picture; Copy and Send
   * still take the picture.
   * @default undefined — only pictures are offered
   */
  file?: FigureFileChoice<TFile>;
  /**
   * The resolution of a PNG — copied, sent or saved — as a multiple of the
   * figure at the width picked.
   */
  scale: number;
  /** The multiples offered. */
  scales: readonly number[];
  /**
   * How the resolution reads: multiples of the figure on screen, or the dots
   * per inch it has printed at its size on the page — 1× is 96 dpi.
   * @default 'multiple'
   */
  unit?: FigureResolutionUnit;
  /** How big the figure is on the page, or `null` where there is none. */
  size: FigurePixels | null;
  /** What went wrong the last time save was pressed, if anything. */
  failure: string | null;
  /**
   * What the last copy or send came to, said beside their buttons.
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
   * Called when they press copy, which puts the figure on the clipboard as a
   * PNG and, where the browser takes one, an SVG, at the width and the
   * resolution picked.
   */
  onCopy: () => void;
  /**
   * Called when they press send, which hands a PNG of the figure, at the
   * width and the resolution picked, to the share sheet of the device, for a
   * chat or a mail. The button is shown only where the browser has a sheet
   * that takes a PNG — a phone, Safari, Chrome on a desktop.
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
 * What can be done with a figure, in three parts read top down: the width it
 * is taken at and the resolution of its PNG, which Copy, Send and Save all
 * use; Copy and Send; and the file, whose format is its own, with Save at the
 * foot. Copy puts a PNG and, where the browser takes one, an SVG on the
 * clipboard; a share sheet hands every file on as an attachment, so Send
 * hands it the one a chat or a mail shows as a picture, a PNG.
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
  const { unit = 'multiple' } = props;
  const t = useChromeT();
  const language = useLanguage();
  const { metrics } = useOverlaySurface();

  // What the file is drawn at: the figure on screen, or the shape picked.
  const drawn =
    size === null || sizing === undefined
      ? size
      : figureLayoutSize(sizing.layout, size, sizing.custom ?? undefined);

  const picked = file && file.value !== null ? file : undefined;
  const cannotWrite = picked === undefined && size === null;
  const hint = { size: drawn, scale, unit, language };

  return (
    <OverlayPanel
      title={title}
      width={unit === 'dpi' ? DPI_PANEL_WIDTH : PANEL_WIDTH}
      hint={
        picked
          ? (failure ?? picked.hint)
          : fileHintOf({ ...hint, format, failure, rasterSvg }, t)
      }
      actions={
        <OverlayAction
          text={t('download.save')}
          icon="download"
          intent="primary"
          disabled={cannotWrite}
          busy={saving}
          onClick={onSave}
        />
      }
    >
      {sizing === undefined ? null : (
        <FigureSizeRows sizing={sizing} size={size} />
      )}
      <OverlaySegmented
        label={t('download.resolution')}
        help={resolutionHelp(unit, t)}
        value={String(scale)}
        options={scaleChoices(scales, drawn, true, unit)}
        onChange={(next) => onScaleChange(Number(next))}
      />
      <p style={overlayPanelHintStyle(metrics)}>{pictureHintOf(hint, t)}</p>
      <OverlayGroup label={t('download.copyOrSend')}>
        <FigureQuickActions
          disabled={size === null}
          busy={saving}
          notice={notice}
          onCopy={onCopy}
          onSend={onSend}
        />
      </OverlayGroup>
      <OverlayGroup label={t('download.saveAsFile')}>
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
      </OverlayGroup>
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

function isFigureFormat(value: string): value is FigureFormat {
  return value === 'png' || value === 'svg';
}

/** The two files a figure can leave the page as. */
const FORMAT_CHOICES: ReadonlyArray<OverlayOption<FigureFormat>> = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
];
