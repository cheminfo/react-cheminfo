/**
 * One cell of the periodic table: the atomic number, the symbol, and whatever
 * the tool asked to be written under it.
 *
 * A cell is a real `<button>`, so Tab reaches it, Enter and Space activate it,
 * and a screen reader reads the element's name rather than its symbol.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { Swatch } from '../../color/core/scale.ts';

/** What {@link ElementCell} needs to draw one element. */
export interface ElementCellProps {
  /** Atomic number, written small in the corner. */
  atomicNumber: number;
  /** Chemical symbol, the largest thing in the cell. */
  symbol: string;
  /** Full name, which is what the cell is announced as. */
  name: string;
  /** Background, and the ink that stays readable on it. */
  swatch: Swatch;
  /** Column of the grid, one-based. */
  column: number;
  /** Row of the grid, one-based. */
  row: number;
  onSelect: (symbol: string) => void;
  /**
   * Third line, under the symbol: the value the tool is showing.
   * @default '' — nothing is written
   */
  detail?: string;
  /**
   * Whether the cell is the one the tools are pointed at.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the cell is inside the set the tool is showing. Everything outside
   * it is dimmed rather than removed, so the table keeps its shape.
   * @default true
   */
  isIncluded?: boolean;
  /**
   * Called on pointer enter with the symbol, and on leave with `null`.
   * @default undefined
   */
  onHover?: (symbol: string | null) => void;
}

/**
 * A single element of the table.
 * @param props - See {@link ElementCellProps}.
 * @returns The cell.
 */
export function ElementCell(props: ElementCellProps): ReactElement {
  const {
    atomicNumber,
    symbol,
    name,
    swatch,
    column,
    row,
    onSelect,
    detail = '',
    isSelected = false,
    isIncluded = true,
    onHover,
  } = props;

  return (
    <button
      type="button"
      data-testid={`element-${symbol}`}
      data-symbol={symbol}
      aria-label={`${name} (${symbol}, Z = ${String(atomicNumber)})`}
      aria-pressed={isSelected}
      onClick={() => {
        onSelect(symbol);
      }}
      onPointerEnter={() => onHover?.(symbol)}
      onPointerLeave={() => onHover?.(null)}
      style={{
        ...cellStyle,
        gridColumn: column,
        gridRow: row,
        background: swatch.background,
        color: swatch.foreground,
        opacity: isIncluded ? 1 : 0.28,
        // An outline rather than a fill: a table coloured by a property must
        // keep saying what the value is while a cell is selected.
        outline: isSelected ? `2px solid ${swatch.foreground}` : 'none',
        outlineOffset: -3,
      }}
    >
      <span style={numberStyle}>{atomicNumber}</span>
      <span style={symbolStyle}>{symbol}</span>
      {detail === '' ? null : <span style={detailStyle}>{detail}</span>}
    </button>
  );
}

const cellStyle = {
  alignItems: 'center',
  border: '1px solid rgb(255 255 255 / 0.55)',
  borderRadius: 3,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  font: 'inherit',
  justifyContent: 'center',
  lineHeight: 1.05,
  minWidth: 0,
  overflow: 'hidden',
  padding: 1,
  transition: 'opacity 120ms ease',
} as const satisfies CSSProperties;

const numberStyle = {
  alignSelf: 'flex-start',
  fontSize: 'clamp(0.34rem, 1.6cqw, 0.5rem)',
  opacity: 0.8,
  paddingLeft: 2,
} as const satisfies CSSProperties;

const symbolStyle = {
  fontSize: 'clamp(0.55rem, 3.3cqw, 1.05rem)',
  fontWeight: 700,
} as const satisfies CSSProperties;

const detailStyle = {
  fontSize: 'clamp(0.34rem, 1.6cqw, 0.5rem)',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;
