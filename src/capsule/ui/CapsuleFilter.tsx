import type { Intent } from '@blueprintjs/core';
import { Tag } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

/** One capsule of a {@link CapsuleFilter} row. */
export interface CapsuleOption<TValue extends string = string> {
  /** What picking this capsule selects. */
  value: TValue;
  /** What the capsule reads. */
  label: string;
  /**
   * How many rows the capsule keeps, written after the label.
   * @default undefined — the capsule carries no count
   */
  count?: number;
  /**
   * Colour of the capsule, which says what the outcome means rather than
   * whether it is selected.
   * @default 'none'
   */
  intent?: Intent;
  /**
   * What the pointer is told when it rests on the capsule.
   * @default undefined
   */
  title?: string;
}

/** What a row of filter capsules needs. */
export interface CapsuleFilterProps<TValue extends string = string> {
  /** One entry per capsule, in the order they are drawn. */
  options: ReadonlyArray<CapsuleOption<TValue>>;
  /** The selected capsule. */
  value: TValue;
  /** Called with the newly picked value. */
  onChange: (value: TValue) => void;
  /**
   * What the group is called, for a screen reader reaching the row.
   * @default 'Filter'
   */
  label?: string;
  /**
   * How a count is written.
   * @default the number in the reader's locale, e.g. `1,204`
   */
  formatCount?: (count: number) => string;
  /**
   * Class the row carries, in addition to `capsule-filter`.
   * @default undefined
   */
  className?: string;
}

/**
 * The row of capsules that narrows a table to one outcome.
 *
 * Every capsule keeps its semantic colour whether or not it is selected, so
 * what a status means stays learnable — the filled shape is what encodes the
 * selection. Each is a real interactive tag, so the row is reachable by tab and
 * a capsule answers to Enter and Space.
 * @param props - See {@link CapsuleFilterProps}.
 * @returns The capsule row.
 */
export function CapsuleFilter<TValue extends string = string>(
  props: CapsuleFilterProps<TValue>,
): ReactElement {
  const {
    options,
    value,
    onChange,
    label = 'Filter',
    formatCount = defaultFormatCount,
    className,
  } = props;

  return (
    <div
      role="group"
      aria-label={label}
      className={
        className === undefined
          ? 'capsule-filter'
          : `capsule-filter ${className}`
      }
      style={ROW_STYLE}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Tag
            key={option.value}
            interactive
            round
            minimal={!selected}
            intent={option.intent}
            aria-pressed={selected}
            htmlTitle={option.title}
            onClick={() => onChange(option.value)}
          >
            {option.count === undefined
              ? option.label
              : `${option.label} (${formatCount(option.count)})`}
          </Tag>
        );
      })}
    </div>
  );
}

function defaultFormatCount(count: number): string {
  return count.toLocaleString();
}

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;
