import type { ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { formatFigureCentimetres } from '../core/figureDpi.ts';
import type { FigureLayout } from '../core/figureLayout.ts';
import { FIGURE_LAYOUTS, figureLayoutSize } from '../core/figureLayout.ts';
import type { FigurePixels } from '../core/figureScale.ts';

import { FigureWidthField } from './FigureWidthField.tsx';

/** The width a figure is saved at, and what changes it. */
export interface FigureSizing {
  /** The width picked. */
  layout: FigureLayout;
  /**
   * The width typed for `custom`, in pixels of the page, or `null` before
   * anything was typed, when it starts from the figure on screen.
   */
  custom: number | null;
  /** Called with the width picked. */
  onLayoutChange: (layout: FigureLayout) => void;
  /** Called with the width typed, in pixels of the page. */
  onCustomChange: (width: number) => void;
}

/** What {@link FigureSizeRows} needs. */
export interface FigureSizeRowsProps {
  /** The width and what changes it. */
  sizing: FigureSizing;
  /** How big the figure is on the page, or `null` where there is none. */
  size: FigurePixels | null;
}

/**
 * The width the figure is saved at, and the box a custom one is typed into.
 *
 * Each width says the size it prints at, so picking one column for a figure
 * already that wide is visibly a choice that changes little.
 * @param props - See {@link FigureSizeRowsProps}.
 * @returns The rows.
 */
export function FigureSizeRows(props: FigureSizeRowsProps): ReactElement {
  const { sizing, size } = props;
  const { layout, custom, onLayoutChange, onCustomChange } = sizing;
  const t = useChromeT();
  const language = useLanguage();

  const options: Array<OverlayOption<FigureLayout>> = [];
  for (const width of FIGURE_LAYOUTS) {
    const printed =
      size === null
        ? undefined
        : formatFigureCentimetres(
            figureLayoutSize(width, size, custom ?? undefined),
            language,
          );
    options.push({
      value: width,
      label: layoutLabel(width, t),
      title:
        printed === undefined
          ? undefined
          : `${printed.width} × ${printed.height} cm`,
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
        <FigureWidthField
          label={t('download.width')}
          value={figureLayoutSize('custom', size, custom ?? undefined).width}
          onChange={onCustomChange}
        />
      ) : null}
    </>
  );
}

/**
 * What a width reads in the picker.
 * @param layout - The width.
 * @param t - The chrome's formatter.
 * @returns Its label.
 */
function layoutLabel(layout: FigureLayout, t: Translate<ChromeKey>): string {
  switch (layout) {
    case 'column':
      return t('download.sizeColumn');
    case 'double':
      return t('download.sizeDouble');
    case 'custom':
      return t('download.sizeCustom');
    case 'screen':
      return t('download.sizeScreen');
    default:
      throw new Error(`unknown figure layout: ${String(layout)}`);
  }
}
