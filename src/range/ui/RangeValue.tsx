import type { KeyboardEvent, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** What one end of a range slider's row of values needs. */
export interface RangeValueProps {
  /** Which end this is. */
  side: 'min' | 'max';
  /** The bound on this side, or `null` when the side is open. */
  bound: number | null;
  /** The end of the track on this side, shown faint while the side is open. */
  end: number;
  /** The quantity the slider bounds, for a screen reader. */
  label: string;
  /** How a number is written. */
  format: (value: number) => string;
  /** The bound on the other side, which a typed value may not cross. */
  limit: number | null;
  /** What one press of an arrow key adds in the box. */
  step: number;
  /** Whether only whole numbers are wanted. */
  integer: boolean;
  /** Whether the value can be edited. */
  disabled: boolean;
  /** Whether the box is open for typing. */
  editing: boolean;
  /** Open the box. */
  onEdit: () => void;
  /**
   * Close the box, with what it holds — `undefined` for an emptied box — and
   * whether Escape closed it, in which case nothing typed is kept.
   */
  onDone: (value: number | undefined, cancelled: boolean) => void;
}

/**
 * One end of a range, written under the track: a bound, or the end of the
 * track in faint ink when the side is open. A click turns it into a box, so a
 * value the handles cannot land on is still one click and a few keystrokes
 * away.
 * @param props - See {@link RangeValueProps}.
 * @returns The value, or the box it is typed into.
 */
export function RangeValue(props: RangeValueProps): ReactElement {
  const { side, bound, end, label, format, disabled, editing, onEdit } = props;
  const t = useChromeT();
  if (editing) {
    const { limit, step, integer, onDone } = props;
    return (
      <RangeValueEditor
        side={side}
        bound={bound}
        end={end}
        label={label}
        format={format}
        limit={limit}
        step={step}
        integer={integer}
        onDone={onDone}
      />
    );
  }

  const open = bound === null;
  const shown = open ? end : bound;
  const text = Number.isFinite(shown) ? format(shown) : '–';
  const name = open
    ? t(side === 'min' ? 'range.noLowerBound' : 'range.noUpperBound', {
        label,
      })
    : t(side === 'min' ? 'range.lowestIs' : 'range.highestIs', {
        label,
        value: text,
      });

  return (
    <button
      type="button"
      className={joinClassNames(
        'range-slider__value',
        open && 'range-slider__value--open',
      )}
      disabled={disabled}
      title={t('range.typeValue')}
      aria-label={name}
      onClick={onEdit}
    >
      {text}
    </button>
  );
}

/** What the box a value is typed into needs. */
type RangeValueEditorProps = Omit<
  RangeValueProps,
  'disabled' | 'editing' | 'onEdit'
>;

/**
 * The box a value is typed into. Enter or leaving it keeps what it holds;
 * Escape drops it.
 * @param props - See {@link RangeValueEditorProps}.
 * @returns The box, focused and selected.
 */
function RangeValueEditor(props: RangeValueEditorProps): ReactElement {
  const { side, bound, end, label, format, limit, step, integer } = props;
  const { onDone } = props;
  const t = useChromeT();
  const [typed, setTyped] = useState<number | undefined>(bound ?? undefined);
  // The box settles its number — rounded, held inside its bounds — as it is
  // left, and that happens in the same blur this wrapper hears afterwards,
  // before any re-render: refs are what carry it across.
  const latest = useRef(typed);
  const cancelled = useRef(false);
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const input = host.current?.querySelector('input');
    input?.focus();
    input?.select();
  }, []);

  function press(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== 'Enter' && event.key !== 'Escape') return;
    event.preventDefault();
    // An Escape that closes the box must not also close a dialog around it.
    event.stopPropagation();
    cancelled.current = event.key === 'Escape';
    if (event.target instanceof HTMLElement) event.target.blur();
  }

  return (
    <span
      ref={host}
      className={joinClassNames(
        'range-slider__editor',
        `range-slider__editor--${side}`,
      )}
      onKeyDown={press}
      onBlur={() => onDone(latest.current, cancelled.current)}
    >
      <NumberInput
        allowEmpty
        size="small"
        buttons={false}
        fill
        value={typed}
        step={step}
        integer={integer}
        min={side === 'max' ? (limit ?? undefined) : undefined}
        max={side === 'min' ? (limit ?? undefined) : undefined}
        placeholder={Number.isFinite(end) ? format(end) : undefined}
        ariaLabel={t(side === 'min' ? 'range.lowest' : 'range.highest', {
          label,
        })}
        onChange={(next) => {
          latest.current = next;
          setTyped(next);
        }}
      />
    </span>
  );
}
