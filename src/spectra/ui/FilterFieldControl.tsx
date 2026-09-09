import type { ReactElement } from 'react';

import { readFilterOption, setFilterOption } from '../core/filterChain.ts';
import type { FilterField } from '../core/filterFields.ts';
import type { SpectrumFilter } from '../core/settings.ts';

import { FilterChoiceControl } from './FilterChoiceControl.tsx';
import { NumberField } from './NumberField.tsx';
import type { Zone } from './ZoneRows.tsx';
import { ZoneRows } from './ZoneRows.tsx';

/** What {@link FilterFieldControl} edits. */
export interface FilterFieldControlProps {
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
 * default once a reader has typed over it.
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
        value={asZones(value)}
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

/**
 * The value read back as a list of x stretches.
 *
 * The settings are a plain object a reader may have pasted in, so anything that
 * is not a list of bounded zones is read as no zones at all rather than handed
 * to a control that would then show `NaN`.
 * @param value - What the step holds under the field's key.
 * @returns The zones, empty when the value is not a list of them.
 */
function asZones(value: unknown): Zone[] {
  const held: readonly unknown[] = Array.isArray(value) ? value : [];
  return held.filter(isZone);
}

/**
 * Whether a value is one x stretch.
 * @param value - One entry of the list.
 * @returns True when both bounds are numbers or absent.
 */
function isZone(value: unknown): value is Zone {
  if (typeof value !== 'object' || value === null) return false;
  if ('from' in value && !isBound(value.from)) return false;
  if ('to' in value && !isBound(value.to)) return false;
  return true;
}

/**
 * Whether a bound is one a number box can show.
 * @param value - What the zone holds.
 * @returns True when it is a number or nothing.
 */
function isBound(value: unknown): boolean {
  return value === undefined || typeof value === 'number';
}
