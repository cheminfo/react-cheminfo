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
import type { KeyboardEvent, ReactElement } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { handleListNavigationKey } from '../../hooks/ui/listNavigation.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import {
  ROOM_TEMPERATURE,
  boltzmannShares,
} from '../core/conformerBoltzmann.ts';
import type { ConformerRow } from '../core/conformerEnergy.ts';
import { relativeEnergyOf } from '../core/conformerEnergy.ts';
import type { ConformerRanking } from '../core/conformerTypes.ts';

import { cellContent } from './conformerCells.tsx';
import type { ConformerColumn } from './conformerColumns.ts';
import {
  CONFORMER_COLUMN_KEYS,
  CONFORMER_COLUMN_LABELS,
  PICKER_COLUMNS,
} from './conformerColumns.ts';
import {
  CELL_TEST_IDS,
  COPY_LABELS,
  cellStyle,
  headerStyle,
  rowStyle,
  tableStyle,
} from './conformerTableStyles.ts';

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
   * @default 'Conformers, most stable first', in the page's language
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
  /**
   * Whether the energies on screen are expected to be replaced — a force
   * field's numbers while a better method is still working on the set. They
   * are then drawn muted, so a reader can tell at a glance which of the two
   * rankings they are looking at.
   * @default false
   */
  provisional?: boolean;
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
    label,
    rowName = String,
    columnLabels,
    provisional = false,
  } = props;

  const t = useChromeT();
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
              {columnLabels?.[column] ??
                t.or(
                  CONFORMER_COLUMN_KEYS[column],
                  CONFORMER_COLUMN_LABELS[column],
                )}
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
        aria-label={label ?? t('conformers.table.label')}
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
                    style={cellStyle(column, provisional)}
                    value={content}
                    label={t(COPY_LABELS[column])}
                    testId={CELL_TEST_IDS[column]}
                  >
                    {content}
                  </ClickToCopy>
                ) : (
                  <td
                    key={column}
                    style={cellStyle(column, provisional)}
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
