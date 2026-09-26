import type { Intent } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { capsuleFilterCapsules } from './capsuleFilterCapsules.tsx';

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
  /**
   * Whether the capsule is filled, for a row that reads its selection back
   * from a richer state: a pick no capsule can spell leaves `values` empty
   * without meaning every row is kept.
   * @default undefined — filled while no capsule is selected
   */
  selected?: boolean;
}

/** What every row of filter capsules needs, whatever it selects. */
export interface CapsuleFilterBaseProps<TValue extends string = string> {
  /** One entry per capsule, in the order they are drawn. */
  options: ReadonlyArray<CapsuleOption<TValue>>;
  /**
   * What the group is called, for a screen reader reaching the row.
   * @default the chrome's own word for it, in the language of the page
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
  /**
   * What the row reads back, drawn muted after the last capsule: the selection
   * the capsules cannot spell on their own, or how else it is made. It wraps
   * with them rather than sitting on a line of its own, so the one place a
   * selection is made is the one place it is read.
   * @default undefined — the row is capsules alone
   */
  note?: ReactNode;
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
 * a capsule answers to Enter and Space. A `note` rides at the end of the row,
 * which is where a selection finer than the capsules can spell is read back.
 * @param props - See {@link CapsuleFilterProps}.
 * @returns The capsule row.
 */
export function CapsuleFilter<TValue extends string = string>(
  props: CapsuleFilterProps<TValue>,
): ReactElement {
  const { label, className, note } = props;
  const t = useChromeT();

  return (
    <div
      role="group"
      aria-label={label ?? t('capsule.filter')}
      className={joinClassNames('capsule-filter', className)}
      style={ROW_STYLE}
    >
      {capsuleFilterCapsules(props)}
      {note === undefined ? null : (
        <span className="capsule-filter__note" style={NOTE_STYLE}>
          {note}
        </span>
      )}
    </div>
  );
}

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  marginLeft: 2,
  color: TOKEN.textMuted,
  fontSize: '0.75rem',
} as const satisfies CSSProperties;
