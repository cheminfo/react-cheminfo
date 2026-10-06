/**
 * One cell of the periodic table: the atomic number, the symbol, whatever the
 * tool asked to be written under it, and — when the tool asks for them — the
 * electrons of each shell down the right-hand edge.
 *
 * A cell is a real `<button>`, so Tab reaches it, Enter and Space activate it,
 * and a screen reader reads the element's name rather than its symbol.
 *
 * Everything written in it is a share of the table's width, so a cell shows
 * the same proportions at 280px beside a chart and across a lecture-hall
 * screen — the table a class reads is the same drawing, larger.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';

import type { Swatch } from '../../color/core/interpolate.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ElementPick } from '../core/layout.ts';

import {
  SHELLS_AIR,
  SHELLS_COLUMN,
  cellStyle,
  detailStyle,
  numberStyle,
  shellsStyle,
  symbolStyle,
} from './cellStyles.ts';
import type { DetailType } from './cellType.ts';
import {
  SHELLS_RESERVED,
  SYMBOL_CAP,
  condensedScale,
  detailType,
  scaleX,
  shellFontSize,
  symbolFontSize,
  textWidthInEm,
} from './cellType.ts';
import { ofWidth } from './unit.ts';

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
  /**
   * Called with the symbol when the cell is chosen, and with what the click
   * asked for: a plain one, or an additive one — Cmd or Ctrl held.
   */
  onSelect: (symbol: string, pick: ElementPick) => void;
  /**
   * Third line, under the symbol: the value the tool is showing.
   * @default '' — nothing is written
   */
  detail?: string;
  /**
   * The size that line is written at, from {@link detailType}, so a whole
   * table writes it at one size rather than each cell at its own.
   * @default the largest size this cell's own line fits at
   */
  detailType?: DetailType;
  /**
   * Electrons in each shell, innermost first, written down the right-hand
   * edge.
   * @default undefined — nothing is written there
   */
  shells?: readonly number[];
  /**
   * The size they are written at, so the deepest stack in the table fits its
   * cell and every other is written to match.
   * @default the size this cell's own stack fits at
   */
  shellSize?: string;
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
    shells,
    isSelected = false,
    isIncluded = true,
    onHover,
  } = props;
  const t = useChromeT();
  const [isHovered, setIsHovered] = useState(false);

  const detailWidth = textWidthInEm(detail);
  const reserved = shells === undefined ? 0 : SHELLS_RESERVED;
  const type = props.detailType ?? detailType([detailWidth], reserved);
  const shellSize = props.shellSize ?? shellFontSize(shells?.length ?? 0);

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
      onClick={(event) => {
        onSelect(symbol, { additive: event.metaKey || event.ctrlKey });
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
        // The electrons stand in a column of their own, so the symbol keeps
        // the left of the cell rather than being pushed off its centre.
        gridTemplateColumns:
          shells === undefined ? '1fr' : `1fr ${SHELLS_COLUMN}`,
        columnGap: shells === undefined ? undefined : SHELLS_AIR,
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
          fontSize: symbolFontSize(symbol, SYMBOL_CAP, reserved),
        }}
      >
        {symbol}
      </span>
      {detail === '' ? null : (
        <span
          style={{
            ...detailStyle,
            fontSize: type.size,
            // Condensed rather than written smaller, so every cell of the
            // table says its name and its value in one type.
            transform: scaleX(condensedScale(detailWidth, type, reserved)),
          }}
        >
          {detail}
        </span>
      )}
      {shells === undefined ? null : (
        <span style={{ ...shellsStyle, fontSize: shellSize }}>
          {shells.join('\n')}
        </span>
      )}
    </button>
  );
}
