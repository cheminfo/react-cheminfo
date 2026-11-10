import type { ReactNode } from 'react';
import { useCallback } from 'react';

import type { ComponentRow } from '../core/componentRows.ts';
import type { ComponentSortKey } from '../core/sortRows.ts';
import { sortDirection } from '../core/sortRows.ts';
import { highlightsComponent } from '../core/xpsHighlight.ts';

import { ComponentTableRow } from './ComponentTableRow.tsx';
import {
  panelColumnButtonStyle as headerButtonStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelScrollAreaStyle as scrollAreaStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
} from './panelStyles.ts';
import { useLookAtEnergy, useXpsHighlight } from './xpsHighlightContext.ts';

export interface ComponentTableProps {
  /** The rows to draw, already filtered and in the order they are shown. */
  rows: readonly ComponentRow[];
  /** Which spectrum the fit belongs to, so a hover can name the component. */
  spectrumId: string;
  /** The column the rows are ordered by. */
  sortKey: ComponentSortKey;
  /** Whether the smallest comes first. */
  ascending: boolean;
  /** Called with the column whose header was clicked. */
  onSort: (key: ComponentSortKey) => void;
}

/**
 * The fit the file carries, with every header a way to reorder it.
 *
 * Resting on a row fills that component on the chart and stands a guide at its
 * position, which is the only way to read a fit: five overlapping curves under
 * one envelope are indistinguishable until one of them is picked out, and the
 * label in this table is what picks it.
 * @param props - Component props.
 * @returns The table.
 */
export function ComponentTable(props: ComponentTableProps): ReactNode {
  const { rows, spectrumId, sortKey, ascending, onSort } = props;
  const highlight = useXpsHighlight();
  const lookAt = useLookAtEnergy();

  // Stable for the life of the table, so a fresh closure does not invalidate
  // every memoised row on every render.
  const hover = useCallback(
    (row: ComponentRow | null) => {
      lookAt({
        spectrumId: row === null ? null : spectrumId,
        peakId: null,
        componentId: row === null ? null : row.componentId,
        bindingEnergy: row === null ? null : row.bindingEnergy,
      });
    },
    [lookAt, spectrumId],
  );

  return (
    <div style={scrollAreaStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={headerStyle}
                aria-sort={sortDirection(column.key === sortKey, ascending)}
              >
                <button
                  type="button"
                  style={headerButtonStyle}
                  title={column.help}
                  onClick={() => onSort(column.key)}
                >
                  {column.title}
                  {column.key === sortKey ? (ascending ? ' ▲' : ' ▼') : ''}
                </button>
              </th>
            ))}
            <th scope="col" style={headerStyle}>
              <span style={headerTextStyle}>rsf</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ComponentTableRow
              key={row.componentId}
              row={row}
              lit={highlightsComponent(highlight, spectrumId, row.componentId)}
              onHover={hover}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The columns, in the order a fitted peak is judged: what it claims to be, where
 * it sits, how wide it is, and how much of the envelope it took.
 *
 * The sensitivity factor is the one column that does not sort. It is a constant
 * looked up per element, so ordering by it groups the table by element in an
 * order nobody chose — the composition panel is where that number is read.
 */
const COLUMNS = [
  { key: 'label', title: 'component', help: 'Sort by label' },
  { key: 'bindingEnergy', title: 'BE', help: 'Sort by binding energy' },
  { key: 'fwhm', title: 'fwhm', help: 'Sort by width' },
  { key: 'area', title: 'area', help: 'Sort by area' },
] as const satisfies ReadonlyArray<{
  key: ComponentSortKey;
  title: string;
  help: string;
}>;
