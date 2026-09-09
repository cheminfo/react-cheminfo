import { Button, InputGroup } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { SpectraCalculation } from '../core/settings.ts';

import { fitKeys, nextKey } from './rowKeys.ts';

/** What {@link CalculationRows} edits. */
export interface CalculationRowsProps {
  /** The named formulas reported per spectrum. */
  value: readonly SpectraCalculation[];
  /** Called with the new list on every edit. */
  onChange: (calculations: SpectraCalculation[]) => void;
}

/**
 * The formulas evaluated once per spectrum, over the range integrals.
 *
 * The formula box is monospaced and has spellchecking off because what goes in
 * it is code, not prose: it is compiled into a function whose parameters are
 * the range names, so a name that does not match a range throws at the moment
 * the data is asked for rather than here.
 * @param props - See {@link CalculationRowsProps}.
 * @returns The list and the button that adds to it.
 */
export function CalculationRows(props: CalculationRowsProps): ReactElement {
  const { value, onChange } = props;
  const [rowKeys, setRowKeys] = useState<readonly number[]>(() =>
    value.map((_, index) => index),
  );

  if (rowKeys.length !== value.length) {
    setRowKeys(fitKeys(rowKeys, value.length));
  }

  function write(index: number, patch: Partial<SpectraCalculation>): void {
    onChange(
      value.map((held, at) => (at === index ? { ...held, ...patch } : held)),
    );
  }

  return (
    <div style={LIST_STYLE}>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>None — only the ranges are reported.</span>
      ) : null}
      {value.map((calculation, index) => (
        <div key={rowKeys[index] ?? index} style={ROW_STYLE}>
          <label style={NAME_FIELD_STYLE}>
            <span style={LABEL_STYLE}>Name</span>
            <InputGroup
              size="small"
              fill
              aria-label={`Name of calculation ${String(index + 1)}`}
              placeholder="what the number is called"
              spellCheck={false}
              autoComplete="off"
              value={calculation.label}
              onValueChange={(label) => {
                write(index, { label });
              }}
            />
          </label>
          <label style={FORMULA_FIELD_STYLE}>
            <span style={LABEL_STYLE}>Formula</span>
            <InputGroup
              size="small"
              fill
              aria-label={`Formula of calculation ${String(index + 1)}`}
              placeholder="aromatic / aliphatic"
              style={FORMULA_STYLE}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              value={calculation.formula}
              onValueChange={(formula) => {
                write(index, { formula });
              }}
            />
          </label>
          <Button
            icon="cross"
            variant="minimal"
            size="small"
            aria-label={`Remove calculation ${String(index + 1)}`}
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
          text="Add a calculation"
          onClick={() => {
            setRowKeys([...rowKeys, nextKey(rowKeys)]);
            onChange([...value, { label: '', formula: '' }]);
          }}
        />
      </div>
      <span style={HELP_STYLE}>
        A formula reads the range names as variables, and each one holds that
        range&apos;s integral.
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

const FORMULA_FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 200,
  flex: '2 1 200px',
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const FORMULA_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
} as const satisfies CSSProperties;

const EMPTY_STYLE = {
  fontSize: 12,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;
