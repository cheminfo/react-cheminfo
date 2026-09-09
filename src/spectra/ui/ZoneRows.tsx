import { Button, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { NumberField } from './NumberField.tsx';
import { fitKeys, nextKey } from './rowKeys.ts';

/** One stretch of x, as every part of the settings spells it. */
export interface Zone {
  /** Where it starts, in x units. */
  from?: number;
  /** Where it ends, in x units. */
  to?: number;
  /** Whether it is only hidden from the chart. */
  ignore?: boolean;
}

/** What {@link ZoneRows} edits. */
export interface ZoneRowsProps {
  /** What the list is called. */
  label: string;
  /** The stretches, in the order they are listed. */
  value: readonly Zone[];
  /** Called with the new list on every edit. */
  onChange: (zones: Zone[]) => void;
  /**
   * Whether each row offers the switch that hides a zone from the chart.
   * @default false — only the two bounds are drawn
   */
  withIgnore?: boolean;
  /**
   * One line under the list saying what the zones do.
   * @default undefined — the label says enough
   */
  help?: string;
}

/**
 * A list of x stretches: exclusions, zones to keep, zones to drop.
 *
 * The same widget stands for all four places the settings ask for them, because
 * they are the same thing and a reader who has learnt one row has learnt them
 * all. A new row opens empty rather than guessing bounds — a zone the reader
 * did not choose would silently change the data.
 * @param props - See {@link ZoneRowsProps}.
 * @returns The labelled list.
 */
export function ZoneRows(props: ZoneRowsProps): ReactElement {
  const { label, value, onChange, withIgnore = false, help } = props;
  const [rowKeys, setRowKeys] = useState<readonly number[]>(() =>
    value.map((_, index) => index),
  );

  // A zone carries no identity of its own, so one is kept beside the list:
  // without it React reuses a removed row's box for the row that slides up,
  // and the half-typed number in it goes with the wrong zone.
  if (rowKeys.length !== value.length) {
    setRowKeys(fitKeys(rowKeys, value.length));
  }

  function write(index: number, patch: Zone): void {
    onChange(
      value.map((zone, at) => (at === index ? { ...zone, ...patch } : zone)),
    );
  }

  return (
    <div style={LIST_STYLE}>
      <span style={LABEL_STYLE}>{label}</span>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>None — the whole range is used.</span>
      ) : null}
      {value.map((zone, index) => (
        <div key={rowKeys[index] ?? index} style={ROW_STYLE}>
          <NumberField
            label="From"
            value={zone.from}
            onChange={(from) => {
              write(index, { from });
            }}
          />
          <NumberField
            label="To"
            value={zone.to}
            onChange={(to) => {
              write(index, { to });
            }}
          />
          {withIgnore ? (
            <Switch
              checked={zone.ignore === true}
              label="Hide on the chart only"
              style={SWITCH_STYLE}
              onChange={(event) => {
                write(index, { ignore: event.currentTarget.checked });
              }}
            />
          ) : null}
          <Button
            icon="cross"
            variant="minimal"
            size="small"
            aria-label={`Remove ${label} ${String(index + 1)}`}
            onClick={() => {
              setRowKeys(rowKeys.filter((_, at) => at !== index));
              onChange(value.filter((_, at) => at !== index));
            }}
          />
        </div>
      ))}
      <div>
        <Button
          icon="plus"
          size="small"
          text="Add a zone"
          onClick={() => {
            setRowKeys([...rowKeys, nextKey(rowKeys)]);
            onChange([...value, {}]);
          }}
        />
      </div>
      {help === undefined ? null : <span style={HELP_STYLE}>{help}</span>}
    </div>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const EMPTY_STYLE = {
  fontSize: 12,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 8,
} as const satisfies CSSProperties;

const SWITCH_STYLE = {
  margin: 0,
  fontSize: 12,
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
