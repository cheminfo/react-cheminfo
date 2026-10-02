import type { NumberRange } from '@blueprintjs/core';
import { Button, RangeSlider as BlueprintRangeSlider } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { numberText } from '../../number/core/numberText.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type {
  RangeBounds,
  RangeDomain,
  RangeHandles,
} from '../core/rangeBounds.ts';
import {
  OPEN_RANGE,
  isRangeBounded,
  isRangeDomain,
  movedRange,
  rangeHandles,
  sameRange,
  settleHandles,
} from '../core/rangeBounds.ts';

import { RangeHistogram } from './RangeHistogram.tsx';
import { RangeValue } from './RangeValue.tsx';

/** What a `RangeSlider` needs. */
export interface RangeSliderProps {
  /** The quantity bounded, written over the track and read to a screen reader. */
  label: string;
  /**
   * The unit written after the label, e.g. `g/mol`.
   * @default undefined — nothing is written
   */
  unit?: string;
  /**
   * The two ends of the track, low first: usually the smallest and largest
   * value the data holds. A handle at an end leaves that side open, so a value
   * past the track is never cut by a filter nobody touched.
   */
  domain: RangeDomain;
  /** The range in force; a `null` side is open. */
  value: RangeBounds;
  /**
   * Called when the range settles: a handle released, a value typed, the range
   * cleared. Never while a handle is being dragged, so a page fetching on it
   * fetches once per gesture.
   */
  onChange: (range: RangeBounds) => void;
  /**
   * Called on every step of a drag, for what is cheap to redraw live — a count,
   * a heatmap computed in the page. Nothing that fetches belongs here.
   * @default undefined
   */
  onPreview?: (range: RangeBounds) => void;
  /**
   * The spacing the handles move by, from the low end of the track. Typed
   * values are not held to it.
   * @default 1
   */
  step?: number;
  /**
   * Whether only whole numbers can be typed. A typed decimal is rounded.
   * @default false
   */
  integer?: boolean;
  /**
   * How a value is written under the track.
   * @default the number as it is, with no grouping — a year is not `1,990`
   */
  format?: (value: number) => string;
  /**
   * How the values are spread along the track: one count per bin, the bins
   * splitting the track into equal widths. Drawn over the track, the part the
   * handles keep in the brand colour.
   * @default undefined — no histogram
   */
  histogram?: ArrayLike<number>;
  /** @default false */
  disabled?: boolean;
  /** @default undefined */
  className?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}

/** The range before a drag began, and where its handles are now. */
interface Drag {
  from: RangeBounds;
  handles: RangeHandles;
}

/**
 * A range picked with two handles, its two values written under the track
 * where a click turns either into a box to type an exact number.
 *
 * The handles are Blueprint's — the keyboard, the touch screen and the
 * screen reader are already handled there — dressed in the family's colours.
 * What this adds is the meaning of an end: a handle parked at the end of the
 * track is an open side, not a bound at the track's end.
 * @param props - See {@link RangeSliderProps}.
 * @returns The label, the track and the two values.
 */
export function RangeSlider(props: RangeSliderProps): ReactElement {
  const { label, unit, domain, value, onChange, onPreview } = props;
  const { step = 1, integer = false, format = numberText } = props;
  const { histogram, disabled = false, className, testId } = props;
  const t = useChromeT();
  const [drag, setDrag] = useState<Drag | null>(null);
  const [editing, setEditing] = useState<'min' | 'max' | null>(null);
  const spacing = step > 0 ? step : 1;
  const drawable = isRangeDomain(domain);
  const handles = drag?.handles ?? rangeHandles(value, domain);
  const shown = drag === null ? value : movedRange(drag.from, handles, domain);

  function move(next: NumberRange) {
    const from = drag?.from ?? value;
    const settled = settleHandles(next, from, spacing, domain);
    setDrag({ from, handles: settled });
    onPreview?.(movedRange(from, settled, domain));
  }

  function release(next: NumberRange) {
    const from = drag?.from ?? value;
    const settled = settleHandles(next, from, spacing, domain);
    const range = movedRange(from, settled, domain);
    setDrag(null);
    if (!sameRange(range, from)) onChange(range);
  }

  function type(side: 'min' | 'max', typed: number | undefined) {
    const range = { ...value, [side]: typed ?? null };
    if (!sameRange(range, value)) onChange(range);
  }

  return (
    <div
      className={joinClassNames('range-slider', className)}
      data-testid={testId}
    >
      <div className="range-slider__head">
        <span className="range-slider__label">
          {label}
          {unit ? <span className="range-slider__unit"> ({unit})</span> : null}
        </span>
        {isRangeBounded(value) && !disabled ? (
          <Button
            variant="minimal"
            size="small"
            icon="cross"
            aria-label={t('range.clear', { label })}
            title={t('range.clear', { label })}
            onClick={() => onChange(OPEN_RANGE)}
          />
        ) : null}
      </div>
      {drawable ? (
        <div className="range-slider__track">
          {histogram === undefined ? null : (
            <RangeHistogram
              counts={histogram}
              start={(handles[0] - domain[0]) / (domain[1] - domain[0])}
              end={(handles[1] - domain[0]) / (domain[1] - domain[0])}
            />
          )}
          <BlueprintRangeSlider
            min={domain[0]}
            max={domain[1]}
            stepSize={spacing}
            labelRenderer={false}
            disabled={disabled}
            value={[handles[0], handles[1]]}
            handleHtmlProps={{
              start: { 'aria-label': t('range.lowest', { label }) },
              end: { 'aria-label': t('range.highest', { label }) },
            }}
            onChange={move}
            onRelease={release}
          />
        </div>
      ) : null}
      <div className="range-slider__values">
        {(['min', 'max'] as const).map((side) => (
          <RangeValue
            key={side}
            side={side}
            bound={shown[side]}
            end={side === 'min' ? domain[0] : domain[1]}
            label={label}
            format={format}
            limit={side === 'min' ? value.max : value.min}
            step={spacing}
            integer={integer}
            disabled={disabled}
            editing={editing === side}
            onEdit={() => setEditing(side)}
            onDone={(typed, cancelled) => {
              setEditing(null);
              if (!cancelled) type(side, typed);
            }}
          />
        ))}
      </div>
    </div>
  );
}
