import { HTMLSelect, SegmentedControl, Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Fragment } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type {
  ChoiceSettingField,
  NumberSettingField,
  ToggleSettingField,
  ToolSettingField,
  ToolSettings,
} from '../core/protocol.ts';

/** What {@link ToolSettingControls} draws, and where a change goes. */
export interface ToolSettingControlsProps {
  /** How the tool describes its settings: `tool.settingFields`. */
  fields: readonly ToolSettingField[];
  /** What the tool says its settings are: `tool.settings`. */
  values: ToolSettings | null;
  /** Change some of the settings: `tool.setSettings`. */
  onChange: (settings: ToolSettings) => void;
  /**
   * One row for a toolbar, each control named by its tooltip and a switch by
   * its own label; or a form for a panel, each control beside its label.
   * @default 'row'
   */
  layout?: 'row' | 'form';
}

/** The most choices drawn side by side; more open as a list. */
const MAX_SEGMENTS = 4;

/** The most characters of choices drawn side by side, all labels together. */
const MAX_SEGMENT_TEXT = 28;

const ROW: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
};

const FORM: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr)',
  alignItems: 'center',
  gap: '0.4rem 0.75rem',
};

const LABEL: CSSProperties = { color: TOKEN.textMuted, fontSize: '0.8125rem' };

/**
 * The controls of a framed tool's settings, drawn from how the tool describes
 * them, so a host draws them with no code of its own per tool. Each shows
 * what the tool says, whoever changed it last, and a change goes to the tool
 * without reloading it.
 * @param props - See {@link ToolSettingControlsProps}.
 * @returns The controls, or nothing until the tool has said what it shows.
 */
export function ToolSettingControls(
  props: ToolSettingControlsProps,
): ReactElement | null {
  const { fields, values, onChange, layout = 'row' } = props;
  if (values === null || fields.length === 0) return null;
  return (
    <div
      className="tool-setting-controls"
      style={layout === 'form' ? FORM : ROW}
    >
      {fields.map((field) => {
        const control = (
          <SettingControl
            field={field}
            value={values[field.key]}
            onChange={onChange}
            labelled={layout === 'form'}
          />
        );
        if (layout === 'row') {
          return (
            <span key={field.key} title={field.description ?? field.label}>
              {control}
            </span>
          );
        }
        return (
          <Fragment key={field.key}>
            <span style={LABEL} title={field.description}>
              {field.label}
            </span>
            <span>{control}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

interface SettingControlProps<Field extends ToolSettingField> {
  field: Field;
  value: string | undefined;
  onChange: (settings: ToolSettings) => void;
}

function SettingControl(
  props: SettingControlProps<ToolSettingField> & { labelled: boolean },
): ReactElement {
  const { field, value, onChange, labelled } = props;
  if (field.type === 'choice') {
    return <ChoiceControl field={field} value={value} onChange={onChange} />;
  }
  if (field.type === 'toggle') {
    return (
      <ToggleControl
        field={field}
        value={value}
        onChange={onChange}
        labelled={labelled}
      />
    );
  }
  return <NumberControl field={field} value={value} onChange={onChange} />;
}

function ChoiceControl(
  props: SettingControlProps<ChoiceSettingField>,
): ReactElement {
  const { field, value, onChange } = props;
  const { key, label, choices } = field;
  let text = 0;
  for (const choice of choices) text += choice.label.length;
  if (choices.length <= MAX_SEGMENTS && text <= MAX_SEGMENT_TEXT) {
    return (
      <SegmentedControl
        size="small"
        aria-label={label}
        options={choices.map((choice) => ({ ...choice }))}
        value={value ?? ''}
        onValueChange={(next) => {
          onChange({ [key]: next });
        }}
      />
    );
  }
  return (
    <HTMLSelect
      iconName="caret-down"
      aria-label={label}
      value={value ?? ''}
      options={choices.map((choice) => ({ ...choice }))}
      onChange={(event) => {
        onChange({ [key]: event.currentTarget.value });
      }}
    />
  );
}

function ToggleControl(
  props: SettingControlProps<ToggleSettingField> & {
    /** Whether a label beside it names it already. */
    labelled: boolean;
  },
): ReactElement {
  const { field, value, onChange, labelled } = props;
  const { key, label, on = '1', off = '0' } = field;
  return (
    <Switch
      inline
      style={{ marginBottom: 0 }}
      checked={value === on}
      aria-label={label}
      label={labelled ? undefined : label}
      onChange={(event) => {
        onChange({ [key]: event.currentTarget.checked ? on : off });
      }}
    />
  );
}

function NumberControl(
  props: SettingControlProps<NumberSettingField>,
): ReactElement {
  const { field, value, onChange } = props;
  const { key, label, min, max, step, unit } = field;
  const number =
    value === undefined || value === '' ? Number.NaN : Number(value);
  return (
    <NumberInput
      allowEmpty
      size="small"
      buttons={false}
      ariaLabel={label}
      value={Number.isFinite(number) ? number : undefined}
      {...(min === undefined ? {} : { min })}
      {...(max === undefined ? {} : { max })}
      {...(step === undefined ? {} : { step })}
      {...(unit === undefined
        ? {}
        : { rightElement: <span style={LABEL}>{unit}</span> })}
      onChange={(next) => {
        if (next !== undefined) onChange({ [key]: String(next) });
      }}
    />
  );
}
