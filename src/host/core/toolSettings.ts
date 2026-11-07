/**
 * A tool's settings as the host protocol carries them: the values, and how a
 * host draws a control for each.
 *
 * A setting changes how a tool shows what it holds, never what it holds, so a
 * host's controls drive it without reloading the tool. The tool describes each
 * setting — a choice among a few values, a switch, a number — and a host draws
 * the control from that description, with no code of its own per tool. The
 * description travels with the values, in every `settings` message, because it
 * follows what the tool holds: the conformers 3d offers are those of the
 * molecule on screen.
 */

import { MAX_ITEMS, MAX_LABEL_LENGTH, isRecord } from './messageValues.ts';

/**
 * What a tool's visitor could set inside it, by name, each value written as a
 * string the way an address writes it: `{ surface: '0.7' }`.
 */
export type ToolSettings = Readonly<Record<string, string>>;

/**
 * `settings`: change how the tool shows what it holds. The frame stays and the
 * document stays, so a host's toolbar can drive a tool that would have to
 * compute everything again if it were opened at another address. A setting the
 * tool does not know is ignored.
 */
export interface SettingsRequest {
  type: 'settings';
  id: string;
  settings: ToolSettings;
}

/**
 * Sent by the tool, unasked, when it connects and whenever one of its settings
 * changes — from a host's request, or from its visitor. It carries all of them,
 * so a host's controls show what the tool is doing rather than what was last
 * asked of it. A tool that has none never sends it.
 */
export interface SettingsMessage {
  type: 'settings';
  settings: ToolSettings;
  /**
   * How a host draws a control for each setting, in the order to draw them.
   * @default undefined — the tool describes none, and a host draws only the
   * controls it knows
   */
  fields?: ToolSettingField[];
}

/** One value a choice offers. */
export interface ToolSettingChoice {
  /** The value, as the setting writes it. */
  value: string;
  /** What the control shows for it, short: `'Ball and stick'`. */
  label: string;
}

/** What every described setting says. */
interface SettingFieldBase {
  /** The setting it sets, by the name `settings` carries it under. */
  key: string;
  /** What the control is called, short: `'Surface'`. */
  label: string;
  /**
   * What the setting does, in one sentence, for a tooltip.
   * @default undefined
   */
  description?: string;
}

/** A setting taking one of a few values. */
export interface ChoiceSettingField extends SettingFieldBase {
  type: 'choice';
  /** The values offered, in the order to offer them. */
  choices: readonly ToolSettingChoice[];
}

/** A setting that is on or off. */
export interface ToggleSettingField extends SettingFieldBase {
  type: 'toggle';
  /**
   * The value meaning on, as an address writes it.
   * @default '1'
   */
  on?: string;
  /**
   * The value meaning off, as an address writes it.
   * @default '0'
   */
  off?: string;
}

/** A setting taking a number. */
export interface NumberSettingField extends SettingFieldBase {
  type: 'number';
  /**
   * The smallest value.
   * @default undefined — none
   */
  min?: number;
  /**
   * The largest value.
   * @default undefined — none
   */
  max?: number;
  /**
   * How far an arrow key moves it.
   * @default 1
   */
  step?: number;
  /**
   * The unit written after the number, e.g. `'%'`.
   * @default undefined
   */
  unit?: string;
}

/** How a host draws a control for one of a tool's settings. */
export type ToolSettingField =
  ChoiceSettingField | ToggleSettingField | NumberSettingField;

/** How long a description may be, in characters; the rest is cut. */
const MAX_DESCRIPTION_LENGTH = 300;

/**
 * Read the fields a tool sent, as the untrusted input they are: a field that
 * is not well formed is left out, and so is a second field for one setting.
 * @param value - What the message carried.
 * @returns The fields, in the order sent.
 */
export function readSettingFields(value: unknown): ToolSettingField[] {
  if (!Array.isArray(value)) return [];
  const fields: ToolSettingField[] = [];
  const keys = new Set<string>();
  const count = Math.min(value.length, MAX_ITEMS);
  for (let index = 0; index < count; index++) {
    const field = readField(value[index]);
    if (field === undefined || keys.has(field.key)) continue;
    keys.add(field.key);
    fields.push(field);
  }
  return fields;
}

function readField(value: unknown): ToolSettingField | undefined {
  if (!isRecord(value)) return undefined;
  const { key, label, description, type, on, off, choices } = value;
  if (typeof key !== 'string' || key === '' || typeof label !== 'string') {
    return undefined;
  }
  const base: SettingFieldBase = {
    key: key.slice(0, MAX_LABEL_LENGTH),
    label: label.slice(0, MAX_LABEL_LENGTH),
  };
  if (typeof description === 'string') {
    base.description = description.slice(0, MAX_DESCRIPTION_LENGTH);
  }
  if (type === 'choice') {
    const read = readChoices(choices);
    return read.length === 0 ? undefined : { ...base, type, choices: read };
  }
  if (type === 'toggle') {
    const field: ToggleSettingField = { ...base, type };
    if (typeof on === 'string') field.on = on;
    if (typeof off === 'string') field.off = off;
    return (field.on ?? '1') === (field.off ?? '0') ? undefined : field;
  }
  if (type === 'number') return readNumberField(base, value);
  return undefined;
}

function readChoices(value: unknown): ToolSettingChoice[] {
  if (!Array.isArray(value)) return [];
  const choices: ToolSettingChoice[] = [];
  const count = Math.min(value.length, MAX_ITEMS);
  for (let index = 0; index < count; index++) {
    const choice: unknown = value[index];
    if (
      isRecord(choice) &&
      typeof choice.value === 'string' &&
      typeof choice.label === 'string'
    ) {
      choices.push({
        value: choice.value.slice(0, MAX_LABEL_LENGTH),
        label: choice.label.slice(0, MAX_LABEL_LENGTH),
      });
    }
  }
  return choices;
}

function readNumberField(
  base: SettingFieldBase,
  value: Record<string, unknown>,
): NumberSettingField | undefined {
  const field: NumberSettingField = { ...base, type: 'number' };
  const { min, max, step, unit } = value;
  if (isFiniteNumber(min)) field.min = min;
  if (isFiniteNumber(max)) field.max = max;
  if (isFiniteNumber(step) && step > 0) field.step = step;
  if (typeof unit === 'string') field.unit = unit.slice(0, MAX_LABEL_LENGTH);
  const { min: low, max: high } = field;
  return low !== undefined && high !== undefined && low > high
    ? undefined
    : field;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
