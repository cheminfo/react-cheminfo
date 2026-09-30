/**
 * A conformer set, most stable first, as a table one row of which is selected.
 *
 * Two sites read the same set for different reasons — one picks the geometry a
 * calculation runs on, the other reads the ranking itself — so the columns are
 * a prop rather than a variant. Everything else is the same table: rows ordered
 * by energy, one selected, the arrows walking it.
 *
 * The population column is the reason the ranking matters. A share is
 * exponential in the energy gap, so it inherits the error of whatever produced
 * the energies and magnifies it; the caption under the table says which method
 * that was, and `boltzmannConfidence` says what its error is worth. A table
 * that prints a force field's populations without that line is stating a
 * percentage it cannot support.
 */

import { HTMLTable } from '@blueprintjs/core';
import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { formatPercent } from '../../format/core/numbers.ts';
import { handleListNavigationKey } from '../../hooks/ui/listNavigation.ts';
import {
  ROOM_TEMPERATURE,
  boltzmannShares,
} from '../core/conformerBoltzmann.ts';
import type { ConformerRow } from '../core/conformerEnergy.ts';
import { relativeEnergyOf, totalEnergyOf } from '../core/conformerEnergy.ts';
import type { ConformerRanking } from '../core/conformers.ts';

import type { ConformerColumn } from './conformerColumns.ts';
import {
  CONFORMER_COLUMN_LABELS,
  NUMERIC_CONFORMER_COLUMNS,
  PICKER_COLUMNS,
} from './conformerColumns.ts';

/** Props of {@link ConformerTable}. */
export interface ConformerTableProps {
  /** The set, already ordered most stable first. */
  conformers: readonly ConformerRow[];
  /**
   * Which columns to draw, in order.
   * @default PICKER_COLUMNS
   */
  columns?: readonly ConformerColumn[];
  /**
   * Which method's energies every column reads.
   * @default 'force-field'
   */
  ranking?: ConformerRanking;
  /**
   * The selected conformer's id, or `null` when none is.
   * @default null
   */
  selectedId?: number | null;
  /** Called with the id of the row the reader picked. */
  onSelect?: (id: number) => void;
  /**
   * Temperature the shares are quoted at, in kelvin.
   * @default ROOM_TEMPERATURE
   */
  temperature?: number;
  /**
   * Accessible name of the table.
   * @default 'Conformers, most stable first'
   */
  label?: string;
  /**
   * What the `id` column says for a conformer. A dense table wants the bare
   * rank; a picker in a narrow column reads better naming the thing.
   * @default String — the rank on its own
   */
  rowName?: (id: number) => string;
  /**
   * Headings to use instead of the default ones, per column.
   * @default undefined — every column keeps its own
   */
  columnLabels?: Partial<Record<ConformerColumn, string>>;
}

/**
 * The conformers of a set, as a selectable table.
 *
 * The arrows walk the rows once the table has the focus, rather than from
 * anywhere on the page: a conformer list usually sits beside a drawing surface
 * or a 3D canvas, both of which read the arrows themselves.
 * @param props - See {@link ConformerTableProps}.
 * @returns The table, or `null` when there is nothing to show.
 */
