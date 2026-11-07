/**
 * The values inside a protocol message, read as the untrusted input they are,
 * on either side of the frame boundary.
 */

import type { HostItem, ToolSettings } from './protocol.ts';

/** How many items one message may carry; the rest are dropped. */
export const MAX_ITEMS = 64;

/** How long a label may be, in characters; a longer one is cut. */
export const MAX_LABEL_LENGTH = 80;

/**
 * Read the items of a message, dropping those without a string `kind`, at
 * most {@link MAX_ITEMS} of them, each label cut to {@link MAX_LABEL_LENGTH}.
 * @param values - The items as they arrived.
 * @returns The items.
 */
export function readItems(values: readonly unknown[]): HostItem[] {
  const items: HostItem[] = [];
  const count = Math.min(values.length, MAX_ITEMS);
  for (let index = 0; index < count; index++) {
    const value = values[index];
    if (!isRecord(value) || typeof value.kind !== 'string') continue;
    const item: HostItem = { kind: value.kind, value: value.value };
    if (typeof value.id === 'string') item.id = value.id;
    if (typeof value.key === 'string') item.key = value.key;
    if (typeof value.label === 'string') {
      item.label = value.label.slice(0, MAX_LABEL_LENGTH);
    }
    items.push(item);
  }
  return items;
}

/**
 * Read a list of strings, dropping anything else.
 * @param value - The list as it arrived.
 * @returns Its strings, or none when it is not a list.
 */
export function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const strings: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') strings.push(entry);
  }
  return strings;
}

/**
 * Read a tool's settings, keeping the strings at most {@link MAX_ITEMS} of
 * them, each value cut to {@link MAX_LABEL_LENGTH}.
 * @param value - The settings as they arrived.
 * @returns The settings, or none when it is not an object.
 */
export function readSettings(value: unknown): ToolSettings {
  if (!isRecord(value)) return {};
  const settings: Array<[string, string]> = [];
  for (const [name, setting] of Object.entries(value)) {
    if (typeof setting !== 'string') continue;
    settings.push([name, setting.slice(0, MAX_LABEL_LENGTH)]);
    if (settings.length === MAX_ITEMS) break;
  }
  return Object.fromEntries(settings);
}

/**
 * Whether a value is a plain object, as every message is.
 * @param value - The value.
 * @returns `true` for an object that is not an array.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
