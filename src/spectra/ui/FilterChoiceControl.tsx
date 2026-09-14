import { HTMLSelect, InputGroup, Switch } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { FilterField } from '../core/filterFields.ts';

import {
  HELP_STYLE,
  LABEL_STYLE,
  MONOSPACE_STYLE,
  SWITCH_STYLE,
  sizedFieldStyle,
} from './fieldStyles.ts';

/** What {@link FilterChoiceControl} edits. */
interface FilterChoiceControlProps {
  /** Which option of the step is edited, and how. */
  field: FilterField;
  /** What the step holds for it, whatever shape that turns out to be. */
  value: unknown;
  /** Called with the new value, or with undefined to go back to the default. */
  onChange: (value: unknown) => void;
}

/**
 * A chain step's option that is not a number: a switch, a choice, a formula.
 *
 * These three sit apart from the numbers because each carries its own idea of
 * "not set" — an unticked switch is a value, an unpicked choice is not, and an
 * empty formula is neither — and a single control trying to hold all three
 * reads as a puzzle.
 * @param props - See {@link FilterChoiceControlProps}.
 * @returns The labelled control.
 */
export function FilterChoiceControl(
  props: FilterChoiceControlProps,
): ReactElement {
  const { field, value, onChange } = props;

  if (field.kind === 'boolean') {
    return (
      <div style={FIELD_STYLE}>
        <Switch
          checked={value === true}
          label={field.label}
          style={SWITCH_STYLE}
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
        />
        {field.help === undefined ? null : (
          <span style={HELP_STYLE}>{field.help}</span>
        )}
      </div>
    );
  }

  if (field.kind === 'enum') {
    return (
      <label style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>{field.label}</span>
        <HTMLSelect
          fill
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => {
            const chosen = event.currentTarget.value;
            onChange(chosen === '' ? undefined : chosen);
          }}
        >
          <option value="">Default</option>
          {(field.choices ?? []).map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </HTMLSelect>
        {field.help === undefined ? null : (
          <span style={HELP_STYLE}>{field.help}</span>
        )}
      </label>
    );
  }

  if (field.kind === 'formula') {
    return (
      <label style={FORMULA_FIELD_STYLE}>
        <span style={LABEL_STYLE}>{field.label}</span>
        <InputGroup
          size="small"
          fill
          style={MONOSPACE_STYLE}
          value={typeof value === 'string' ? value : ''}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onValueChange={(text) => {
            onChange(text === '' ? undefined : text);
          }}
        />
        {field.help === undefined ? null : (
          <span style={HELP_STYLE}>{field.help}</span>
        )}
      </label>
    );
  }

  return (
    <label style={FIELD_STYLE}>
      <span style={LABEL_STYLE}>{field.label}</span>
      <InputGroup
        size="small"
        fill
        value={typeof value === 'string' ? value : ''}
        spellCheck={false}
        autoComplete="off"
        onValueChange={(text) => {
          onChange(text === '' ? undefined : text);
        }}
      />
      {field.help === undefined ? null : (
        <span style={HELP_STYLE}>{field.help}</span>
      )}
    </label>
  );
}

const FIELD_STYLE = sizedFieldStyle(120);

const FORMULA_FIELD_STYLE = sizedFieldStyle(220);
