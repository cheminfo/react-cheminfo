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

import type { KeyboardEvent, ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import type { Swatch } from '../../color/core/interpolate.ts';
import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { categorySwatch } from '../core/categories.ts';
import type { PeriodicElement } from '../core/elements.ts';
import type { ElementPick } from '../core/layout.ts';
import { elementByArrowKey, placedElements } from '../core/layout.ts';

import { BlockStrip } from './BlockStrip.tsx';
import { CategoryLegend } from './CategoryLegend.tsx';
import { ElementCell } from './ElementCell.tsx';
import {
  HeaderStrips,
  InnerTransitionMarkers,
} from './PeriodicTableChrome.tsx';
import {
  SHELLS_RESERVED,
  detailType,
  shellFontSize,
  textWidthInEm,
} from './cellType.ts';
import type { PeriodicTableProps } from './periodicTableProps.ts';
import { gridStyle, insetStyle, rootStyle } from './tableLayout.ts';
import { UNIT_PROPERTY, unitValue } from './unit.ts';

export type { PeriodicTableProps } from './periodicTableProps.ts';

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
  const blocks = headers && onSelectRange !== undefined;

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
    <div
      ref={rootRef}
      className={className}
      // Drawn in HTML so every cell is a button, and saved by being painted
      // from where the browser put it: a site saves the table by pointing
      // `FigureDownload` at any box around it.
      data-figure="html"
      style={rootStyle}
    >
      <div
        ref={gridRef}
        role="grid"
        aria-label={t('periodic.table')}
        data-testid="periodic-table"
        style={gridStyle(headers, blocks)}
        onKeyDown={handleKeyDown}
      >
        {headers ? (
          <HeaderStrips
            onSelectRange={onSelectRange}
            onSelectAll={onSelectAll}
          />
        ) : null}
        {blocks ? <BlockStrip onSelectRange={onSelectRange} /> : null}
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
