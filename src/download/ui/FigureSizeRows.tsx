import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import type { FigureLayout } from '../core/figureLayout.ts';
import { FIGURE_LAYOUTS, figureLayoutSize } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { formatFigurePixels } from '../core/figureScale.ts';

import { FigureSizeField } from './FigureSizeField.tsx';

/** The shape a figure is saved at, and what changes it. */
export interface FigureSizing {
  /** The shape picked. */
  layout: FigureLayout;
  /**
   * The size typed for `custom`, or `null` before anything was typed, when it
   * starts from the figure on screen.
   */
  custom: FigurePixels | null;
  /** Called with the shape picked. */
  onLayoutChange: (layout: FigureLayout) => void;
  /** Called with the size typed. */
  onCustomChange: (size: FigurePixels) => void;
}

/** What {@link FigureSizeRows} needs. */
export interface FigureSizeRowsProps {
  /** The shape and what changes it. */
  sizing: FigureSizing;
  /** How big the figure is on the page, or `null` where there is none. */
  size: FigurePixels | null;
}

/**
 * The shape the figure is drawn at, and the two sides of a custom one.
 *
 * Each shape says the pixels it would produce, so choosing `16:9` for a figure
 * already close to it is visibly a choice that changes little.
 * @param props - See {@link FigureSizeRowsProps}.
 * @returns The rows.
 */
export function FigureSizeRows(props: FigureSizeRowsProps): ReactElement {
  const { sizing, size } = props;
  const { layout, custom, onLayoutChange, onCustomChange } = sizing;
  const t = useChromeT();

  const options: Array<OverlayOption<FigureLayout>> = [];
  for (const shape of FIGURE_LAYOUTS) {
    options.push({
      value: shape,
      label: layoutLabel(shape, t),
      title:
        size === null
          ? undefined
          : formatFigurePixels(figureLayoutSize(shape, size, custom ?? size)),
    });
  }

  return (
    <>
      <OverlaySelect<FigureLayout>
        label={t('download.size')}
        help={{ title: t('download.size'), body: t('download.sizeHelp') }}
        value={layout}
        options={options}
        disabled={size === null}
        onChange={onLayoutChange}
      />
      {layout === 'custom' && size !== null ? (
        <FigureSizeField
          label={t('download.customSize')}
          widthLabel={t('download.width')}
          heightLabel={t('download.height')}
          value={figureLayoutSize('custom', size, custom ?? size)}
          onChange={onCustomChange}
        />
      ) : null}
    </>
  );
}

/**
 * What a shape reads in the picker. A ratio is written as a ratio in every
 * language.
 * @param layout - The shape.
 * @param t - The chrome's formatter.
 * @returns Its label.
 */
function layoutLabel(layout: FigureLayout, t: Translate<ChromeKey>): string {
  switch (layout) {
    case 'standard':
      return '4:3';
    case 'wide':
      return '16:9';
    case 'column':
      return t('download.sizeColumn');
    case 'custom':
      return t('download.sizeCustom');
    case 'screen':
      return t('download.sizeScreen');
    default:
      throw new Error(`unknown figure layout: ${String(layout)}`);
  }
}
