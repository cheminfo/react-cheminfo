import { HTMLSelect, InputGroup, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { FilterField } from '../core/filterFields.ts';

/** What {@link FilterChoiceControl} edits. */
export interface FilterChoiceControlProps {
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

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 120,
  flex: '1 1 120px',
} as const satisfies CSSProperties;

const FORMULA_FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 220,
  flex: '1 1 220px',
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const SWITCH_STYLE = {
  margin: 0,
  fontSize: 12,
} as const satisfies CSSProperties;

const MONOSPACE_STYLE = {
  fontFamily: 'monospace',
} as const satisfies CSSProperties;
