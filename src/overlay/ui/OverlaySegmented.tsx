import type { ReactElement } from 'react';

import { OverlayPills } from './OverlayPills.tsx';
import type { OverlayControlProps, OverlayOption } from './OverlayRow.tsx';
import { OverlayRow } from './OverlayRow.tsx';

/** What {@link OverlaySegmented} needs. Use it for two to four choices. */
export interface OverlaySegmentedProps<
  TValue extends string = string,
> extends OverlayControlProps {
  /** The current choice. */
  value: TValue;
  /** What may be chosen, in the order offered. */
  options: ReadonlyArray<OverlayOption<TValue>>;
  /** Called with the new choice. */
  onChange: (value: TValue) => void;
}

/**
 * The row of segments a card uses while every choice still fits on one line.
 *
 * Its choices are readable without being opened, which is worth the width up
 * to about four of them: a reader who can see that a second view exists asks
 * for it, and a reader looking at a closed picker does not.
 *
 * It is the same sunken track a figure's tab strip is made of, one size down,
 * so a reader meets one device in a viewer rather than two that happen to both
 * be rows of choices. The segments carry the caption's own name, because a
 * bare row of buttons over a figure is announced as nothing at all to a reader
 * arriving by keyboard.
 * @param props - See {@link OverlaySegmentedProps}.
 * @returns The caption, its help, and the segments.
 */
export function OverlaySegmented<TValue extends string = string>(
  props: OverlaySegmentedProps<TValue>,
): ReactElement {
  const {
    value,
    options,
    onChange,
    label,
    help,
    hideLabel = false,
    disabled = false,
    testId,
  } = props;

  return (
    <OverlayRow
      label={label}
      help={help}
      hideLabel={hideLabel}
      disabled={disabled}
    >
      <OverlayPills
        role="radiogroup"
        size="setting"
        label={label}
        value={value}
        options={options}
        disabled={disabled}
        testId={testId}
        onChange={onChange}
      />
    </OverlayRow>
  );
}
