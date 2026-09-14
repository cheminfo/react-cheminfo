import { InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { SpectraRange } from '../core/settings.ts';

import { EditableRows } from './EditableRows.tsx';
import { XWindowFields } from './XWindowFields.tsx';
import { LABEL_STYLE, sizedFieldStyle } from './fieldStyles.ts';
import { POINT_NUMBER_WINS } from './scaleOptions.ts';

/** What {@link RangeRows} edits. */
interface RangeRowsProps {
  /** The named stretches of x whose integral is reported per spectrum. */
  value: readonly SpectraRange[];
  /** Called with the new list on every edit. */
  onChange: (ranges: SpectraRange[]) => void;
}

/**
 * The stretches of x reported, and named, per spectrum.
 *
 * A range's name is not decoration: it becomes a variable the calculations
 * read, so it is asked for on the same row as the bounds rather than treated as
 * an afterthought. The integral and the tallest point are left out of the form
 * entirely — the processor writes those back into the very same objects. The
 * point numbers are drawn beside the bounds because the processor resolves the
 * window with the same call the scaling uses, where a point number wins.
 * @param props - See {@link RangeRowsProps}.
 * @returns The list and the button that adds to it.
 */
export function RangeRows(props: RangeRowsProps): ReactElement {
  const { value, onChange } = props;

  return (
    <EditableRows
      value={value}
      onChange={onChange}
      emptyText="None — nothing is integrated, and no calculation has anything to read."
      addText="Add a range"
      newEntry={newRange}
      removeLabel={removeLabel}
      help={HELP}
      renderRow={(range, index, replace) => (
        <>
          <label style={NAME_FIELD_STYLE}>
            <span style={LABEL_STYLE}>Name</span>
            <InputGroup
              size="small"
              fill
              aria-label={`Name of range ${String(index + 1)}`}
              placeholder="a name a formula can read"
              intent={(range.label ?? '') === '' ? 'danger' : 'none'}
              spellCheck={false}
              autoComplete="off"
              value={range.label ?? ''}
              onValueChange={(label) => {
                replace({ ...range, label });
              }}
            />
          </label>
          <XWindowFields
            value={range}
            withPoints
            onChange={(patch) => {
              replace({ ...range, ...patch });
            }}
          />
        </>
      )}
    />
  );
}

/**
 * The row a new range opens with: a name still to be given, the whole x axis.
 * @returns The range.
 */
function newRange(): SpectraRange {
  return { label: '' };
}

/**
 * What a screen reader calls one row's remove button.
 * @param index - The row, counting from zero.
 * @returns The label.
 */
function removeLabel(index: number): string {
  return `Remove range ${String(index + 1)}`;
}

const HELP: readonly string[] = [
  'A range with no name is silently skipped, and the name has to be one a variable could take — no spaces, and not starting with a digit.',
  `A range resolves its window the same way the scaling does. ${POINT_NUMBER_WINS}`,
];

const NAME_FIELD_STYLE = sizedFieldStyle(140);
