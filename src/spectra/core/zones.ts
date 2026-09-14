import { isNumber } from './problems.ts';

/**
 * One stretch of x as the settings hold it: an exclusion, a zone to keep, a
 * zone to drop.
 *
 * Read as a plain record rather than at upstream's type, because a zone a
 * reader is halfway through typing — or one pasted in with a bound written as
 * text — is still a zone the panel has to show, number and let them fix.
 */
export type ZoneEntry = Readonly<Record<string, unknown>>;

/**
 * A setting read as a list of stretches, one entry per row.
 *
 * Every entry of the list stays an entry, so the rows the editor draws and the
 * zones the problems number are the same list, and editing one row can never
 * write back a list that silently lost another. An entry that is not an object
 * at all reads as a zone with neither bound, which is what it is to the
 * processor.
 * @param value - What the settings hold under the key.
 * @returns The zones, empty when the value is not a list.
 */
export function readZones(value: unknown): ZoneEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: readonly unknown[] = value;
  const zones: ZoneEntry[] = [];
  for (const entry of entries) {
    zones.push(isZoneEntry(entry) ? entry : {});
  }
  return zones;
}

/**
 * One end of a stretch, as a number box can show it.
 * @param zone - One entry of a zone list.
 * @param end - Which end.
 * @returns The bound, or undefined when it is missing or not a number.
 */
export function zoneBound(
  zone: ZoneEntry,
  end: 'from' | 'to',
): number | undefined {
  const bound = zone[end];
  return typeof bound === 'number' ? bound : undefined;
}

/**
 * Whether a stretch names both of its ends, the right way round.
 * @param zone - One entry of a zone list.
 * @returns True when the processor can use it.
 */
export function isSpan(zone: ZoneEntry): boolean {
  return isNumber(zone.from) && isNumber(zone.to) && zone.from < zone.to;
}

/**
 * Whether one entry of the list can be read as a record of bounds.
 * @param entry - One entry of the list.
 * @returns True when it is an object.
 */
function isZoneEntry(entry: unknown): entry is ZoneEntry {
  return typeof entry === 'object' && entry !== null;
}
