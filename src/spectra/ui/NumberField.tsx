import { InputGroup } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

/** What {@link NumberField} edits. */
export interface NumberFieldProps {
  /** What the field is called, shown above the box. */
  label: string;
  /**
   * The number the settings hold.
   * @default undefined — the box is empty and upstream's own default applies
   */
  value?: number;
  /**
   * What upstream does when the box is left empty, shown in grey inside it.
   * @default undefined — the box carries no placeholder
   */
  placeholder?: string;
  /** Called with the new number, or with undefined when the box is emptied. */
  onChange: (value: number | undefined) => void;
  /**
   * Whether only whole numbers make sense here.
   * @default false — any number is accepted
   */
  integer?: boolean;
  /**
   * One line under the box saying what the number changes.
   * @default undefined — the label says enough
   */
  help?: string;
}

/**
 * One number of the settings.
 *
 * The box keeps what was typed rather than what parsed, because a reader
 * halfway through `1e-` has typed something no number can hold yet; clearing it
 * under them would make the field unusable. Nothing is handed up until the text
 * reads as a number, and emptying the box hands up nothing at all — which is
 * how a reader gets back to upstream's default after typing over it.
 * @param props - See {@link NumberFieldProps}.
 * @returns The labelled box.
 */
export function NumberField(props: NumberFieldProps): ReactElement {
  const { label, value, placeholder, onChange, integer = false, help } = props;
  const [draft, setDraft] = useState(() => ({
    text: asText(value),
    held: value,
  }));

  // The settings changed from somewhere else — a preset, a reset, a pasted
  // configuration — so the box has to follow rather than hold the old text.
  // `held` is what this box last handed up, not the prop it was rendered with:
  // comparing against the prop would make the box's own edit look external and
  // rewrite `-0.` as `0` under the caret before the reader reaches the digits.
  if (draft.held !== value) setDraft({ text: asText(value), held: value });

  return (
    <label style={FIELD_STYLE}>
      <span style={LABEL_STYLE}>{label}</span>
      <InputGroup
        size="small"
        fill
        inputMode={integer ? 'numeric' : 'decimal'}
        value={draft.text}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        onValueChange={(text) => {
          const parsed = read(text, integer);
          const emptied = text.trim() === '';
          setDraft({ text, held: emptied ? undefined : (parsed ?? value) });
          if (emptied) {
            onChange(undefined);
          } else if (parsed !== undefined) {
            onChange(parsed);
          }
        }}
      />
      {help === undefined ? null : <span style={HELP_STYLE}>{help}</span>}
    </label>
  );
}

/**
 * The number as the box shows it.
 * @param value - What the settings hold.
 * @returns Its text, empty when nothing is held.
 */
function asText(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

/**
 * The text as a number, when it reads as one.
 * @param text - What was typed.
 * @param integer - Whether only whole numbers make sense.
 * @returns The number, or undefined while the text is not one yet.
 */
function read(text: string, integer: boolean): number | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  if (integer && !Number.isInteger(parsed)) return undefined;
  return parsed;
}

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 120,
  flex: '1 1 120px',
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
