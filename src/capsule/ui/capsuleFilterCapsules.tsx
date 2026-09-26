/**
 * The capsules of a filter row, and nothing around them.
 *
 * They are a plain function of the row's props; the row itself reads the
 * language of the page, which only a render can do, so the two are separate.
 */

import type { ReactElement } from 'react';

import { formatInteger } from '../../format/core/numbers.ts';

import { Capsule } from './Capsule.tsx';
import type {
  CapsuleFilterProps,
  CapsuleOption,
  MultipleCapsuleFilterProps,
  SingleCapsuleFilterProps,
} from './CapsuleFilter.tsx';

/**
 * The capsules a row draws, in order.
 * @param props - See `CapsuleFilterProps`.
 * @returns The capsules.
 */
export function capsuleFilterCapsules<TValue extends string = string>(
  props: CapsuleFilterProps<TValue>,
): ReactElement[] {
  return props.multiple === true
    ? multipleCapsules(props)
    : singleCapsules(props);
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
        selected={allOption.selected ?? values.length === 0}
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
