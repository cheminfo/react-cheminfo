import { Switch } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { ZoneEntry } from '../core/zones.ts';
import { zoneBound } from '../core/zones.ts';

import { EditableRows } from './EditableRows.tsx';
import { NumberField } from './NumberField.tsx';
import { SWITCH_STYLE } from './fieldStyles.ts';

/** What {@link ZoneRows} edits. */
interface ZoneRowsProps {
  /** What the list is called. */
  label: string;
  /** The stretches, in the order they are listed, as `readZones` reads them. */
  value: readonly ZoneEntry[];
  /** Called with the new list on every edit. */
  onChange: (zones: ZoneEntry[]) => void;
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
 * The same widget stands for all the places the settings ask for them, because
 * they are the same thing and a reader who has learnt one row has learnt them
 * all. A new row opens empty rather than guessing bounds — a zone the reader
 * did not choose would silently change the data. A bound that is not a number
 * shows as an empty box, and editing any row writes every other entry back as
 * it was, so a zone a problem names is never dropped by an edit elsewhere.
 * @param props - See {@link ZoneRowsProps}.
 * @returns The labelled list.
 */
export function ZoneRows(props: ZoneRowsProps): ReactElement {
  const { label, value, onChange, withIgnore = false, help } = props;

  return (
    <EditableRows
      label={label}
      value={value}
      onChange={onChange}
      emptyText="None — the whole range is used."
      addText="Add a zone"
      newEntry={newZone}
      removeLabel={(index) => `Remove ${label} ${String(index + 1)}`}
      help={help === undefined ? undefined : [help]}
      renderRow={(zone, _index, replace) => (
        <>
          <NumberField
            label="From"
            value={zoneBound(zone, 'from')}
            onChange={(from) => {
              replace({ ...zone, from });
            }}
          />
          <NumberField
            label="To"
            value={zoneBound(zone, 'to')}
            onChange={(to) => {
              replace({ ...zone, to });
            }}
          />
          {withIgnore ? (
            <Switch
              checked={zone.ignore === true}
              label="Hide on the chart only"
              style={SWITCH_STYLE}
              onChange={(event) => {
                replace({ ...zone, ignore: event.currentTarget.checked });
              }}
            />
          ) : null}
        </>
      )}
    />
  );
}

/**
 * The row a new zone opens with: neither bound.
 * @returns The zone.
 */
function newZone(): ZoneEntry {
  return {};
}
