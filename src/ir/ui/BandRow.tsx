import { Button, Icon } from '@blueprintjs/core';
import { useState } from 'react';

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
 * The candidates start as one line rather than a list, so a strong band with
 * four of them stays one row of the table and the wavenumbers keep reading down
 * the column. Its "more" opens the row onto every candidate with its note, which
 * is where the reason to prefer one lives.
 * @param props - Component props.
 * @returns The row.
 */
export function BandRow(props: BandRowProps) {
  const { entry, mode, assignments, lit, onHighlight, onRemove } = props;
  const { band } = entry;

  return (
    <tr
      style={lit ? litRowStyle : rowStyle}
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
 * What a band could be: the narrowest candidate and how many more there are,
 * opened on a click into every candidate with the note that tells it apart.
 * @param props - Component props.
 * @returns The cell.
 */
function CandidatesCell(props: CandidatesCellProps) {
  const { candidates } = props.entry;
  const [open, setOpen] = useState(false);

  if (candidates.length === 0) {
    return (
      <td style={panelCellStyle}>
        <span style={{ opacity: 0.5 }}>—</span>
      </td>
    );
  }

  const [first] = candidates;
  const others = candidates.length - 1;

  return (
    <td style={candidatesCellStyle}>
      {open ? (
        <ul style={candidateListStyle}>
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              {candidate.group} {candidate.vibration}
              {candidate.note === undefined ? null : (
                <div style={candidateNoteStyle}>{candidate.note}</div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <>
          {first?.group} {first?.vibration}
        </>
      )}
      {others > 0 ? (
        <>
          {open ? null : ' '}
          <button
            type="button"
            style={moreButtonStyle}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              'less'
            ) : (
              <>
                <Icon icon="more" size={10} /> {others} more
              </>
            )}
          </button>
        </>
      ) : null}
    </td>
  );
}

/** What each strength letter means, for the column that shows only the letter. */
const STRENGTH_TITLES = {
  w: 'weak, relative to this spectrum',
  m: 'medium, relative to this spectrum',
  S: 'strong, relative to this spectrum',
} as const;

// Top, so an opened row keeps its wavenumber on the line of its first candidate.
const rowStyle = { verticalAlign: 'top' } as const;

const litRowStyle = { ...rowStyle, background: '#fff3e0' } as const;

const removeCellStyle = { ...panelCellStyle, padding: 0, width: 1 } as const;

const candidatesCellStyle = {
  ...panelCellStyle,
  whiteSpace: 'normal',
} as const;

const candidateListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

const candidateNoteStyle = { fontSize: '0.9em', opacity: 0.6 } as const;

const moreButtonStyle = {
  padding: 0,
  border: 0,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  opacity: 0.6,
  cursor: 'pointer',
} as const;
