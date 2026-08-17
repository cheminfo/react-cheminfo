import { MISSING_VALUE } from './missing.ts';

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const;
const BYTES_PER_UNIT = 1024;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

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
 * A duration written with its two largest units: `45s`, `3m 20s`, `2h 05m`.
 * @param milliseconds - The duration in milliseconds.
 * @returns The duration, or the missing marker when there is no finite, non-negative duration.
 */
export function formatDuration(milliseconds: number | undefined): string {
  if (
    milliseconds === undefined ||
    !Number.isFinite(milliseconds) ||
    milliseconds < 0
  ) {
    return MISSING_VALUE;
  }
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < SECONDS_PER_MINUTE) return `${seconds}s`;

  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes}m ${pad(remainingSeconds)}s`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;
  return `${hours}h ${pad(remainingMinutes)}m`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
