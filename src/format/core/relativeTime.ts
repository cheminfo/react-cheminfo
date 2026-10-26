import { MISSING_VALUE } from './missing.ts';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS: ReadonlyArray<{
  unit: Intl.RelativeTimeFormatUnit;
  milliseconds: number;
}> = [
  { unit: 'year', milliseconds: 365 * DAY },
  { unit: 'month', milliseconds: 30 * DAY },
  { unit: 'week', milliseconds: 7 * DAY },
  { unit: 'day', milliseconds: DAY },
  { unit: 'hour', milliseconds: HOUR },
  { unit: 'minute', milliseconds: MINUTE },
];

/** One formatter per locale, made the first time that locale is asked for. */
const FORMATTERS = new Map<string, Intl.RelativeTimeFormat>();

/** How {@link formatRelativeTime} measures and what it writes for nothing. */
export interface FormatRelativeTimeOptions {
  /**
   * The instant the distance is measured from, in epoch milliseconds or as a
   * date. Pass it when a list is drawn, so every row is measured against the
   * same moment and a test gets the same words every time.
   * @default Date.now()
   */
  now?: number | Date;
  /**
   * What is written when there is no instant, or it cannot be read.
   * @default MISSING_VALUE
   */
  missing?: string;
  /**
   * The language the phrase is written in: the page's, from `useLanguage()`.
   * @default 'en-US'
   */
  locale?: string;
}

/**
 * How far an instant is from now, in words: `just now`, `5 minutes ago`,
 * `yesterday`, `in 3 weeks` — or `il y a 5 minutes` in French.
 *
 * The largest unit that fits is used and the count is rounded towards zero, so
 * ninety minutes read `1 hour ago` rather than claiming two. Under a minute
 * either way is `just now` (the language's own word for now, outside
 * English), which also absorbs a clock that is a few seconds ahead.
 * @param instant - Epoch milliseconds, an ISO timestamp or a date.
 * @param options - See {@link FormatRelativeTimeOptions}.
 * @returns The phrase, or the missing text when the instant is absent or unreadable.
 */
export function formatRelativeTime(
  instant: number | string | Date | undefined,
  options: FormatRelativeTimeOptions = {},
): string {
  const {
    now = Date.now(),
    missing = MISSING_VALUE,
    locale = 'en-US',
  } = options;
  const time = toTime(instant);
  const reference = toTime(now);
  if (time === undefined || reference === undefined) return missing;

  const formatter = formatterOf(locale);
  const elapsed = time - reference;
  const distance = Math.abs(elapsed);
  for (const { unit, milliseconds } of UNITS) {
    if (distance >= milliseconds) {
      const count = Math.floor(distance / milliseconds);
      return formatter.format(elapsed < 0 ? -count : count, unit);
    }
  }
  return locale.toLowerCase().startsWith('en')
    ? 'just now'
    : formatter.format(0, 'second');
}

function formatterOf(locale: string): Intl.RelativeTimeFormat {
  let formatter = FORMATTERS.get(locale);
  if (formatter === undefined) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    FORMATTERS.set(locale, formatter);
  }
  return formatter;
}

function toTime(
  instant: number | string | Date | undefined,
): number | undefined {
  if (instant === undefined || instant === '') return undefined;
  const time =
    typeof instant === 'number'
      ? instant
      : typeof instant === 'string'
        ? Date.parse(instant)
        : instant.getTime();
  return Number.isFinite(time) ? time : undefined;
}
