import { HTMLSelect, InputGroup, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { ScaleSettings } from '../core/settings.ts';

import { XWindowFields } from './XWindowFields.tsx';
import {
  FIELD_STYLE,
  HELP_STYLE,
  LABEL_STYLE,
  ROW_STYLE,
  SWITCH_STYLE,
} from './fieldStyles.ts';
import {
  POINT_NUMBER_WINS,
  scaleMethodOptions,
  withScaleMethod,
  withScaleRange,
  withScaleTarget,
} from './scaleOptions.ts';

/** What {@link ScaleFields} edits. */
interface ScaleFieldsProps {
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
        <XWindowFields
          value={value.range ?? {}}
          withPoints
          onChange={(patch) => {
            onChange(withScaleRange(value, patch));
          }}
        />
      </div>
      <span style={HELP_STYLE}>{POINT_NUMBER_WINS}</span>

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
