import type { ReactElement } from 'react';

import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import {
  figurePixels,
  figureScaleFits,
  figureScaleLabel,
  formatFigurePixels,
} from '../core/figureScale.ts';

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
}

/**
 * The two choices behind the save glyph, and the button that writes the file.
 *
 * The resolution stays in place and greyed while an SVG is selected rather
 * than disappearing, because a control that vanishes is a control the reader
 * concludes the figure does not have — and the sentence at the foot says why
 * it is greyed, which is that an SVG has no resolution to choose.
 *
 * That sentence is the panel's own hint line rather than a row of its own: it
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
  const { onFormatChange, onScaleChange, onSave } = props;

  const vector = format === 'svg';

  return (
    <OverlayPanel
      title={title}
      hint={hintOf(format, size, scale, failure)}
      actions={
        <OverlayAction
          text="Save"
          icon="download"
          intent="primary"
          disabled={saving || size === null}
          onClick={onSave}
        />
      }
    >
      <OverlaySegmented<FigureFormat>
        label="Format"
        help={FORMAT_HELP}
        value={format}
        options={FORMAT_CHOICES}
        onChange={onFormatChange}
      />
      <OverlaySegmented
        label="Resolution"
        help={RESOLUTION_HELP}
        value={String(scale)}
        options={scaleChoices(scales, size)}
        disabled={vector}
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

const FORMAT_HELP: HelpContent = {
  title: 'Format',
  body: 'A PNG is a picture of the figure, which is what a slide, a chat window or an issue accepts. An SVG is the figure itself: every line stays sharp however far it is enlarged, and it can still be edited afterwards.',
};

const RESOLUTION_HELP: HelpContent = {
  title: 'Resolution',
  body: 'How many pixels are painted for each pixel of the figure on screen. Two is right for a slide, three or four for print. An SVG carries no resolution of its own, so it is saved sharp at every size.',
  example: {
    code: '2×',
    note: 'A figure 640 pixels wide on screen is saved 1280 pixels wide.',
  },
};

/**
 * The multiples offered, each saying what it would actually produce.
 *
 * One too large for the browser to paint is greyed rather than dropped, so the
 * reader learns the ceiling exists before they meet it as a blank file.
 * @param scales - The multiples the caller offers.
 * @param size - How big the figure is on the page.
 * @returns The choices, in the order offered.
 */
function scaleChoices(
  scales: readonly number[],
  size: FigurePixels | null,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const scale of scales) {
    const pixels = size === null ? null : figurePixels(size, scale);
    choices.push({
      value: String(scale),
      label: figureScaleLabel(scale),
      title: pixels === null ? undefined : formatFigurePixels(pixels),
      disabled: size !== null && !figureScaleFits(size, scale),
    });
  }
  return choices;
}

/**
 * The line at the foot of the panel: what pressing save is about to do.
 * @param format - Which file the reader is about to write.
 * @param size - How big the figure is on the page.
 * @param scale - The multiple it is painted at.
 * @param failure - What went wrong last time, if anything.
 * @returns The sentence.
 */
function hintOf(
  format: FigureFormat,
  size: FigurePixels | null,
  scale: number,
  failure: string | null,
): string {
  if (failure !== null) return failure;
  if (size === null) return 'There is no figure on the page to save yet.';
  if (format === 'svg') {
    return `An SVG stays sharp at any size, so the resolution does not apply. Drawn ${formatFigurePixels(size)}.`;
  }
  return `Saved ${formatFigurePixels(figurePixels(size, scale))}.`;
}
