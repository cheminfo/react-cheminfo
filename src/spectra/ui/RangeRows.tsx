import { Button, InputGroup } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { SpectraRange } from '../core/settings.ts';

import { NumberField } from './NumberField.tsx';
import { fitKeys, nextKey } from './rowKeys.ts';

/** What {@link RangeRows} edits. */
export interface RangeRowsProps {
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
  const [rowKeys, setRowKeys] = useState<readonly number[]>(() =>
    value.map((_, index) => index),
  );

  if (rowKeys.length !== value.length) {
    setRowKeys(fitKeys(rowKeys, value.length));
  }

  function write(index: number, patch: SpectraRange): void {
    onChange(
      value.map((range, at) => (at === index ? { ...range, ...patch } : range)),
    );
  }

  return (
    <div style={LIST_STYLE}>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>
          None — nothing is integrated, and no calculation has anything to read.
        </span>
      ) : null}
      {value.map((range, index) => (
        <div key={rowKeys[index] ?? index} style={ROW_STYLE}>
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
                write(index, { label });
              }}
            />
          </label>
          <NumberField
            label="From"
            value={range.from}
            placeholder="the first x"
            onChange={(from) => {
              write(index, { from });
            }}
          />
          <NumberField
            label="To"
            value={range.to}
            placeholder="the last x"
            onChange={(to) => {
              write(index, { to });
            }}
          />
          <NumberField
            label="From point"
            value={range.fromIndex}
            integer
            placeholder="0"
            onChange={(fromIndex) => {
              write(index, { fromIndex });
            }}
          />
          <NumberField
            label="To point"
            value={range.toIndex}
            integer
            placeholder="the last point"
            onChange={(toIndex) => {
              write(index, { toIndex });
            }}
          />
          <Button
            icon="cross"
            variant="minimal"
            size="small"
            aria-label={`Remove range ${String(index + 1)}`}
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
          text="Add a range"
          onClick={() => {
            setRowKeys([...rowKeys, nextKey(rowKeys)]);
            onChange([...value, { label: '' }]);
          }}
        />
      </div>
      <span style={HELP_STYLE}>
        A range with no name is silently skipped, and the name has to be one a
        variable could take — no spaces, and not starting with a digit.
      </span>
      <span style={HELP_STYLE}>
        A range resolves its window the same way the scaling does: a point
        number silently wins, so with From point set, From is never read.
      </span>
    </div>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 8,
} as const satisfies CSSProperties;

const NAME_FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 140,
  flex: '1 1 140px',
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

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
