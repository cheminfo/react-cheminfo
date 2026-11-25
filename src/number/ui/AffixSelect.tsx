import type { ReactElement } from 'react';

/** What {@link AffixSelect} takes. */
export interface AffixSelectProps {
  /** The value chosen. */
  value: string;
  /** The values offered, each shown as it is written. */
  options: readonly string[];
  /** Called with the value chosen. */
  onChange: (value: string) => void;
  /** Its accessible name: the select has no label of its own. */
  ariaLabel: string;
  /** @default false */
  disabled?: boolean;
}

/**
 * A choice worn inside a box as its affix — the unit of a quantity, `nm` or
 * `px` — in the box's type and on its line, as a fixed affix is
 * (`.input-affix`, styles/chrome.css). Pass it as a `NumberInput`'s or an
 * `InputGroup`'s `rightElement`.
 * @param props - See {@link AffixSelectProps}.
 * @returns The select.
 */
export function AffixSelect(props: AffixSelectProps): ReactElement {
  const { value, options, onChange, ariaLabel, disabled = false } = props;
  return (
    <select
      className="affix-select"
      value={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
