import { HTMLSelect, InputGroup, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { ScaleSettings } from '../core/settings.ts';

import { NumberField } from './NumberField.tsx';
import {
  scaleMethodOptions,
  withScaleMethod,
  withScaleRange,
  withScaleTarget,
} from './scaleOptions.ts';

/** What {@link ScaleFields} edits. */
export interface ScaleFieldsProps {
  /** How every spectrum is scaled onto the reference one. */
  value: ScaleSettings;
  /** Called with the edited scaling on every change. */
  onChange: (scale: ScaleSettings) => void;
  /**
   * The ids the processor holds, so the reference is picked rather than typed.
   * @default undefined — the reference is typed into a box instead
   */
  spectrumIds?: readonly string[];
}

/**
 * What every spectrum is scaled against, and over which stretch of x.
 *
 * The reference is a spectrum rather than a number, because the point of this
 * stage is to make one dataset comparable with itself: every spectrum is
 * stretched until the chosen feature — its smallest value, its largest, its
 * integral — matches the reference's over the same window. A method or a
 * reference the processor cannot match is still drawn, because a menu that
 * quietly falls back to its first entry would show settings nobody holds.
 * @param props - See {@link ScaleFieldsProps}.
 * @returns The method, the reference, the window and the relative switch.
 */
export function ScaleFields(props: ScaleFieldsProps): ReactElement {
  const { value, onChange, spectrumIds } = props;
  const range = value.range ?? {};

  return (
    <div style={FIELDS_STYLE}>
      <label style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Method</span>
        <HTMLSelect
          aria-label="Scaling method"
          fill
          value={value.method ?? ''}
          options={scaleMethodOptions(value.method)}
          onChange={(event) => {
            onChange(withScaleMethod(value, event.currentTarget.value));
          }}
        />
      </label>

      <label style={FIELD_STYLE}>
        <span style={LABEL_STYLE}>Reference spectrum</span>
        {spectrumIds === undefined ? (
          <InputGroup
            size="small"
            fill
            aria-label="Reference spectrum"
            placeholder="the first spectrum the processor holds"
            spellCheck={false}
            autoComplete="off"
            value={value.targetID ?? ''}
            onValueChange={(targetID) => {
              onChange(withScaleTarget(value, targetID));
            }}
          />
        ) : (
          <HTMLSelect
            aria-label="Reference spectrum"
            fill
            value={value.targetID ?? ''}
            onChange={(event) => {
              onChange(withScaleTarget(value, event.currentTarget.value));
            }}
          >
            <option value="">The first spectrum the processor holds</option>
            {spectrumIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
            {value.targetID === undefined ||
            spectrumIds.includes(value.targetID) ? null : (
              <option value={value.targetID}>
                {`${value.targetID} — not a spectrum the processor holds`}
              </option>
            )}
          </HTMLSelect>
        )}
      </label>

      <div style={ROW_STYLE}>
        <NumberField
          label="From"
          value={range.from}
          placeholder="the first x"
          onChange={(from) => {
            onChange(withScaleRange(value, { from }));
          }}
        />
        <NumberField
          label="To"
          value={range.to}
          placeholder="the last x"
          onChange={(to) => {
            onChange(withScaleRange(value, { to }));
          }}
        />
        <NumberField
          label="From point"
          value={range.fromIndex}
          integer
          placeholder="0"
          onChange={(fromIndex) => {
            onChange(withScaleRange(value, { fromIndex }));
          }}
        />
        <NumberField
          label="To point"
          value={range.toIndex}
          integer
          placeholder="the last point"
          onChange={(toIndex) => {
            onChange(withScaleRange(value, { toIndex }));
          }}
        />
      </div>
      <span style={HELP_STYLE}>
        A point number silently wins over an x value: with From point set, From
        is never read.
      </span>

      <Switch
        checked={value.relative === true}
        label="Subtract the reference spectrum"
        style={SWITCH_STYLE}
        onChange={(event) => {
          onChange({ ...value, relative: event.currentTarget.checked });
        }}
      />
    </div>
  );
}

const FIELDS_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const SWITCH_STYLE = {
  margin: 0,
  fontSize: 12,
} as const satisfies CSSProperties;
