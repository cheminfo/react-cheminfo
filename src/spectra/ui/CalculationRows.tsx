import { InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { SpectraCalculation } from '../core/settings.ts';

import { EditableRows } from './EditableRows.tsx';
import {
  LABEL_STYLE,
  MONOSPACE_STYLE,
  sizedFieldStyle,
} from './fieldStyles.ts';

/** What {@link CalculationRows} edits. */
interface CalculationRowsProps {
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

  return (
    <EditableRows
      value={value}
      onChange={onChange}
      emptyText="None — only the ranges are reported."
      addText="Add a calculation"
      newEntry={newCalculation}
      removeLabel={removeLabel}
      help={HELP}
      renderRow={(calculation, index, replace) => (
        <>
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
                replace({ ...calculation, label });
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
              style={MONOSPACE_STYLE}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              value={calculation.formula}
              onValueChange={(formula) => {
                replace({ ...calculation, formula });
              }}
            />
          </label>
        </>
      )}
    />
  );
}

/**
 * The row a new calculation opens with: nothing named, nothing written.
 * @returns The calculation.
 */
function newCalculation(): SpectraCalculation {
  return { label: '', formula: '' };
}

/**
 * What a screen reader calls one row's remove button.
 * @param index - The row, counting from zero.
 * @returns The label.
 */
function removeLabel(index: number): string {
  return `Remove calculation ${String(index + 1)}`;
}

const HELP: readonly string[] = [
  "A formula reads the range names as variables, and each one holds that range's integral.",
];

const NAME_FIELD_STYLE = sizedFieldStyle(140);

const FORMULA_FIELD_STYLE = sizedFieldStyle(200, 2);
