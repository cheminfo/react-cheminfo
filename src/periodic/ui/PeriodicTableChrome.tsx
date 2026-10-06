/**
 * The furniture around the cells: the group and period strips, and the two
 * markers the inner-transition series were lifted out of.
 */

import type { CSSProperties, MouseEvent, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { ElementRange } from '../core/layout.ts';
import {
  COLUMN_COUNT,
  INNER_TRANSITION_MARKERS,
  INNER_TRANSITION_ROWS,
} from '../core/layout.ts';

import { ofWidth } from './unit.ts';

/** What {@link HeaderStrips} needs. */
interface HeaderStripsProps {
  /**
   * Called with the run whose header was clicked, and whether the click was
   * additive. Without it the strips are labels rather than buttons.
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
  const t = useChromeT();
  const groups: ReactElement[] = [];
  for (let group = 1; group <= COLUMN_COUNT; group++) {
    groups.push(
      <HeaderCell
        key={`group-${String(group)}`}
        label={String(group)}
        title={t('periodic.group', { group })}
        column={group + 1}
        row={1}
        onClick={
          onSelectRange &&
          ((event) => {
            onSelectRange({
              kind: 'group',
              value: group,
              additive: isAdditive(event),
            });
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
        title={t('periodic.period', { period })}
        column={1}
        row={period + 1}
        onClick={
          onSelectRange &&
          ((event) => {
            onSelectRange({
              kind: 'period',
              value: period,
              additive: isAdditive(event),
            });
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
interface InnerTransitionMarkersProps {
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
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
}

/**
 * Whether a click asks for the run on top of the selection rather than in
 * place of it: Cmd on a Mac, Ctrl everywhere else, so one gesture reads the
 * same on both.
 * @param event - The click, for its modifier keys.
 * @returns True when the run is to be added to what is already chosen.
 */
function isAdditive(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey;
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
  color: TOKEN.textMuted,
  display: 'flex',
  fontSize: `max(0.45rem, ${ofWidth(1.35)})`,
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
  border: `1px dashed ${TOKEN.borderStrong}`,
  borderRadius: 3,
  color: TOKEN.textMuted,
  display: 'flex',
  fontSize: `max(0.4rem, ${ofWidth(1.15)})`,
  justifyContent: 'center',
} as const satisfies CSSProperties;
