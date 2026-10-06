/**
 * The periodic table.
 *
 * It knows nothing about what it is showing: the caller says what colour each
 * cell takes and what is written in it, and gets back which element was
 * clicked. That is what lets the same grid be an element picker, a property
 * map, and a chart's selection control.
 *
 * Everything site-specific arrives through a callback keyed on the element, so
 * a site's own richer element record never has to cross into this component.
 */

import type {
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from 'react';
import { useEffect, useRef } from 'react';

import type { Swatch } from '../../color/core/interpolate.ts';
import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { categorySwatch } from '../core/categories.ts';
import type { PeriodicElement } from '../core/elements.ts';
import type { ElementPick, ElementRange } from '../core/layout.ts';
import {
  COLUMN_COUNT,
  EMPTY_BLOCK,
  elementByArrowKey,
  placedElements,
} from '../core/layout.ts';

import { CategoryLegend } from './CategoryLegend.tsx';
import { ElementCell } from './ElementCell.tsx';
import {
  HeaderStrips,
  InnerTransitionMarkers,
} from './PeriodicTableChrome.tsx';
import {
  ROW_SHARE,
  SHELLS_RESERVED,
  detailType,
  shellFontSize,
  textWidthInEm,
} from './cellType.ts';
import { UNIT_PROPERTY, ofWidth, unitValue } from './unit.ts';

/** What {@link PeriodicTable} needs. */
export interface PeriodicTableProps {
  /**
   * Symbol of the element the tools are pointed at.
   * @default undefined — none is
   */
  selected?: string;
  /**
   * Called with the symbol of the element that was clicked, and by the arrow
   * keys. The pick says whether the click was additive — Cmd or Ctrl held — so
   * a tool whose plain click already reads one element into a card can let the
   * same table build a set of them.
   * @default undefined — the table is a figure rather than a control
   */
  onSelect?: (symbol: string, pick: ElementPick) => void;
  /**
   * The colour each cell takes.
   * @default the family colour
   */
  swatchOf?: (element: PeriodicElement) => Swatch;
  /**
   * What is written under the symbol; an empty string writes nothing.
   * @default nothing is written
   */
  detailOf?: (element: PeriodicElement) => string;
  /**
   * How an element is named, for the label a screen reader reads. The hook a
   * site translating the table writes its own names through.
   * @default the English name
   */
  nameOf?: (element: PeriodicElement) => string;
  /**
   * Electrons in each shell of an element, innermost first, written down the
   * right-hand edge of its cell. The energy levels, which a table is also read
   * for: none of ours knows them, so the tool that does says so here.
   * @default undefined — no cell writes any
   */
  shellsOf?: (element: PeriodicElement) => readonly number[] | undefined;
  /**
   * Whether an element is inside the set the tool is showing. Everything
   * outside it is dimmed rather than removed, so the table keeps its shape.
   * @default every element is
   */
  isIncluded?: (element: PeriodicElement) => boolean;
  /**
   * What is written in the block the table leaves empty — columns 3 to 12 of
   * the first three periods, in the middle of the top edge. A tool that reads
   * one element off the table puts what it says about it there, where the eye
   * already is, rather than under the grid.
   *
   * It is sized against the table, like everything else in the grid, so give
   * it type in `em` and it scales with the drawing.
   * @default undefined — the block stays empty
   */
  inset?: ReactNode;
  /**
   * Whether to draw the group and period strips.
   * @default false
   */
  headers?: boolean;
  /**
   * Called when a whole group or period header is clicked. The run says
   * whether the click was additive — Cmd or Ctrl held — so a tool can let a
   * reader put two periods on one chart. Without it the strips are labels
   * rather than buttons.
   * @default undefined
   */
  onSelectRange?: (range: ElementRange) => void;
  /**
   * Called when the corner where the two header strips meet is clicked, which
   * is how a reader takes the whole table back. Without it the corner stays
   * empty.
   * @default undefined
   */
  onSelectAll?: () => void;
  /**
   * Whether to draw the family legend under the grid.
   * @default false
   */
  legend?: boolean;
  /**
   * Whether the dashed markers stand where the two inner-transition series were
   * lifted out of the main block.
   * @default true
   */
  markers?: boolean;
  /**
   * Whether the arrow keys walk the grid: down from carbon is silicon, and
   * right from the end of a period is the start of the next.
   * @default true
   */
  keyboard?: boolean;
  /**
   * Called on pointer enter with the symbol, and on leave with `null`.
   * @default undefined
   */
  onHover?: (symbol: string | null) => void;
  /**
   * Class of the outermost element.
   * @default undefined
   */
  className?: string;
}

/**
 * The 118 elements, laid out as the table.
 * @param props - See {@link PeriodicTableProps}.
 * @returns The grid, its optional chrome, and its optional legend.
 */
export function PeriodicTable(props: PeriodicTableProps): ReactElement {
  const {
    selected,
    onSelect,
    swatchOf = defaultSwatchOf,
    detailOf,
    nameOf = defaultNameOf,
    shellsOf,
    isIncluded,
    inset,
    headers = false,
    onSelectRange,
    onSelectAll,
    legend = false,
    markers = true,
    keyboard = true,
    onHover,
    className,
  } = props;

  const t = useChromeT();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cameFromKeyRef = useRef(false);
  const offset = headers ? 1 : 0;

  // The drawing is read off this one number, so it is written straight onto
  // the element rather than held as state: a window being dragged would
  // otherwise re-render all 118 cells per frame, and the engine recomputes
  // every length from the custom property on its own. A width of zero is a
  // table in a tab nobody has opened; the last measurement stands until it is
  // shown, and the observer fires again then.
  useResizeObserver(rootRef, ({ width }) => {
    if (width === 0) return;
    rootRef.current?.style.setProperty(UNIT_PROPERTY, unitValue(width));
  });

  useEffect(() => {
    if (!cameFromKeyRef.current) return;
    cameFromKeyRef.current = false;
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-symbol="${CSS.escape(selected ?? '')}"]`,
    );
    cell?.focus();
    cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!keyboard || onSelect === undefined) return;
    const next = elementByArrowKey(event.key, selected);
    if (next === null) return;
    event.preventDefault();
    cameFromKeyRef.current = true;
    onSelect(next.symbol, PLAIN_PICK);
  }

  // One size for the whole table rather than one per cell: a column of values
  // written at eleven sizes is read as eleven things, and a name shrunk to a
  // third of its neighbour's is the one a class cannot make out. The size is
  // what the widest of them fits at, and anything wider than that is condensed
  // by the cell rather than written smaller still.
  const placed = placedElements();
  const widths: number[] = [];
  let deepest = 0;
  for (const { element } of placed) {
    widths.push(textWidthInEm(detailOf?.(element) ?? ''));
    const stack = shellsOf?.(element);
    if (stack !== undefined && stack.length > deepest) deepest = stack.length;
  }
  const reserved = deepest === 0 ? 0 : SHELLS_RESERVED;
  const type = detailType(widths, reserved);
  const shellSize = shellFontSize(deepest);

  return (
    <div ref={rootRef} className={className} style={rootStyle}>
      <div
        ref={gridRef}
        role="grid"
        aria-label={t('periodic.table')}
        data-testid="periodic-table"
        style={gridStyle(headers)}
        onKeyDown={handleKeyDown}
      >
        {headers ? (
          <HeaderStrips
            onSelectRange={onSelectRange}
            onSelectAll={onSelectAll}
          />
        ) : null}
        {inset === undefined ? null : (
          <div style={insetStyle(offset)}>{inset}</div>
        )}
        {markers ? <InnerTransitionMarkers offset={offset} /> : null}
        {placed.map(({ element, cell }) => (
          <ElementCell
            key={element.symbol}
            atomicNumber={element.atomicNumber}
            symbol={element.symbol}
            name={nameOf(element)}
            detail={detailOf?.(element)}
            detailType={type}
            shells={shellsOf?.(element)}
            shellSize={shellSize}
            swatch={swatchOf(element)}
            isSelected={element.symbol === selected}
            isIncluded={isIncluded?.(element)}
            column={cell.column + offset}
            row={cell.row + offset}
            onSelect={onSelect ?? noop}
            onHover={onHover}
          />
        ))}
      </div>
      {legend ? <CategoryLegend /> : null}
    </div>
  );
}

/**
 * Where what the caller writes in the empty block is placed.
 * @param offset - 1 when the table draws its header strips, 0 otherwise.
 * @returns The style of the slot.
 */
function insetStyle(offset: number): CSSProperties {
  return {
    alignItems: 'center',
    display: 'flex',
    // A column of air on each side, so the writing reads as sitting in the
    // block rather than as running into the cells beside it.
    padding: `0 ${ofWidth(2.4)}`,
    gridColumn: `${String(EMPTY_BLOCK.column + offset)} / span ${String(EMPTY_BLOCK.columnSpan)}`,
    gridRow: `${String(EMPTY_BLOCK.row + offset)} / span ${String(EMPTY_BLOCK.rowSpan)}`,
    // A share of the table, with a floor, exactly as a cell sizes its symbol:
    // the block holds the same three rows at every width, so what is written
    // in it has to shrink with them.
    fontSize: `max(0.6rem, ${ofWidth(1.8)})`,
    lineHeight: 1.35,
    minWidth: 0,
    overflow: 'hidden',
  };
}

function defaultSwatchOf(element: PeriodicElement): Swatch {
  return categorySwatch(element.category);
}

function defaultNameOf(element: PeriodicElement): string {
  return element.name;
}

/** The arrow keys walk the table to read it; they never add to a set. */
const PLAIN_PICK: ElementPick = { additive: false };

function noop(): void {
  // A table with no `onSelect` is a figure; its cells stay buttons so the
  // keyboard and a screen reader still reach every element.
}

/** Narrowest the table is ever drawn; under it the type stops being readable. */
const MIN_WIDTH = 280;

/**
 * How tall one row of elements is, as a share of the table's width.
 *
 * A column is about 5.2% of that width, so a cell is a third taller than it is
 * wide — the proportion of a wall chart, and the room the three bands of a
 * cell need to be read from the back of a room. It is the same height in every
 * table: a cell keeps the band it writes a value in whether or not that table
 * writes one.
 */
const ROW_HEIGHT = ofWidth(ROW_SHARE);

/** The band the two inner-transition series were lifted out across. */
const SERIES_GAP = `max(6px, ${ofWidth(1.1)})`;

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: MIN_WIDTH,
  // Everything inside — the height of a row as much as the type in a cell — is
  // a share of this box rather than of the page, so the same table reads at
  // 280px beside a chart and fills a lecture-hall screen at twice that. The
  // share is measured (see `unit.ts`); the container is what the `1cqw`
  // fallback and a site's own `@container` rules are answered by, and it keeps
  // this box's width independent of what is written inside it.
  containerType: 'inline-size',
} as const satisfies CSSProperties;

const baseGridStyle = {
  display: 'grid',
  gap: 2,
  minWidth: MIN_WIDTH,
  width: '100%',
} as const satisfies CSSProperties;

/**
 * The grid the cells are placed on.
 * @param headers - Whether a leading column and row hold the period and group
 * numbers.
 * @returns The style of the grid.
 */
function gridStyle(headers: boolean): CSSProperties {
  // The eighth row is the gap the inner-transition series are lifted out into.
  const rows = `repeat(7, ${ROW_HEIGHT}) ${SERIES_GAP} repeat(2, ${ROW_HEIGHT})`;
  if (!headers) {
    return {
      ...baseGridStyle,
      gridTemplateColumns: `repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
      gridTemplateRows: rows,
    };
  }
  return {
    ...baseGridStyle,
    gridTemplateColumns: `max(14px, ${ofWidth(2.4)}) repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
    gridTemplateRows: `max(12px, ${ofWidth(2)}) ${rows}`,
  };
}
