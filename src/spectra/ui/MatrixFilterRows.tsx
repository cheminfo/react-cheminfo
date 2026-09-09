import { Button, HTMLSelect } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { MatrixFilter } from '../core/settings.ts';

import { NumberField } from './NumberField.tsx';
import {
  MATRIX_ADD_OPTIONS,
  matrixStep,
  readMatrixOption,
  writeMatrixOption,
} from './matrixSteps.ts';
import { fitKeys, nextKey, reorder } from './rowKeys.ts';

/** What {@link MatrixFilterRows} edits. */
export interface MatrixFilterRowsProps {
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
  const [rowKeys, setRowKeys] = useState<readonly number[]>(() =>
    value.map((_, index) => index),
  );

  if (rowKeys.length !== value.length) {
    setRowKeys(fitKeys(rowKeys, value.length));
  }

  function move(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    onChange(reorder(value, index, target));
    setRowKeys(reorder(rowKeys, index, target));
  }

  return (
    <div style={LIST_STYLE}>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>
          None — the matrix is handed on as the chain left it.
        </span>
      ) : null}
      {value.map((step, index) => {
        const known = matrixStep(step.name);
        return (
          <div key={rowKeys[index] ?? index} style={ROW_STYLE}>
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
                  setRowKeys(rowKeys.filter((_, at) => at !== index));
                  onChange(value.filter((_, at) => at !== index));
                }}
              />
            </div>
            {known === undefined ? null : (
              <span style={SUMMARY_STYLE}>{known.summary}</span>
            )}
            {known === undefined || known.fields.length === 0 ? null : (
              <div style={FIELDS_STYLE}>
                {known.fields.map((field) => (
                  <NumberField
                    key={field.key}
                    label={field.label}
                    value={readMatrixOption(step, field.key)}
                    placeholder={field.placeholder}
                    onChange={(option) => {
                      onChange(
                        value.map((held, at) =>
                          at === index
                            ? writeMatrixOption(held, field.key, option)
                            : held,
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
        options={MATRIX_ADD_OPTIONS}
        onChange={(event) => {
          const name = event.currentTarget.value;
          if (name === '') return;
          setRowKeys([...rowKeys, nextKey(rowKeys)]);
          onChange([...value, { name }]);
        }}
      />
    </div>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start',
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignSelf: 'stretch',
  padding: 8,
  borderRadius: 'var(--radius, 6px)',
  background: 'var(--surface-sunken, #f4f6f8)',
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
  color: 'var(--text, #1c2127)',
} as const satisfies CSSProperties;

const SUMMARY_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const FIELDS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} as const satisfies CSSProperties;

const EMPTY_STYLE = {
  fontSize: 12,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
