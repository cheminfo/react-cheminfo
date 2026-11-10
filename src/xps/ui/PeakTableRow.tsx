import type { ReactNode } from 'react';
import { memo } from 'react';

import { signedEnergy } from '../core/panelFormat.ts';
import { formatCounts, formatEnergy } from '../core/peakFormat.ts';
import type { PeakRow } from '../core/peakRows.ts';
import { peakElementText } from '../core/peakRows.ts';

import {
  panelLitRowStyle,
  panelNumberCellStyle as numberCellStyle,
  panelTextCellStyle as textCellStyle,
} from './panelStyles.ts';

export interface PeakTableRowProps {
  /** The peak. */
  row: PeakRow;
  /** Whether the kinetic column is drawn at all. */
  showKinetic: boolean;
  /** Whether this is the peak being looked at, wherever it was pointed at. */
  lit: boolean;
  /** Called with the row's peak when the pointer enters it, `null` on leaving. */
  onHover: (row: PeakRow | null) => void;
}

/**
 * One picked peak: where it sits on both axes, how many counts are there, how
 * wide it is, and what could account for it.
 *
 * Memoised, and the reason is the two-way link rather than the size of the
 * table: the highlight changes on every pixel the pointer travels across the
 * chart, and a row that re-rendered on each of them would redraw two hundred
 * rows to move one shade of blue. Everything it is handed is therefore a
 * primitive or an unchanging callback, so `lit` is the only prop that moves.
 *
 * The distance to the published level is written beside the element rather than
 * in a column of its own: it is unreadable without the name it belongs to, and a
 * panel is narrow.
 * @param props - Component props.
 * @returns The row.
 */
export const PeakTableRow = memo(function PeakTableRow(
  props: PeakTableRowProps,
): ReactNode {
  const { row, showKinetic, lit, onHover } = props;

  return (
    <tr
      style={lit ? panelLitRowStyle : undefined}
      onPointerEnter={() => onHover(row)}
      onPointerLeave={() => onHover(null)}
    >
      <td style={numberCellStyle}>{formatEnergy(row.bindingEnergy)}</td>
      {showKinetic ? (
        <td style={numberCellStyle}>{formatEnergy(row.kineticEnergy)}</td>
      ) : null}
      <td style={numberCellStyle}>{formatCounts(row.intensity)}</td>
      <td style={numberCellStyle}>{formatEnergy(row.width)}</td>
      <td style={textCellStyle}>
        {row.element === null ? (
          '—'
        ) : (
          <span style={candidateStyle}>
            <span style={levelStyle}>{peakElementText(row)}</span>
            <span style={deltaStyle}>{signedEnergy(row.delta)}</span>
          </span>
        )}
      </td>
    </tr>
  );
});

const candidateStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  minWidth: 0,
} as const;

const levelStyle = {
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/** How far the peak sits from the level, quieter than the level itself. */
const deltaStyle = {
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  opacity: 0.6,
} as const;
