import type { ReactElement } from 'react';

import { readFilterOption, setFilterOption } from '../core/filterChain.ts';
import type { FilterField } from '../core/filterFields.ts';
import type { SpectrumFilter } from '../core/settings.ts';
import { readZones } from '../core/zones.ts';

import { FilterChoiceControl } from './FilterChoiceControl.tsx';
import { NumberField } from './NumberField.tsx';
import { ZoneRows } from './ZoneRows.tsx';

/** What {@link FilterFieldControl} edits. */
interface FilterFieldControlProps {
  /** Which option of the step is edited, and how. */
  field: FilterField;
  /** The step the option sits in. */
  filter: SpectrumFilter;
  /** Called with the step carrying the new value. */
  onChange: (filter: SpectrumFilter) => void;
}

/**
 * One option of one chain step, drawn as whatever its kind asks for.
 *
 * A step's options are the only thing that says what it will do to the data, so
 * they are drawn open rather than behind a disclosure: a chain read with them
 * folded away is a list of names. Emptying a control writes nothing at all
 * rather than a blank value, which is the only way back to upstream's own
 * default once a reader has typed over it. A zone list is read with
 * `readZones`, the reader the problems number their zones on, so a zone with a
 * bound written as text stays a row the reader can fix.
 * @param props - See {@link FilterFieldControlProps}.
 * @returns The labelled control.
 */
export function FilterFieldControl(
  props: FilterFieldControlProps,
): ReactElement {
  const { field, filter, onChange } = props;
  const value = readFilterOption(filter, field.key);

  function write(next: unknown): void {
    onChange(setFilterOption(filter, field.key, next));
  }

  if (field.kind === 'zones') {
    return (
      <ZoneRows
        label={field.label}
        value={readZones(value)}
        help={field.help}
        onChange={(zones) => {
          write(zones.length === 0 ? undefined : zones);
        }}
      />
    );
  }

  if (field.kind !== 'integer' && field.kind !== 'number') {
    return <FilterChoiceControl field={field} value={value} onChange={write} />;
  }

  return (
    <NumberField
      label={field.label}
      value={typeof value === 'number' ? value : undefined}
      placeholder={field.placeholder}
      help={field.help}
      integer={field.kind === 'integer'}
      onChange={write}
    />
  );
}
