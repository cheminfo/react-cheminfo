import type { ReactNode } from 'react';
import { useCallback } from 'react';

import type { PeakRow } from '../core/peakRows.ts';
import type { PeakSortKey } from '../core/sortRows.ts';
import { sortDirection } from '../core/sortRows.ts';
import { highlightsPeak } from '../core/xpsHighlight.ts';

import { PeakTableRow } from './PeakTableRow.tsx';
import {
  panelColumnButtonStyle as headerButtonStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelScrollAreaStyle as scrollAreaStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
} from './panelStyles.ts';
import { useLookAtEnergy, useXpsHighlight } from './xpsHighlightContext.ts';

export interface PeakTableProps {
  /** The rows to draw, already filtered and in the order they are shown. */
  rows: readonly PeakRow[];
  /** Which spectrum they were picked from, so a hover can name the peak. */
  spectrumId: string;
  /** Whether the spectrum has a kinetic axis to show a column of. */
  showKinetic: boolean;
  /** The column the rows are ordered by. */
  sortKey: PeakSortKey;
  /** Whether the smallest comes first. */
  ascending: boolean;
  /** Called with the column whose header was clicked. */
  onSort: (key: PeakSortKey) => void;
}

/**
 * The peaks themselves, with every header a way to reorder them.
 *
 * The table scrolls in a region of its own rather than in the panel body, which
 * is what lets the header stay at the top of the rows instead of a few pixels
 * down them, and leaves the count and the filter box above it readable at the
 * two hundredth row.
 *
 * What is being looked at is read once here rather than once per row. Resting on
 * a peak anywhere — this table, the chart, the fit beside it — reports it to
 * everything drawing the same spectra, so a table subscribing row by row would
 * re-render every row on every pixel the pointer travels. Read at the table and
 * handed down as a boolean, only the two rows whose answer changed are redrawn.
 * @param props - Component props.
 * @returns The table.
 */
export function PeakTable(props: PeakTableProps): ReactNode {
  const { rows, spectrumId, showKinetic, sortKey, ascending, onSort } = props;
  const highlight = useXpsHighlight();
  const lookAt = useLookAtEnergy();

  // Stable for the life of the table, so a fresh closure does not invalidate
  // every memoised row on every render.
  const hover = useCallback(
    (row: PeakRow | null) => {
      lookAt({
        spectrumId: row === null ? null : spectrumId,
        peakId: row === null ? null : row.peakId,
        componentId: null,
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
            {COLUMNS.map((column) => {
              const { key, sort, title, help } = column;
              if (key === 'kinetic' && !showKinetic) return null;
              if (sort === null) {
                return (
                  <th key={key} scope="col" style={headerStyle}>
                    <span style={headerTextStyle}>{title}</span>
                  </th>
                );
              }
              return (
                <th
                  key={key}
                  scope="col"
                  style={headerStyle}
                  aria-sort={sortDirection(sort === sortKey, ascending)}
                >
                  <button
                    type="button"
                    style={headerButtonStyle}
                    title={help}
                    onClick={() => onSort(sort)}
                  >
                    {title}
                    {sort === sortKey ? (ascending ? ' ▲' : ' ▼') : ''}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PeakTableRow
              key={row.peakId}
              row={row}
              showKinetic={showKinetic}
              lit={highlightsPeak(highlight, spectrumId, row.peakId)}
              onHover={hover}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The columns, in the order a peak is read: where it is on the axis it is
 * published on, where it is on the axis the instrument measured, how much of it
 * there is, how wide it is, and only then what somebody's table says it could
 * be.
 *
 * The kinetic column does not sort. It is the binding energy subtracted from the
 * photon energy, so ordering by it is ordering by the column beside it
 * backwards — two headers that reordered the table identically would leave the
 * reader hunting for the difference.
 */
const COLUMNS = [
  {
    key: 'binding',
    sort: 'bindingEnergy',
    title: 'BE',
    help: 'Sort by binding energy',
  },
  { key: 'kinetic', sort: null, title: 'KE', help: '' },
  {
    key: 'intensity',
    sort: 'intensity',
    title: 'counts',
    help: 'Sort by the counts at the maximum',
  },
  { key: 'width', sort: 'width', title: 'fwhm', help: 'Sort by width' },
  {
    key: 'element',
    sort: 'element',
    title: 'could be',
    help: 'Sort by the element the lookup offered',
  },
] as const satisfies ReadonlyArray<{
  key: string;
  sort: PeakSortKey | null;
  title: string;
  help: string;
}>;
