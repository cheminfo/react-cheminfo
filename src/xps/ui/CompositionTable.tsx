import { Icon } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import type { CompositionRow } from '../core/compositionRows.ts';
import { formatCounts, formatPercent } from '../core/peakFormat.ts';

import {
  panelBarFillStyle,
  panelBarTrackStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelNumberCellStyle as numberCellStyle,
  panelScrollAreaStyle as scrollAreaStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
  panelTextCellStyle as textCellStyle,
} from './panelStyles.ts';

export interface CompositionTableProps {
  /** The lines of the composition, largest share first. */
  rows: readonly CompositionRow[];
}

/**
 * The composition: what the fit says the surface is made of.
 *
 * Every line carries the bar as well as the number, because a composition is
 * read as a set of proportions long before any of its percentages are — which of
 * these is the matrix, and which are traces on it — and eleven right-aligned
 * decimals answer that question far more slowly than eleven bars do.
 *
 * A line quantified with a sensitivity factor the file never stated is marked,
 * and not quietly: its percentage is arithmetic rather than chemistry, and it
 * rescales every other percentage in the table. The mark is on the row because
 * the row is where the number is read; the sentence above the table is where the
 * consequence is said.
 * @param props - Component props.
 * @returns The table.
 */
export function CompositionTable(props: CompositionTableProps): ReactNode {
  const { rows } = props;

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
            <tr key={row.key}>
              <th scope="row" style={keyCellStyle}>
                <span style={labelRowStyle}>
                  <span style={labelStyle}>{row.key}</span>
                  {row.assumedSensitivity ? (
                    <Icon
                      icon="warning-sign"
                      size={11}
                      color="rgb(191 115 0)"
                      title="The file states no sensitivity factor for this component, so it was quantified at 1"
                    />
                  ) : null}
                </span>
                <span style={barCellStyle}>
                  <span style={panelBarTrackStyle}>
                    <span
                      style={{
                        ...panelBarFillStyle,
                        width: `${row.share * 100}%`,
                        background: row.assumedSensitivity
                          ? 'rgb(191 115 0)'
                          : panelBarFillStyle.background,
                      }}
                    />
                  </span>
                </span>
              </th>
              <td style={numberCellStyle}>{formatCounts(row.correctedArea)}</td>
              <td style={{ ...numberCellStyle, ...percentStyle }}>
                {formatPercent(row.atomicFraction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The headings of this table name things rather than sort them. */
const COLUMN_TITLES = ['Component', 'Corrected area', 'Atomic %'] as const;

const keyCellStyle = {
  ...textCellStyle,
  textAlign: 'left',
  fontWeight: 400,
  whiteSpace: 'normal',
} as const;

const labelRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minWidth: 0,
} as const;

const labelStyle = {
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/** The bar sits under the name, across the width the name column has. */
const barCellStyle = {
  display: 'block',
  paddingTop: 2,
} as const;

/** The share is what the table is read for, so it is the one figure emphasised. */
const percentStyle = { fontWeight: 600 } as const;
