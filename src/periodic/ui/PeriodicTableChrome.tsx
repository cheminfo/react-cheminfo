/**
 * The furniture around the cells: the group and period strips, and the two
 * markers the inner-transition series were lifted out of.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { ElementRange } from '../core/layout.ts';
import {
  COLUMN_COUNT,
  INNER_TRANSITION_MARKERS,
  INNER_TRANSITION_ROWS,
} from '../core/layout.ts';

/** What {@link HeaderStrips} needs. */
export interface HeaderStripsProps {
  /**
   * Called with the run whose header was clicked. Without it the strips are
   * labels rather than buttons.
   * @default undefined
   */
  onSelectRange?: (range: ElementRange) => void;
}

/**
 * The 1–18 strip along the top and the 1–7 strip down the left.
 *
 * They are buttons when the table takes a range: "plot period 3" is one click
 * there and eight on the cells.
 * @param props - See {@link HeaderStripsProps}.
 * @returns The two strips, placed on the grid.
 */
export function HeaderStrips(props: HeaderStripsProps): ReactElement {
  const { onSelectRange } = props;
  const groups: ReactElement[] = [];
  for (let group = 1; group <= COLUMN_COUNT; group++) {
    groups.push(
      <HeaderCell
        key={`group-${String(group)}`}
        label={String(group)}
        title={`Group ${String(group)}`}
        column={group + 1}
        row={1}
        onClick={
          onSelectRange &&
          (() => {
            onSelectRange({ kind: 'group', value: group });
          })
        }
      />,
    );
  }
  const periods: ReactElement[] = [];
  for (let period = 1; period <= 7; period++) {
    periods.push(
      <HeaderCell
        key={`period-${String(period)}`}
        label={String(period)}
        title={`Period ${String(period)}`}
        column={1}
        row={period + 1}
        onClick={
          onSelectRange &&
          (() => {
            onSelectRange({ kind: 'period', value: period });
          })
        }
      />,
    );
  }

  return (
    <>
      {groups}
      {periods}
      {INNER_TRANSITION_ROWS.map(({ row, period }) => (
        <div
          key={`inner-${String(row)}`}
          style={{ ...headerStyle, gridColumn: 1, gridRow: row + 1 }}
        >
          {period}
        </div>
      ))}
    </>
  );
}

/** What {@link InnerTransitionMarkers} needs. */
export interface InnerTransitionMarkersProps {
  /** 1 when the table draws its header strips, 0 otherwise. */
  offset: number;
}

/**
 * The two cells the lanthanoids and the actinoids were lifted out of.
 * @param props - See {@link InnerTransitionMarkersProps}.
 * @returns The markers, placed on the grid.
 */
export function InnerTransitionMarkers(
  props: InnerTransitionMarkersProps,
): ReactElement {
  const { offset } = props;
  return (
    <>
      {INNER_TRANSITION_MARKERS.map(({ cell, label, category }) => (
        <div
          key={category}
          aria-hidden="true"
          style={{
            ...markerStyle,
            gridColumn: cell.column + offset,
            gridRow: cell.row + offset,
          }}
        >
          {label}
        </div>
      ))}
    </>
  );
}

interface HeaderCellProps {
  label: string;
  title: string;
  column: number;
  row: number;
  onClick?: (() => void) | undefined;
}

function HeaderCell(props: HeaderCellProps): ReactElement {
  const { label, title, column, row, onClick } = props;
  const style = { ...headerStyle, gridColumn: column, gridRow: row };
  if (onClick === undefined) return <div style={style}>{label}</div>;
  return (
    <button
      type="button"
      aria-label={title}
      onClick={onClick}
      style={{ ...style, ...headerButtonStyle }}
    >
      {label}
    </button>
  );
}

const headerStyle = {
  alignItems: 'center',
  color: 'rgb(95 107 124)',
  display: 'flex',
  fontSize: 'clamp(0.4rem, 1.9cqw, 0.62rem)',
  justifyContent: 'center',
  padding: 0,
} as const satisfies CSSProperties;

const headerButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
} as const satisfies CSSProperties;

const markerStyle = {
  alignItems: 'center',
  border: '1px dashed rgb(182 191 204)',
  borderRadius: 3,
  color: 'rgb(95 107 124)',
  display: 'flex',
  fontSize: 'clamp(0.36rem, 1.7cqw, 0.55rem)',
  justifyContent: 'center',
} as const satisfies CSSProperties;
