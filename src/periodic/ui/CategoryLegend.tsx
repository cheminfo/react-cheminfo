/**
 * The key to the family colours, under the table.
 */

import type { CSSProperties, ReactElement } from 'react';

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
}

/**
 * The ten families, each with its colour.
 * @param props - See {@link CategoryLegendProps}.
 * @returns The legend.
 */
export function CategoryLegend(props: CategoryLegendProps): ReactElement {
  const { onSelect, selected } = props;

  return (
    <div style={legendStyle}>
      {CATEGORY_ORDER.map((category) => {
        const swatch = categorySwatch(category);
        const label = CATEGORY_LABELS[category];
        const mark = (
          <span style={{ ...swatchStyle, background: swatch.background }} />
        );
        if (onSelect === undefined) {
          return (
            <span key={category} style={itemStyle}>
              {mark}
              {label}
            </span>
          );
        }
        return (
          <button
            key={category}
            type="button"
            aria-pressed={category === selected}
            onClick={() => {
              onSelect(category);
            }}
            style={{
              ...itemStyle,
              ...buttonStyle,
              fontWeight: category === selected ? 700 : 400,
            }}
          >
            {mark}
            {label}
          </button>
        );
      })}
    </div>
  );
}

const legendStyle = {
  color: 'rgb(95 107 124)',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: 11,
  gap: '2px 10px',
} as const satisfies CSSProperties;

const itemStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 4,
} as const satisfies CSSProperties;

const buttonStyle = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  padding: 0,
} as const satisfies CSSProperties;

const swatchStyle = {
  border: '1px solid rgb(255 255 255 / 0.55)',
  borderRadius: 2,
  display: 'inline-block',
  height: 10,
  width: 10,
} as const satisfies CSSProperties;
