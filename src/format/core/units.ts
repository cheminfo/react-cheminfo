import { MISSING_VALUE } from './missing.ts';

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const;
const BYTES_PER_UNIT = 1024;
const MILLISECONDS_PER_SECOND = 1000;
const TENTHS_PER_MINUTE = 600;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

/** How a duration is spelled. */
export type DurationStyle = 'compact' | 'spaced';

const UNIT_NAMES: Record<
  DurationStyle,
  { millisecond: string; second: string; minute: string; hour: string }
> = {
  compact: { millisecond: 'ms', second: 's', minute: 'm', hour: 'h' },
  spaced: { millisecond: ' ms', second: ' s', minute: ' min', hour: ' h' },
};

/** How {@link formatDuration} writes a duration. */
export interface FormatDurationOptions {
  /**
   * `compact` glues each unit to its number (`3m 20s`), for a table cell;
   * `spaced` writes the units out (`3 min 20 s`), for a sentence.
   * @default 'compact'
   */
  style?: DurationStyle;
  /**
   * Whether a short duration keeps its fraction of a second: under a second it
   * is written in milliseconds (`450 ms`), and under a minute with one decimal
   * (`2.3 s`). Without it, both round to whole seconds.
   * @default false
   */
  subSecond?: boolean;
}

/**
 * A byte count in the largest unit that keeps it under a thousand: `512 B`,
 * `1.5 kB`, `240 MB`.
 *
 * Bytes are whole; every larger unit keeps one decimal until the number
 * reaches a hundred, where the decimal stops carrying information.
 * @param bytes - The size in bytes.
 * @returns The size and its unit, or the missing marker when there is no finite, non-negative size.
 */
export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return MISSING_VALUE;
  }
  let value = bytes;
  let unitIndex = 0;
  while (value >= BYTES_PER_UNIT && unitIndex < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }
  const digits = unitIndex === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${BYTE_UNITS[unitIndex] ?? 'B'}`;
}

/**
 * A duration written with its two largest units: `45s`, `3m 20s`, `2h 05m`,
 * or `45 s`, `3 min 20 s`, `2 h 05 min` in the spaced style.
 * @param milliseconds - The duration in milliseconds.
 * @param options - See {@link FormatDurationOptions}.
 * @returns The duration, or the missing marker when there is no finite, non-negative duration.
 */
export function formatDuration(
  milliseconds: number | undefined,
  options: FormatDurationOptions = {},
): string {
  if (
    milliseconds === undefined ||
    !Number.isFinite(milliseconds) ||
    milliseconds < 0
  ) {
    return MISSING_VALUE;
  }
  const { style = 'compact', subSecond = false } = options;
  const names = UNIT_NAMES[style];

  if (subSecond) {
    const whole = Math.round(milliseconds);
    if (whole < MILLISECONDS_PER_SECOND) return `${whole}${names.millisecond}`;
    const tenths = Math.round(milliseconds / 100);
    if (tenths < TENTHS_PER_MINUTE) {
      return `${(tenths / 10).toFixed(1)}${names.second}`;
    }
  }

  const seconds = Math.round(milliseconds / MILLISECONDS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) return `${seconds}${names.second}`;

  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes}${names.minute} ${pad(remainingSeconds)}${names.second}`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;
  return `${hours}${names.hour} ${pad(remainingMinutes)}${names.minute}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
