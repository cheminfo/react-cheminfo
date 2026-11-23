/**
 * The key to the family colours, under the table: the shared
 * {@link SwatchLegend} fed the ten families.
 */

import type { ReactElement } from 'react';

import { SwatchLegend } from '../../color/ui/SwatchLegend.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  categorySwatch,
} from '../core/categories.ts';
import type { ElementCategory } from '../core/elements.ts';

/** What {@link CategoryLegend} needs. */
export interface CategoryLegendProps {
  /**
   * Called with the family whose swatch was clicked. Without it the legend is
   * a key rather than a control, and nothing in it is focusable.
   * @default undefined
   */
  onSelect?: (category: ElementCategory) => void;
  /**
   * The family drawn as the active one.
   * @default undefined — none is
   */
  selected?: ElementCategory;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The ten families, each with its colour.
 * @param props - See {@link CategoryLegendProps}.
 * @returns The legend.
 */
export function CategoryLegend(props: CategoryLegendProps): ReactElement {
  const { className, onSelect, selected } = props;
  const t = useChromeT();
  const entries = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: t.or(`periodic.category.${category}`, CATEGORY_LABELS[category]),
    swatch: categorySwatch(category),
  }));
  return (
    <SwatchLegend
      className={className}
      entries={entries}
      selected={selected}
      onSelect={
        onSelect === undefined
          ? undefined
          : (key) => {
              onSelect(key as ElementCategory);
            }
      }
    />
  );
}
