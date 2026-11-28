import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { FigureColors } from '../core/figureColors.ts';
import { FIGURE_COLORS } from '../core/figureColors.ts';

/** The colours a figure leaves the page in, and what changes them. */
export interface FigureColorChoice {
  /** The colours picked. */
  value: FigureColors;
  /** Called with the colours picked. */
  onChange: (value: FigureColors) => void;
}

/**
 * The row choosing whether a figure is copied, sent and saved in colour, in
 * grey or in black and white: for a journal that prints in one ink, or a
 * slide that must survive a black-and-white printer.
 * @param props - See {@link FigureColorChoice}.
 * @returns The row.
 */
export function FigureColorsRow(props: FigureColorChoice): ReactElement {
  const { value, onChange } = props;
  const t = useChromeT();

  const options: Array<OverlayOption<FigureColors>> = [];
  for (const colors of FIGURE_COLORS) {
    options.push({ value: colors, label: t(LABELS[colors]) });
  }

  return (
    <OverlaySegmented<FigureColors>
      label={t('download.colors')}
      help={{ title: t('download.colors'), body: t('download.colorsHelp') }}
      value={value}
      options={options}
      testId="figure-colors"
      onChange={onChange}
    />
  );
}

const LABELS: Record<FigureColors, ChromeKey> = {
  color: 'download.colorsColor',
  grey: 'download.colorsGrey',
  blackWhite: 'download.colorsBlackWhite',
};
