/**
 * A key of named colours: a swatch and a label each, plain or hatched. The
 * periodic table's families are one; a table coloured by any other reading of
 * the elements gives its own entries.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { hatchedBackground } from '../core/hatch.ts';
import type { Swatch } from '../core/interpolate.ts';

/** One colour of the key. */
export interface SwatchLegendEntry {
  /** Names the entry to `onSelect` and `selected`. */
  key: string;
  /** What the colour means. */
  label: ReactNode;
  /** The colour, and the ink written on it, which a hatch is drawn in. */
  swatch: Swatch;
  /**
   * Whether the swatch is drawn hatched, as the cells it stands for are.
   * @default false
   */
  hatched?: boolean;
}

/** What {@link SwatchLegend} needs. */
export interface SwatchLegendProps {
  /** The colours, in the order they are read. */
  entries: readonly SwatchLegendEntry[];
  /**
   * Called with the key of the entry clicked. Without it the legend is a key
   * rather than a control, and nothing in it is focusable.
   * @default undefined
   */
  onSelect?: (key: string) => void;
  /**
   * The key of the entry drawn as the active one.
   * @default undefined — none is
   */
  selected?: string;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The key to a set of colours.
 * @param props - See {@link SwatchLegendProps}.
 * @returns The legend.
 */
export function SwatchLegend(props: SwatchLegendProps): ReactElement {
  const { entries, className, onSelect, selected } = props;
  return (
    <div className={className} style={legendStyle}>
      {entries.map((entry) => {
        const mark = (
          <span
            data-hatched={entry.hatched ? 'true' : undefined}
            style={{ ...swatchStyle, background: swatchBackground(entry) }}
          />
        );
        if (onSelect === undefined) {
          return (
            <span key={entry.key} style={itemStyle}>
              {mark}
              {entry.label}
            </span>
          );
        }
        return (
          <button
            key={entry.key}
            type="button"
            aria-pressed={entry.key === selected}
            onClick={() => {
              onSelect(entry.key);
            }}
            style={{
              ...itemStyle,
              ...buttonStyle,
              fontWeight: entry.key === selected ? 700 : 400,
            }}
          >
            {mark}
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}

function swatchBackground(entry: SwatchLegendEntry): string {
  const { swatch, hatched = false } = entry;
  return hatched
    ? hatchedBackground(swatch.background, swatch.foreground, '2px')
    : swatch.background;
}

const legendStyle = {
  color: TOKEN.textMuted,
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
