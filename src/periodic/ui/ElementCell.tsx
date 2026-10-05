/**
 * One cell of the periodic table: the atomic number, the symbol, and whatever
 * the tool asked to be written under it.
 *
 * A cell is a real `<button>`, so Tab reaches it, Enter and Space activate it,
 * and a screen reader reads the element's name rather than its symbol.
 *
 * Everything written in it is a share of the table's width, so a cell shows
 * the same proportions at 280px beside a chart and across a lecture-hall
 * screen — the table a class reads is the same drawing, larger.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { Swatch } from '../../color/core/interpolate.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

import { UNIT, ofWidth } from './unit.ts';

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
  /** Called with the symbol when the cell is chosen. */
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
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * A single element of the table.
 * @param props - See {@link ElementCellProps}.
 * @returns The cell.
 */
export function ElementCell(props: ElementCellProps): ReactElement {
  const {
    className,
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
  const t = useChromeT();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className={className}
      data-testid={`element-${symbol}`}
      data-symbol={symbol}
      title={detail === '' ? name : `${name} · ${detail}`}
      aria-label={t('periodic.cellLabel', {
        name,
        symbol,
        atomicNumber,
      })}
      aria-pressed={isSelected}
      onClick={() => {
        onSelect(symbol);
      }}
      onPointerEnter={() => {
        setIsHovered(true);
        onHover?.(symbol);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        onHover?.(null);
      }}
      style={{
        ...cellStyle,
        gridColumn: column,
        gridRow: row,
        background: swatch.background,
        color: swatch.foreground,
        opacity: isIncluded ? 1 : 0.28,
        // An outline rather than a fill: a table coloured by a property must
        // keep saying what the value is while a cell is selected.
        outlineStyle: isSelected ? 'solid' : 'none',
        outlineColor: swatch.foreground,
        // Thick enough to be seen from the back of a room, and drawn inside
        // the cell so a neighbour never covers it.
        outlineWidth: `max(2px, ${ofWidth(0.3)})`,
        outlineOffset: `max(-3px, ${ofWidth(-0.4)})`,
        // The cell the pointer is on, for a class following a demonstration.
        filter: isHovered ? 'brightness(1.08)' : undefined,
      }}
    >
      <span style={numberStyle}>{atomicNumber}</span>
      <span
        style={{
          ...symbolStyle,
          fontSize: symbolFontSize(symbol),
        }}
      >
        {symbol}
      </span>
      {detail === '' ? null : (
        <span style={{ ...detailStyle, fontSize: detailFontSize(detail) }}>
          {detail}
        </span>
      )}
    </button>
  );
}

/**
 * The size the symbol is written at.
 *
 * Every symbol is written at the same size, except the widest of them — the
 * ones whose second letter is an `m` — which are written a tenth smaller
 * rather than run into the edges of their cell.
 * @param symbol - The chemical symbol.
 * @returns A CSS length.
 */
function symbolFontSize(symbol: string): string {
  return fitted(symbolWidthInEm(symbol), SYMBOL_CAP, '0.5rem');
}

/**
 * The size the third line takes so the whole of it is written.
 *
 * A value cut short by an ellipsis is a wrong value — `0.0899` read as `0.0…`
 * is worse than not writing it at all — so a long string is written smaller
 * rather than trimmed.
 * @param detail - What the third line says.
 * @returns A CSS length.
 */
function detailFontSize(detail: string): string {
  return fitted(detailWidthInEm(detail), DETAIL_CAP, '0.25rem');
}

/**
 * The largest size a string of the given width fits its cell at.
 *
 * The room a cell leaves is a share of the table's width less its border and
 * its padding, which are the same few pixels at every size — hence the two
 * units in one expression.
 * @param widthInEm - How wide the string is, in ems of its own size.
 * @param cap - The size it is written at when it has room to spare.
 * @param floor - The size under which it is not shrunk any further.
 * @returns A CSS length.
 */
function fitted(widthInEm: number, cap: string, floor: string): string {
  const room = `calc((${UNIT} * ${String(CELL_SHARE)} - ${CELL_CHROME}) / ${widthInEm.toFixed(2)})`;
  return `max(${floor}, min(${cap}, ${room}))`;
}

/**
 * How wide a symbol is, in ems of its own size.
 * @param symbol - The chemical symbol.
 * @returns Its width, never zero.
 */
function symbolWidthInEm(symbol: string): number {
  let width = 0;
  for (const character of symbol) {
    if (character === 'm' || character === 'w') {
      width += 0.95;
    } else if (character >= 'a' && character <= 'z') {
      width += 0.63;
    } else {
      width += 0.85;
    }
  }
  return Math.max(width, 0.85);
}

/**
 * How wide the third line is, in ems of its own size.
 *
 * It is written with tabular figures, where every glyph — the decimal point
 * and the minus of an exponent included — advances the same width, so counting
 * the characters is the measurement.
 * @param detail - What the third line says.
 * @returns Its width, never zero.
 */
function detailWidthInEm(detail: string): number {
  return Math.max(detail.length, 1) * TABULAR_EM;
}

/** What one tabular glyph advances, as a share of its own size. */
const TABULAR_EM = 0.6;

/** The size the symbol is written at wherever it fits, as a share of the table. */
const SYMBOL_CAP = ofWidth(2.4);

/**
 * The tallest the third line is ever written, as a share of the table.
 *
 * Close to two thirds of the symbol: the symbol is how a cell is found, but
 * the value is what the table is being read for, and a value half the size of
 * the symbol is the one thing on the cell a class cannot make out.
 */
const DETAIL_CAP = ofWidth(1.6);

/**
 * The band at each end of a cell: the atomic number at the top, whatever the
 * tool writes at the bottom.
 *
 * They are one length, not two, and that is what makes the symbol between them
 * sit at the centre of the cell rather than near it — a bottom band wider than
 * the top one by a third lifted every symbol in the table two pixels.
 */
const EDGE_BAND = ofWidth(1.8);

/** How wide one column is, in per cent of the table's width. */
const CELL_SHARE = 4.85;

/** What the border and the padding of a cell take off that width. */
const CELL_CHROME = '4px';

/**
 * A cell is three bands of its own, and every cell has all three.
 *
 * The atomic number is in the top band, against its left edge; the symbol is
 * centred in the middle one; whatever the tool writes is centred in the
 * bottom one. The bands keep their height whether or not anything is written
 * in the last of them, so a number sits at one height across the whole table
 * and a symbol at one other — before this, both rode on a stack the cell
 * centred and moved whenever a neighbour's value was written smaller.
 */
const cellStyle = {
  border: '1px solid rgb(255 255 255 / 0.55)',
  borderRadius: 3,
  cursor: 'pointer',
  display: 'grid',
  font: 'inherit',
  gridTemplateRows: `${EDGE_BAND} 1fr ${EDGE_BAND}`,
  justifyItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
  padding: '1px',
  transition: 'opacity 120ms ease, filter 120ms ease',
} as const satisfies CSSProperties;

const numberStyle = {
  alignSelf: 'start',
  fontSize: `max(0.33rem, ${ofWidth(1.1)})`,
  fontVariantNumeric: 'tabular-nums',
  justifySelf: 'start',
  lineHeight: 1,
  opacity: 0.8,
} as const satisfies CSSProperties;

const symbolStyle = {
  alignSelf: 'center',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.02,
} as const satisfies CSSProperties;

const detailStyle = {
  alignSelf: 'center',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  maxWidth: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;
