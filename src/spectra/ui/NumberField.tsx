import type { ReactElement } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';

import { HELP_STYLE, LABEL_STYLE, sizedFieldStyle } from './fieldStyles.ts';

/** What {@link NumberField} edits. */
interface NumberFieldProps {
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
 * Emptying the box hands up nothing at all, which is how a reader gets back to
 * upstream's default after typing over it.
 * @param props - See {@link NumberFieldProps}.
 * @returns The labelled box.
 */
export function NumberField(props: NumberFieldProps): ReactElement {
  const { label, value, placeholder, onChange, integer = false, help } = props;

  return (
    <label style={FIELD_STYLE}>
      <span style={LABEL_STYLE}>{label}</span>
      <NumberInput
        allowEmpty
        buttons={false}
        fill
        size="small"
        value={value}
        placeholder={placeholder}
        integer={integer}
        onChange={onChange}
      />
      {help === undefined ? null : <span style={HELP_STYLE}>{help}</span>}
    </label>
  );
}

const FIELD_STYLE = sizedFieldStyle(120);
