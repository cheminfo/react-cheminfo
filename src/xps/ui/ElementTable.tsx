import type { ReactNode } from 'react';

import type { ElementRow } from '../core/elementRows.ts';
import { signedEnergy } from '../core/panelFormat.ts';
import { formatEnergy } from '../core/peakFormat.ts';

import {
  panelCellStyle as cellStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelNumberCellStyle as numberCellStyle,
  panelScrollAreaStyle as scrollAreaStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
  panelTextCellStyle as textCellStyle,
} from './panelStyles.ts';

export interface ElementTableProps {
  /** The elements, best supported first. */
  rows: readonly ElementRow[];
  /** Called with a binding energy to light on the chart, `null` on leaving. */
  onHover: (bindingEnergy: number | null) => void;
}

/**
 * Every element the peaks could be, with the evidence for each.
 *
 * The energies are the evidence and are therefore listed rather than counted: an
 * element claimed by one peak in a crowded window is a coincidence, and the same
 * element claimed at 232 and at 235 is a Mo 3d doublet. Reading that off the
 * table is the whole point of grouping the peaks by element in the first place,
 * so each energy is its own chip and resting on one draws the guide there — the
 * quickest way to ask "is that peak really where you say it is".
 *
 * The order is `countedElements`', which is the number of peaks accounted for
 * and then the alphabet. It is deliberately not ordered by how close the match
 * is: the closest single match in a survey scan is usually a trace element with
 * one weak line, and the element that matters is the one turning up four times.
 * @param props - Component props.
 * @returns The table.
 */
export function ElementTable(props: ElementTableProps): ReactNode {
  const { rows, onHover } = props;

  return (
    <div style={scrollAreaStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {COLUMN_TITLES.map((title) => (
              <th key={title} scope="col" style={headerStyle}>
                <span style={headerTextStyle}>{title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.element}>
              <th scope="row" style={elementCellStyle}>
                <span style={elementStackStyle}>
                  <span>{row.element}</span>
                  <span style={levelsStyle}>{row.orbitals.join(', ')}</span>
                </span>
              </th>
              <td
                style={numberCellStyle}
                title={`closest match ${signedEnergy(row.closest)} eV`}
              >
                {row.peaks}
              </td>
              <td style={textCellStyle}>
                <span style={energiesStyle}>
                  {row.energies.map((energy) => (
                    <span
                      key={energy}
                      style={energyChipStyle}
                      title="Draw the guide at this energy"
                      onPointerEnter={() => onHover(energy)}
                      onPointerLeave={() => onHover(null)}
                    >
                      {formatEnergy(energy)}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The headings of this table name things rather than sort them. */
const COLUMN_TITLES = ['Element', 'Peaks', 'Seen at (eV)'] as const;

const elementCellStyle = {
  ...cellStyle,
  textAlign: 'left',
  fontWeight: 600,
} as const;

/** The symbol, with the levels that matched under it. */
const elementStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
} as const;

/** Which levels of the element matched, under its symbol and quieter than it. */
const levelsStyle = {
  fontWeight: 400,
  fontSize: 10,
  opacity: 0.7,
} as const;

const energiesStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 3,
} as const;

const energyChipStyle = {
  padding: '0 3px',
  borderRadius: 2,
  background: 'rgb(237 240 243)',
  fontVariantNumeric: 'tabular-nums',
  cursor: 'default',
} as const;
