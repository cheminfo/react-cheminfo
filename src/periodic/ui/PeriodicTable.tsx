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

import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import type { Swatch } from '../../color/core/scale.ts';
import { categorySwatch } from '../core/categories.ts';
import type { PeriodicElement } from '../core/elements.ts';
import type { ElementRange } from '../core/layout.ts';
import {
  COLUMN_COUNT,
  elementByArrowKey,
  placedElements,
} from '../core/layout.ts';

import { CategoryLegend } from './CategoryLegend.tsx';
import { ElementCell } from './ElementCell.tsx';
import {
  HeaderStrips,
  InnerTransitionMarkers,
} from './PeriodicTableChrome.tsx';

/** What {@link PeriodicTable} needs. */
export interface PeriodicTableProps {
  /**
   * Symbol of the element the tools are pointed at.
   * @default undefined — none is
   */
  selected?: string;
  /**
   * Called with the symbol of the element that was clicked, and by the arrow
   * keys.
   * @default undefined — the table is a figure rather than a control
   */
  onSelect?: (symbol: string) => void;
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
   * Whether an element is inside the set the tool is showing. Everything
   * outside it is dimmed rather than removed, so the table keeps its shape.
   * @default every element is
   */
  isIncluded?: (element: PeriodicElement) => boolean;
  /**
   * Whether to draw the group and period strips.
   * @default false
   */
  headers?: boolean;
  /**
   * Called when a whole group or period header is clicked. Without it the
   * strips are labels rather than buttons.
   * @default undefined
   */
  onSelectRange?: (range: ElementRange) => void;
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
   * Whether the arrow keys walk the table by atomic number.
   * @default true
   */
  keyboard?: boolean;
  /**
   * Called on pointer enter with the symbol, and on leave with `null`.
   * @default undefined
   */
  onHover?: (symbol: string | null) => void;
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
    isIncluded,
    headers = false,
    onSelectRange,
    legend = false,
    markers = true,
    keyboard = true,
    onHover,
  } = props;

  const gridRef = useRef<HTMLDivElement>(null);
  const cameFromKeyRef = useRef(false);
  const offset = headers ? 1 : 0;

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
    onSelect(next.symbol);
  }

  return (
    <div style={rootStyle}>
      <div
        ref={gridRef}
        role="grid"
        aria-label="Periodic table"
        data-testid="periodic-table"
        style={headers ? gridWithHeadersStyle : gridStyle}
        onKeyDown={handleKeyDown}
      >
        {headers ? <HeaderStrips onSelectRange={onSelectRange} /> : null}
        {markers ? <InnerTransitionMarkers offset={offset} /> : null}
        {placedElements().map(({ element, cell }) => (
          <ElementCell
            key={element.symbol}
            atomicNumber={element.atomicNumber}
            symbol={element.symbol}
            name={nameOf(element)}
            detail={detailOf?.(element)}
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

function defaultSwatchOf(element: PeriodicElement): Swatch {
  return categorySwatch(element.category);
}

function defaultNameOf(element: PeriodicElement): string {
  return element.name;
}

function noop(): void {
  // A table with no `onSelect` is a figure; its cells stay buttons so the
  // keyboard and a screen reader still reach every element.
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const baseGridStyle = {
  display: 'grid',
  gap: 2,
  width: '100%',
  // The cells size their type against this box rather than against the page,
  // so the same table reads at 320px beside a chart and at 900px on its own.
  containerType: 'inline-size',
} as const satisfies CSSProperties;

const gridStyle = {
  ...baseGridStyle,
  // The eighth row is the gap the inner-transition series are lifted out into.
  gridTemplateColumns: `repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
  gridTemplateRows:
    'repeat(7, minmax(0, 1fr)) 0.5rem repeat(2, minmax(0, 1fr))',
  aspectRatio: `${String(COLUMN_COUNT)} / 9.7`,
  minWidth: 280,
} as const satisfies CSSProperties;

const gridWithHeadersStyle = {
  ...baseGridStyle,
  // A leading column and a leading row hold the period and group numbers.
  gridTemplateColumns: `1.4rem repeat(${String(COLUMN_COUNT)}, minmax(0, 1fr))`,
  gridTemplateRows:
    '1rem repeat(7, minmax(0, 1fr)) 0.5rem repeat(2, minmax(0, 1fr))',
  aspectRatio: `${String(COLUMN_COUNT + 1.2)} / 10.6`,
  minWidth: 280,
} as const satisfies CSSProperties;
