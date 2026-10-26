import { Button, Icon } from '@blueprintjs/core';

import {
  panelCellStyle,
  panelNumberCellStyle,
} from '../../panel/core/panelStyles.ts';
import type { AssignedBand } from '../core/assignBands.ts';
import type { IrBand } from '../core/irBand.ts';
import { bandValue } from '../core/irBand.ts';
import { formatIrValue, formatWavenumber } from '../core/irFormat.ts';
import type { IrMode } from '../core/irSpectrum.ts';

export interface BandRowProps {
  /** The band and everything it might be. */
  entry: AssignedBand;
  /** Which value axis is being read. */
  mode: IrMode;
  /** Whether the row has a column for what the band could be. */
  assignments: boolean;
  /** Whether the pointer is on this band, here or on the chart. */
  lit: boolean;
  /**
   * Told when the pointer arrives on this row, and when it leaves.
   * @default undefined
   */
  onHighlight?: (band: IrBand | null) => void;
  /**
   * Takes the band away; the row ends with the button that calls it.
   * @default undefined — no button
   */
  onRemove?: (band: IrBand) => void;
}

/**
 * One band: where it is, how strong, and every vibration it could be.
 *
 * The candidates are written as one line rather than a list, so a strong band
 * with four of them stays one row of the table and the wavenumbers keep reading
 * down the column. The `title` carries them again with each one's note, which is
 * where the reason to prefer one lives.
 * @param props - Component props.
 * @returns The row.
 */
export function BandRow(props: BandRowProps) {
  const { entry, mode, assignments, lit, onHighlight, onRemove } = props;
  const { band } = entry;

  return (
    <tr
      style={lit ? litRowStyle : undefined}
      onPointerEnter={() => onHighlight?.(band)}
      onPointerLeave={() => onHighlight?.(null)}
    >
      <td style={panelNumberCellStyle}>{formatWavenumber(band.wavenumber)}</td>
      <td style={panelCellStyle} title={STRENGTH_TITLES[band.strength]}>
        {band.strength}
      </td>
      <td style={panelNumberCellStyle}>
        {formatIrValue(bandValue(band, mode) ?? Number.NaN, mode)}
      </td>
      {assignments ? <CandidatesCell entry={entry} /> : null}
      {onRemove === undefined ? null : (
        <td style={removeCellStyle}>
          <Button
            variant="minimal"
            size="small"
            icon="small-cross"
            aria-label={`Take away the band at ${formatWavenumber(band.wavenumber)} cm⁻¹`}
            onClick={() => onRemove(band)}
          />
        </td>
      )}
    </tr>
  );
}

interface CandidatesCellProps {
  /** The band and everything it might be. */
  entry: AssignedBand;
}

/**
 * What a band could be: the narrowest candidate, and how many more there are.
 * @param props - Component props.
 * @returns The cell.
 */
function CandidatesCell(props: CandidatesCellProps) {
  const { candidates } = props.entry;
  const detail = candidates
    .map((candidate) =>
      candidate.note === undefined
        ? `${candidate.group} ${candidate.vibration}`
        : `${candidate.group} ${candidate.vibration} — ${candidate.note}`,
    )
    .join('\n');

  return (
    <td style={panelCellStyle} title={detail}>
      {candidates.length === 0 ? (
        <span style={{ opacity: 0.5 }}>—</span>
      ) : (
        <span style={{ whiteSpace: 'normal' }}>
          {candidates[0]?.group} {candidates[0]?.vibration}
          {candidates.length > 1 ? (
            <span style={{ opacity: 0.6 }}>
              {' '}
              <Icon icon="more" size={10} /> {candidates.length - 1} more
            </span>
          ) : null}
        </span>
      )}
    </td>
  );
}

/** What each strength letter means, for the column that shows only the letter. */
const STRENGTH_TITLES = {
  w: 'weak, relative to this spectrum',
  m: 'medium, relative to this spectrum',
  S: 'strong, relative to this spectrum',
} as const;

const litRowStyle = { background: '#fff3e0' } as const;

const removeCellStyle = { ...panelCellStyle, padding: 0, width: 1 } as const;
