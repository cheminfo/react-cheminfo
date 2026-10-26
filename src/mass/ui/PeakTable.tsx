import { memo, useMemo, useRef } from 'react';

import {
  panelCellStyle,
  panelColumnButtonStyle,
  panelNumberCellStyle,
  panelScrollAreaStyle,
  panelStickyHeaderStyle,
  panelTableStyle,
} from '../../panel/core/panelStyles.ts';
import { useVirtualRows } from '../../panel/ui/useVirtualRows.ts';
import type { MassPeakObject } from '../core/centroidPeaks.ts';
import { formatIntensity, formatMz } from '../core/massFormat.ts';

/** Which column the rows are read in the order of. */
export type PeakSortKey = 'mz' | 'intensity';

export interface PeakTableProps {
  /** The peaks to list, in increasing m/z. */
  peaks: readonly MassPeakObject[];
  /** How many decimals the masses are written with. */
  mzDecimals: number;
  /**
   * Which column the rows are in the order of: m/z ascending, which is how a
   * spectrum is read, or intensity descending, which is how its base peak and
   * its neighbours are found.
   */
  sortKey: PeakSortKey;
  /** Order the rows by a column. */
  onSort: (key: PeakSortKey) => void;
  /** The m/z of the peak the pointer is resting on, `null` for none. */
  highlightMz: number | null;
  /** Told which peak a row the pointer rests on is, `null` when it leaves. */
  onHighlight: (mz: number | null) => void;
  /** Frame a peak on the chart. */
  onPick: (mz: number) => void;
}

/**
 * The peaks, one row each, under a header that sorts them.
 *
 * Only the rows in view are drawn: a table opened onto a whole Orbitrap scan is
 * a thousand rows, and every one of them would otherwise be laid out again on
 * every hover of the chart beside it.
 * @param props - Component props.
 * @returns The table.
 */
export function PeakTable(props: PeakTableProps) {
  const {
    peaks,
    mzDecimals,
    sortKey,
    onSort,
    highlightMz,
    onHighlight,
    onPick,
  } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  const ordered = useMemo(
    () =>
      sortKey === 'mz'
        ? peaks
        : peaks.toSorted((first, second) => second.y - first.y),
    [peaks, sortKey],
  );
  const rows = useVirtualRows(scrollRef, ordered.length, ROW_HEIGHT);
  const showsCharge = useMemo(
    () => peaks.some((peak) => peak.charge !== 0),
    [peaks],
  );

  return (
    <div ref={scrollRef} style={panelScrollAreaStyle}>
      <table style={panelTableStyle}>
        <thead>
          <tr>
            <th style={panelStickyHeaderStyle}>
              <button
                type="button"
                style={panelColumnButtonStyle}
                onClick={() => onSort('mz')}
              >
                m/z{sortKey === 'mz' ? ' ▲' : ''}
              </button>
            </th>
            <th style={panelStickyHeaderStyle}>
              <button
                type="button"
                style={panelColumnButtonStyle}
                onClick={() => onSort('intensity')}
              >
                intensity{sortKey === 'intensity' ? ' ▼' : ''}
              </button>
            </th>
            {showsCharge ? (
              <th style={panelStickyHeaderStyle}>
                <span style={panelColumnButtonStyle}>z</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody onPointerLeave={() => onHighlight(null)}>
          {rows.before > 0 ? <tr style={{ height: rows.before }} /> : null}
          {rows.indices.map((index) => {
            const peak = ordered[index] as MassPeakObject;
            return (
              <PeakRow
                key={peak.x}
                index={index}
                peak={peak}
                mzDecimals={mzDecimals}
                showsCharge={showsCharge}
                isHighlighted={peak.x === highlightMz}
                measure={rows.measure}
                onHighlight={onHighlight}
                onPick={onPick}
              />
            );
          })}
          {rows.after > 0 ? <tr style={{ height: rows.after }} /> : null}
        </tbody>
      </table>
    </div>
  );
}

interface PeakRowProps {
  /** Where the row sits in the list, which is how its height is found again. */
  index: number;
  /** The peak. */
  peak: MassPeakObject;
  /** How many decimals the mass is written with. */
  mzDecimals: number;
  /** Whether the charge column is drawn. */
  showsCharge: boolean;
  /** Whether the pointer is resting on this peak, here or on the chart. */
  isHighlighted: boolean;
  /** Reports the row's height. */
  measure: (node: HTMLElement | null) => void;
  /** Told the peak's m/z when the pointer comes to rest on the row. */
  onHighlight: (mz: number | null) => void;
  /** Frames the peak on the chart. */
  onPick: (mz: number) => void;
}

/**
 * One peak. Memoised, because a hover on the chart moves the highlight and only
 * the row it left and the row it reached have anything new to draw.
 */
const PeakRow = memo(function PeakRow(props: PeakRowProps) {
  const {
    index,
    peak,
    mzDecimals,
    showsCharge,
    isHighlighted,
    measure,
    onHighlight,
    onPick,
  } = props;
  return (
    <tr
      ref={measure}
      data-index={index}
      style={isHighlighted ? highlightedRowStyle : rowStyle}
      title="Click to frame this peak on the chart"
      // Reachable by Tab as well as by the pointer: framing a peak is the one
      // thing a row does, and a keyboard has to be able to ask for it.
      tabIndex={0}
      onPointerEnter={() => onHighlight(peak.x)}
      onFocus={() => onHighlight(peak.x)}
      onClick={() => onPick(peak.x)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onPick(peak.x);
      }}
    >
      <td style={panelCellStyle}>{formatMz(peak.x, mzDecimals)}</td>
      <td style={panelNumberCellStyle}>
        {formatIntensity(peak.y, mzDecimals)}
      </td>
      {showsCharge ? (
        <td style={panelNumberCellStyle}>
          {peak.charge === 0 ? '' : peak.charge}
        </td>
      ) : null}
    </tr>
  );
});

/** What one row is worth before one has been measured. */
const ROW_HEIGHT = 18;

const rowStyle = { cursor: 'pointer' } as const;

/** The row of the peak being looked at, wherever it was pointed at. */
const highlightedRowStyle = { ...rowStyle, background: '#e8f1fb' } as const;
