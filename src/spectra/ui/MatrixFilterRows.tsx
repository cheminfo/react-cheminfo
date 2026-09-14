import { Button, HTMLSelect } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import {
  readNumberOption,
  reorder,
  setFilterOption,
} from '../core/filterChain.ts';
import {
  MATRIX_FILTER_NAMES,
  MATRIX_STEPS,
  findMatrixStep,
} from '../core/matrixCatalog.ts';
import type { MatrixFilter } from '../core/settings.ts';

import { NumberField } from './NumberField.tsx';
import { EMPTY_STYLE, HELP_STYLE, ROW_STYLE } from './fieldStyles.ts';
import { useRowKeys } from './rowKeys.ts';

/** What {@link MatrixFilterRows} edits. */
interface MatrixFilterRowsProps {
  /** The steps, in the order the matrix goes through them. */
  value: readonly MatrixFilter[];
  /** Called with the new list on every edit. */
  onChange: (filters: MatrixFilter[]) => void;
}

/**
 * The steps that work across spectra rather than along one.
 *
 * The processor's own switch knows exactly three names and throws on a fourth,
 * so the menu offers those three and nothing else — a name typed by hand is the
 * one way this stage fails, and there is no reason to leave that door open.
 * Order matters here as much as in the chain: centring a matrix that is about
 * to be rescaled is not the same as rescaling a centred one.
 * @param props - See {@link MatrixFilterRowsProps}.
 * @returns The ordered list and the menu that adds to it.
 */
export function MatrixFilterRows(props: MatrixFilterRowsProps): ReactElement {
  const { value, onChange } = props;
  const rows = useRowKeys(value.length);

  function move(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    rows.move(index, target);
    onChange(reorder(value, index, target));
  }

  return (
    <div style={LIST_STYLE}>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>
          None — the matrix is handed on as the chain left it.
        </span>
      ) : null}
      {value.map((step, index) => {
        const known = findMatrixStep(step.name);
        return (
          <div key={rows.keys[index] ?? index} style={STEP_STYLE}>
            <div style={HEADER_STYLE}>
              <span style={NAME_STYLE}>
                {known?.label ?? String(step.name)}
              </span>
              <Button
                icon="arrow-up"
                variant="minimal"
                size="small"
                disabled={index === 0}
                aria-label={`Move matrix step ${String(index + 1)} up`}
                onClick={() => {
                  move(index, -1);
                }}
              />
              <Button
                icon="arrow-down"
                variant="minimal"
                size="small"
                disabled={index === value.length - 1}
                aria-label={`Move matrix step ${String(index + 1)} down`}
                onClick={() => {
                  move(index, 1);
                }}
              />
              <Button
                icon="cross"
                variant="minimal"
                size="small"
                aria-label={`Remove matrix step ${String(index + 1)}`}
                onClick={() => {
                  rows.removeAt(index);
                  onChange(value.toSpliced(index, 1));
                }}
              />
            </div>
            {known === undefined ? null : (
              <span style={HELP_STYLE}>{known.summary}</span>
            )}
            {known === undefined || known.fields.length === 0 ? null : (
              <div style={ROW_STYLE}>
                {known.fields.map((field) => (
                  <NumberField
                    key={field.key}
                    label={field.label}
                    value={readNumberOption(step, field.key)}
                    placeholder={field.placeholder}
                    onChange={(option) => {
                      onChange(
                        value.with(
                          index,
                          setFilterOption(step, field.key, option),
                        ),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <HTMLSelect
        aria-label="Add a matrix step"
        value=""
        options={ADD_OPTIONS}
        onChange={(event) => {
          const name = event.currentTarget.value;
          if (name === '') return;
          rows.append();
          onChange([...value, { name }]);
        }}
      />
    </div>
  );
}

/** The add menu: the empty prompt, then the only three names that run. */
const ADD_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Add a matrix step…' },
  ...MATRIX_FILTER_NAMES.map((name) => ({
    value: name,
    label: MATRIX_STEPS[name].label,
  })),
];

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start',
} as const satisfies CSSProperties;

const STEP_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignSelf: 'stretch',
  padding: 8,
  borderRadius: 'var(--radius)',
  background: 'var(--surface-sunken)',
} as const satisfies CSSProperties;

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
} as const satisfies CSSProperties;

const NAME_STYLE = {
  flex: 1,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text)',
} as const satisfies CSSProperties;
