import { Button, ButtonGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/** One value a {@link HeaderToggle} offers. */
export interface HeaderToggleOption<TValue extends string = string> {
  /** What picking it sets. */
  value: TValue;
  /**
   * What the button reads. It sits in the bar beside every other value, so it
   * is a mark rather than a sentence: `FR`, `°C`.
   */
  label: string;
  /**
   * What the pointer and a screen reader are told, e.g. `Français` behind
   * `FR`.
   * @default the label
   */
  title?: string;
}

/** Props of {@link HeaderToggle}. */
export interface HeaderToggleProps<TValue extends string = string> {
  /** What the row sets, e.g. `Language`: the name it is read by. */
  label: string;
  /** The values on offer, in the order they are shown. */
  options: ReadonlyArray<HeaderToggleOption<TValue>>;
  /** The value in force. */
  value: TValue;
  /** Called with the value picked. */
  onChange: (value: TValue) => void;
  /**
   * Whether the bar has run out of room: the row is then the one button of the
   * value in force, and a click advances to the next.
   * @default false
   */
  compact?: boolean;
  /**
   * `data-testid` of the row; each button carries it suffixed by its value.
   * @default undefined
   */
  testId?: string;
}

/**
 * A setting of the site header shown as the values themselves, the one in
 * force pressed — the language the page is written in, the scale a temperature
 * is read on.
 *
 * It is a row of buttons rather than a menu: there are two or four values, all
 * of them a mark wide, so a click sets one instead of opening a list to look
 * through, and the bar says what is set without being asked.
 * @param props - The values, the one in force, and what a click changes.
 * @returns The row, or the single advancing button of a narrow bar.
 */
export function HeaderToggle<TValue extends string>(
  props: HeaderToggleProps<TValue>,
): ReactElement | null {
  const { label, options, value, onChange, compact = false, testId } = props;
  const index = options.findIndex((option) => option.value === value);
  const current = options[index === -1 ? 0 : index];
  if (current === undefined) return null;

  if (compact) {
    const next = options[(options.indexOf(current) + 1) % options.length];
    return (
      <Button
        variant="minimal"
        className="site-toggle site-toggle--compact"
        text={current.label}
        aria-label={`${label}: ${current.title ?? current.label}`}
        title={`${label}: ${current.title ?? current.label}`}
        data-testid={testId}
        onClick={() => {
          if (next !== undefined) onChange(next.value);
        }}
      />
    );
  }

  return (
    <ButtonGroup className="site-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant="minimal"
          active={option.value === current.value}
          aria-pressed={option.value === current.value}
          text={option.label}
          title={option.title ?? option.label}
          data-testid={
            testId === undefined ? undefined : `${testId}-${option.value}`
          }
          onClick={() => {
            onChange(option.value);
          }}
        />
      ))}
    </ButtonGroup>
  );
}
