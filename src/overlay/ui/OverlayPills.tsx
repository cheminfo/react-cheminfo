import type { ReactElement } from 'react';
import { useId, useRef } from 'react';

import type { OverlayOption } from './OverlayRow.tsx';
import { handleOverlayPillKey } from './overlayPillKeys.ts';
import type { OverlaySegmentedSize } from './overlayPillStyles.ts';
import {
  overlayPillCountStyle,
  overlayPillGroupStyle,
  overlayPillStyle,
} from './overlayPillStyles.ts';
import { useOverlaySurface } from './overlaySurface.ts';

/** One choice offered by an {@link OverlayPills}. */
export interface OverlayPillOption<
  TValue extends string = string,
> extends OverlayOption<TValue> {
  /**
   * How many things this choice covers, written small after its label — the
   * number of samples in a group, of components in a view.
   * @default undefined — no count is written
   */
  count?: number;
}

/** What {@link OverlayPills} needs. */
export interface OverlayPillsProps<TValue extends string = string> {
  /** The current choice. */
  value: TValue;
  /** What may be chosen, in the order offered. */
  options: ReadonlyArray<OverlayPillOption<TValue>>;
  /** Called with the new choice. */
  onChange: (value: TValue) => void;
  /** What the group is called, for a reader arriving by keyboard. */
  label: string;
  /**
   * What the group is: a strip moving between the views of one figure, or a
   * set of choices for one setting. The look is the same either way — it is
   * the announcement and the shape of the keyboard that differ.
   * @default 'tablist'
   */
  role?: 'tablist' | 'radiogroup';
  /**
   * How big it is drawn: the figure's own tab bar, or one question inside a
   * card, which is a little smaller.
   * @default 'strip'
   */
  size?: OverlaySegmentedSize;
  /**
   * The `id` of the panel a tab strip drives, so a screen reader can walk from
   * a tab to what it shows. One panel is normally shared, since only the tab
   * in force is ever rendered.
   * @default undefined
   */
  panelId?: string;
  /**
   * Stem of the `id` every tab carries, for a panel that names the tab it
   * belongs to. Left out, one is generated.
   * @default undefined — a generated id
   */
  baseId?: string;
  /**
   * Whether the whole group is greyed and unreachable.
   * @default false
   */
  disabled?: boolean;
  /**
   * Value of the `data-testid` attribute of the group.
   * @default undefined
   */
  testId?: string;
}

/**
 * A row of choices in a sunken track, the one in force lifted out of it.
 *
 * It is the package's one segmented control, used both as a figure's tab strip
 * and as a setting inside a card, because a reader who has learned to press
 * one of them has learned to press the other. Only one segment is in the tab
 * order — the one in force — and the arrows move between them from there, so
 * a strip of six views costs a reader walking the page one stop rather than
 * six.
 * @param props - See {@link OverlayPillsProps}.
 * @returns The group.
 */
export function OverlayPills<TValue extends string = string>(
  props: OverlayPillsProps<TValue>,
): ReactElement {
  const { value, options, onChange, label, role = 'tablist' } = props;
  const { panelId, baseId, size = 'strip', disabled = false, testId } = props;
  const { metrics } = useOverlaySurface();
  const generatedId = useId();
  const pills = useRef<Array<HTMLButtonElement | null>>([]);

  const tabs = role === 'tablist';
  const stem = baseId ?? generatedId;
  let selectedIndex = -1;
  for (let index = 0; index < options.length; index++) {
    if (options[index]?.value === value) selectedIndex = index;
  }

  return (
    <div
      role={role}
      aria-label={label}
      data-testid={testId}
      style={overlayPillGroupStyle(metrics, size)}
      onKeyDown={(event) => {
        handleOverlayPillKey(event, {
          length: options.length,
          selectedIndex,
          onSelect: (index) => {
            const option = options[index];
            if (option === undefined || option.disabled === true) return;
            pills.current[index]?.focus();
            onChange(option.value);
          },
        });
      }}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const unreachable = disabled || option.disabled === true;
        return (
          <button
            key={option.value}
            ref={(element) => {
              pills.current[index] = element;
            }}
            type="button"
            role={tabs ? 'tab' : 'radio'}
            id={tabs ? `${stem}-${option.value}` : undefined}
            aria-selected={tabs ? selected : undefined}
            aria-checked={tabs ? undefined : selected}
            aria-controls={tabs ? panelId : undefined}
            title={option.title}
            disabled={unreachable}
            tabIndex={index === Math.max(selectedIndex, 0) ? 0 : -1}
            style={overlayPillStyle(metrics, {
              selected,
              disabled: unreachable,
              size,
            })}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count === undefined ? null : (
              <span style={overlayPillCountStyle(metrics, selected)}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
