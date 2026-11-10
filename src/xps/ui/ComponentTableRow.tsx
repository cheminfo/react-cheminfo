import type { ReactNode } from 'react';
import { memo } from 'react';

import type { ComponentRow } from '../core/componentRows.ts';
import { formatFactor } from '../core/panelFormat.ts';
import { formatCounts, formatEnergy } from '../core/peakFormat.ts';

import {
  panelLitRowStyle,
  panelNumberCellStyle as numberCellStyle,
  panelTextCellStyle as textCellStyle,
} from './panelStyles.ts';

export interface ComponentTableRowProps {
  /** The component. */
  row: ComponentRow;
  /** Whether this is the component being looked at, wherever it was pointed at. */
  lit: boolean;
  /** Called with the row when the pointer enters it, `null` on leaving. */
  onHover: (row: ComponentRow | null) => void;
}

/**
 * One fitted component: what it claims to be, where, how wide, and how much.
 *
 * Memoised for the same reason the peak row is: the highlight moves on every
 * pixel the pointer travels across the chart, and the row must not redraw for a
 * change that is not about it.
 *
 * The shape and the region are written under the label rather than in columns of
 * their own. They are read once, when the fit is being judged — a `GL(30)`
 * asymmetric line on a metal, a Shirley background across the wrong window — and
 * a panel has no room for six columns of numbers plus two of prose.
 * @param props - Component props.
 * @returns The row.
 */
export const ComponentTableRow = memo(function ComponentTableRow(
  props: ComponentTableRowProps,
): ReactNode {
  const { row, lit, onHover } = props;
  const background =
    row.backgroundType === null ? '' : ` · ${row.backgroundType}`;
  const region =
    row.regionLabel === null ? null : `${row.regionLabel}${background}`;

  return (
    <tr
      style={lit ? panelLitRowStyle : undefined}
      onPointerEnter={() => onHover(row)}
      onPointerLeave={() => onHover(null)}
    >
      <td style={textCellStyle}>
        <span style={labelStyle}>{row.label}</span>
        <span style={detailStyle}>
          {row.shape}
          {region === null ? '' : ` · ${region}`}
        </span>
      </td>
      <td style={numberCellStyle}>{formatEnergy(row.bindingEnergy)}</td>
      <td style={numberCellStyle}>{formatEnergy(row.fwhm)}</td>
      <td style={numberCellStyle}>{formatCounts(row.area)}</td>
      <td
        style={numberCellStyle}
        title={
          row.relativeSensitivityFactor === null
            ? 'The file states no sensitivity factor for this component, so it cannot be quantified against the others'
            : undefined
        }
      >
        {formatFactor(row.relativeSensitivityFactor)}
      </td>
    </tr>
  );
});

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/** The shape and the window it was fitted in, under the name it was given. */
const detailStyle = {
  display: 'block',
  fontSize: 10,
  opacity: 0.7,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