export function ConformerTable(
  props: ConformerTableProps,
): ReactElement | null {
  const {
    conformers,
    columns = PICKER_COLUMNS,
    ranking = 'force-field',
    selectedId = null,
    onSelect,
    temperature = ROOM_TEMPERATURE,
    label = 'Conformers, most stable first',
    rowName = String,
    columnLabels,
  } = props;

  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const shares = useMemo(() => {
    if (!columns.includes('population')) return [];
    const energies = new Array<number | null>(conformers.length);
    for (let index = 0; index < conformers.length; index++) {
      const conformer = conformers[index];
      energies[index] =
        conformer === undefined ? null : relativeEnergyOf(conformer, ranking);
    }
    return boltzmannShares(energies, temperature);
  }, [conformers, columns, ranking, temperature]);

  const largestShare = useMemo(() => {
    let largest = 0;
    for (const share of shares) {
      if (share != null && share > largest) largest = share;
    }
    return largest;
  }, [shares]);

  // The picked row is brought into view rather than left under the fold, which
  // is what makes walking a long set with the arrows usable.
  useEffect(() => {
    if (bodyRef.current === null || selectedId === null) return;
    bodyRef.current
      .querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  if (conformers.length === 0) return null;

  function onKeyDown(event: KeyboardEvent<HTMLTableSectionElement>): void {
    if (onSelect === undefined) return;
    handleListNavigationKey(event, {
      length: conformers.length,
      selectedIndex: conformers.findIndex(
        (conformer) => conformer.id === selectedId,
      ),
      onSelect: (index) => {
        const conformer = conformers[index];
        if (conformer !== undefined) onSelect(conformer.id);
      },
    });
  }

  return (
    <HTMLTable compact interactive striped style={tableStyle}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} style={headerStyle(column)}>
              {columnLabels?.[column] ?? CONFORMER_COLUMN_LABELS[column]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody
        ref={bodyRef}
        onKeyDown={onKeyDown}
        // Reached by Tab and then walked with the arrows: the surfaces beside a
        // conformer list read the arrows themselves.
        tabIndex={onSelect === undefined ? undefined : 0}
        role="listbox"
        aria-label={label}
      >
        {conformers.map((conformer, index) => {
          const active = conformer.id === selectedId;
          const copyableHere = onSelect === undefined || active;
          return (
            <tr
              key={conformer.id}
              data-testid="conformer-row"
              data-conformer-id={String(conformer.id)}
              role="option"
              aria-selected={active}
              // `aria-selected` is the contract for a reader; `data-selected`
              // is the one an end-to-end suite can select on without asserting
              // against the accessibility tree.
              data-selected={active ? 'true' : 'false'}
              style={rowStyle(active, onSelect !== undefined)}
              onClick={() => onSelect?.(conformer.id)}
            >
              {columns.map((column) => {
                const content = cellContent(
                  column,
                  conformer,
                  ranking,
                  shares[index] ?? null,
                  largestShare,
                  rowName,
                );
                // An energy is a value a reader takes away; a rank and a bar
                // are not. A copy stops the click at the cell, so only the row
                // already selected offers one: on any other row the click has
                // to reach the row and select it, which is what a reader means
                // by clicking a conformer they are not on.
                return copyableHere &&
                  COPY_LABELS[column] !== undefined &&
                  typeof content === 'string' &&
                  content !== '—' ? (
                  <ClickToCopy
                    key={column}
                    as="td"
                    style={cellStyle(column)}
                    value={content}
                    label={COPY_LABELS[column]}
                    testId={CELL_TEST_IDS[column]}
                  >
                    {content}
                  </ClickToCopy>
                ) : (
                  <td
                    key={column}
                    style={cellStyle(column)}
                    data-testid={CELL_TEST_IDS[column]}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </HTMLTable>
  );
}

/**
 * What a copyable column is called in the hover title, and which columns are
 * copyable at all.
 *
 * Only the relative energy: it is the number a chemist reads off the set and
 * quotes elsewhere. A total force-field energy is an internal quantity nobody
 * pastes, and a rank and a share are read on the page rather than taken away.
 */
const COPY_LABELS: Partial<Record<ConformerColumn, string>> = {
  relative: 'relative energy in kcal/mol',
};

/**
 * A stable hook per cell, so a suite can read one column without counting
 * table cells — which changes the moment a column is added.
 */
const CELL_TEST_IDS: Record<ConformerColumn, string> = {
  id: 'conformer-id',
  population: 'conformer-population',
  relative: 'conformer-relative-energy',
  total: 'conformer-total-energy',
  forceFieldRelative: 'conformer-force-field-relative',
  forceFieldRank: 'conformer-force-field-rank',
};

/**
 * The share of a conformer, drawn as a bar.
 *
 * It takes its colour from the row it sits in — `currentColor` — so it is
 * legible on a plain row and on the selected one without a rule per state.
 *
 * It is drawn against the largest share rather than against the whole: the
 * column is narrow, and against the whole a set of twelve near-equal conformers
 * would be twelve bars of three pixels.
 * @param props - The share to draw, against the largest one in the set.
 * @param props.share - The share from 0 to 1, or `null` when there is no energy.
 * @param props.largest - The largest share in the set, which is the full width.
 * @returns The bar.
 */
function ShareBar(props: {
  share: number | null;
  largest: number;
}): ReactElement {
  const { share, largest } = props;
  const width =
    share === null || largest <= 0
      ? 0
      : Math.max(0, Math.min(1, share / largest)) * 100;
  return (
    <span style={barTrackStyle} aria-hidden="true">
      <span style={{ ...barFillStyle, width: `${width}%` }} />
    </span>
  );
}

function cellContent(
  column: ConformerColumn,
  conformer: ConformerRow,
  ranking: ConformerRanking,
  share: number | null,
  largest: number,
  rowName: (id: number) => string,
): ReactElement | string {
  switch (column) {
    case 'id':
      return rowName(conformer.id);
    case 'population':
      return (
        <span style={populationStyle}>
          <ShareBar share={share} largest={largest} />
          <span>{shareLabel(share)}</span>
        </span>
      );
    case 'relative':
      return energyLabel(relativeEnergyOf(conformer, ranking));
    case 'total':
      return energyLabel(totalEnergyOf(conformer, ranking));
    case 'forceFieldRelative':
      return energyLabel(conformer.relativeEnergy);
    case 'forceFieldRank':
      return conformer.refinement == null
        ? '—'
        : String(conformer.refinement.forceFieldId);
    default:
      return '—';
  }
}

/**
 * The share of molecules in a conformer, as a percentage.
 *
 * A share that rounds to zero is written as `<0.1 %` instead: a conformer the
 * search found and kept is populated by something, and `0 %` says it is not.
 * @param share - The share from 0 to 1, or `null` when there is no energy.
 * @returns The percentage, or a dash when it cannot be worked out.
 */
function shareLabel(share: number | null): string {
  if (share === null) return '—';
  if (share > 0 && share < 0.001) return '<0.1 %';
  return formatPercent(share);
}

/**
 * The energy to two decimals, or a dash when there is none.
 *
 * The unit is in the column header rather than in every cell, so the numbers
 * line up and a row stays readable in a narrow panel.
 * @param energy - kcal/mol, or `null`.
 * @returns The label.
 */
function energyLabel(energy: number | null): string {
  if (energy === null) return '—';
  if (Math.abs(energy) < ENERGY_RESOLUTION) return '0.00';
  return energy > 0 ? `+${energy.toFixed(2)}` : energy.toFixed(2);
}

/**
 * Below this, two force-field energies are the same number to anyone reading
 * them, and the duplicate-minimum test upstream has already decided they are
 * distinct shapes.
 */
const ENERGY_RESOLUTION = 0.005;

function headerStyle(column: ConformerColumn): CSSProperties | undefined {
  return NUMERIC_CONFORMER_COLUMNS.has(column) ? numericStyle : undefined;
}

function cellStyle(column: ConformerColumn): CSSProperties | undefined {
  return NUMERIC_CONFORMER_COLUMNS.has(column) ? numericStyle : undefined;
}

const tableStyle = { width: '100%' } as const satisfies CSSProperties;

const numericStyle = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

/**
 * The selected row is tinted with the site's own accent, so the table belongs
 * to whichever site draws it; a row is a pointer only where a click does
 * something.
 * @param active - Whether this row is the selected one.
 * @param selectable - Whether a click selects a row at all.
 * @returns The row's inline style, or `undefined` when it needs none.
 */
function rowStyle(
  active: boolean,
  selectable: boolean,
): CSSProperties | undefined {
  if (active) return selectable ? SELECTED_ROW : SELECTED_ROW_STATIC;
  return selectable ? SELECTABLE_ROW : undefined;
}

const SELECTED_ROW_STATIC = {
  background: 'color-mix(in oklab, var(--accent) 12%, white)',
  fontWeight: 600,
} as const satisfies CSSProperties;

const SELECTED_ROW = {
  ...SELECTED_ROW_STATIC,
  cursor: 'pointer',
} as const satisfies CSSProperties;

const SELECTABLE_ROW = { cursor: 'pointer' } as const satisfies CSSProperties;

const populationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

/**
 * The track is tinted with `color-mix` rather than `opacity`, which the fill
 * would inherit: an opacity on the track composites its child too, so the bar
 * would be as faint as the groove it sits in.
 */
const barTrackStyle = {
  display: 'block',
  flex: '1 1 auto',
  minWidth: 24,
  height: 5,
  borderRadius: 3,
  backgroundColor: 'color-mix(in srgb, currentColor 22%, transparent)',
  overflow: 'hidden',
} as const satisfies CSSProperties;

const barFillStyle = {
  display: 'block',
  height: '100%',
  borderRadius: 3,
  backgroundColor: 'currentColor',
} as const satisfies CSSProperties;
