import type { Intent } from '@blueprintjs/core';
import { Tag } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { formatInteger } from '../../format/core/numbers.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

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

/** The capsule drawn first in a multiple row, which clears the selection. */
export interface CapsuleAllOption {
  /** What the capsule reads, e.g. `all types`. */
  label: string;
  /**
   * How many rows an empty selection keeps, written after the label.
   * @default undefined — the capsule carries no count
   */
  count?: number;
  /**
   * What the pointer is told when it rests on the capsule.
   * @default undefined
   */
  title?: string;
}

/** What every row of filter capsules needs, whatever it selects. */
export interface CapsuleFilterBaseProps<TValue extends string = string> {
  /** One entry per capsule, in the order they are drawn. */
  options: ReadonlyArray<CapsuleOption<TValue>>;
  /**
   * What the group is called, for a screen reader reaching the row.
   * @default 'Filter'
   */
  label?: string;
  /**
   * How a count is written.
   * @default formatInteger — grouped in thousands, e.g. `1,204`
   */
  formatCount?: (count: number) => string;
  /**
   * Class the row carries, in addition to `capsule-filter`.
   * @default undefined
   */
  className?: string;
}

/** A row where exactly one capsule is selected. */
export interface SingleCapsuleFilterProps<
  TValue extends string = string,
> extends CapsuleFilterBaseProps<TValue> {
  /**
   * Whether several capsules may be selected at once.
   * @default false
   */
  multiple?: false;
  /** The selected capsule. */
  value: TValue;
  /** Called with the newly picked value. */
  onChange: (value: TValue) => void;
}

/** A row where any number of capsules is selected, none meaning all of them. */
export interface MultipleCapsuleFilterProps<
  TValue extends string = string,
> extends CapsuleFilterBaseProps<TValue> {
  /** Whether several capsules may be selected at once. */
  multiple: true;
  /** The selected capsules; an empty selection keeps every row. */
  values: readonly TValue[];
  /** Called with the new selection, in the order of `options`. */
  onChange: (values: TValue[]) => void;
  /**
   * The capsule that clears the selection, filled while nothing is selected.
   * @default undefined — the row has no reset capsule
   */
  allOption?: CapsuleAllOption;
}

/** What a row of filter capsules needs: one selected capsule, or several. */
export type CapsuleFilterProps<TValue extends string = string> =
  SingleCapsuleFilterProps<TValue> | MultipleCapsuleFilterProps<TValue>;

/**
 * The row of capsules that narrows a table to one outcome, or with `multiple`
 * to any set of them.
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
  const capsules =
    props.multiple === true ? multipleCapsules(props) : singleCapsules(props);
  const { label = 'Filter', className } = props;

  return (
    <div
      role="group"
      aria-label={label}
      className={joinClassNames('capsule-filter', className)}
      style={ROW_STYLE}
    >
      {capsules}
    </div>
  );
}

function singleCapsules<TValue extends string>(
  props: SingleCapsuleFilterProps<TValue>,
): ReactElement[] {
  const { options, value, onChange, formatCount = formatInteger } = props;
  const capsules: ReactElement[] = [];
  for (const option of options) {
    capsules.push(
      <Capsule
        key={`option:${option.value}`}
        text={capsuleText(option, formatCount)}
        selected={option.value === value}
        intent={option.intent}
        title={option.title}
        onClick={() => onChange(option.value)}
      />,
    );
  }
  return capsules;
}

function multipleCapsules<TValue extends string>(
  props: MultipleCapsuleFilterProps<TValue>,
): ReactElement[] {
  const {
    options,
    values,
    onChange,
    allOption,
    formatCount = formatInteger,
  } = props;
  const capsules: ReactElement[] = [];
  if (allOption !== undefined) {
    capsules.push(
      <Capsule
        key="all"
        text={capsuleText(allOption, formatCount)}
        selected={values.length === 0}
        title={allOption.title}
        onClick={() => onChange([])}
      />,
    );
  }
  for (const option of options) {
    capsules.push(
      <Capsule
        key={`option:${option.value}`}
        text={capsuleText(option, formatCount)}
        selected={values.includes(option.value)}
        intent={option.intent}
        title={option.title}
        onClick={() => onChange(toggled(options, values, option.value))}
      />,
    );
  }
  return capsules;
}

interface CapsuleProps {
  text: string;
  selected: boolean;
  intent?: Intent;
  title: string | undefined;
  onClick: () => void;
}

function Capsule(props: CapsuleProps): ReactElement {
  const { text, selected, intent, title, onClick } = props;
  return (
    <Tag
      interactive
      round
      minimal={!selected}
      intent={intent}
      aria-pressed={selected}
      htmlTitle={title}
      onClick={onClick}
    >
      {text}
    </Tag>
  );
}

function capsuleText(
  capsule: { label: string; count?: number },
  formatCount: (count: number) => string,
): string {
  return capsule.count === undefined
    ? capsule.label
    : `${capsule.label} (${formatCount(capsule.count)})`;
}

function toggled<TValue extends string>(
  options: ReadonlyArray<CapsuleOption<TValue>>,
  values: readonly TValue[],
  flipped: TValue,
): TValue[] {
  const next: TValue[] = [];
  for (const option of options) {
    const kept = values.includes(option.value);
    if (option.value === flipped ? !kept : kept) next.push(option.value);
  }
  return next;
}

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;
