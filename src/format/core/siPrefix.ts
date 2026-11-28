import type { Language } from '../../i18n/core/languages.ts';

import { MINUS_SIGN } from './minus.ts';
import { MISSING_VALUE } from './missing.ts';
import { formatTrimmed } from './numbers.ts';

/** What keeps a number on the line of its unit. */
const NO_BREAK_SPACE = '\u00A0';

/** The prefixes, from mega to pico. */
const PREFIXES = [
  { factor: 1e6, prefix: 'M' },
  { factor: 1e3, prefix: 'k' },
  { factor: 1, prefix: '' },
  { factor: 1e-3, prefix: 'm' },
  { factor: 1e-6, prefix: 'µ' },
  { factor: 1e-9, prefix: 'n' },
  { factor: 1e-12, prefix: 'p' },
] as const;

/** How {@link formatSi} writes a value. */
export interface FormatSiOptions {
  /**
   * The language of the page: its decimal separator.
   * @default 'en'
   */
  language?: Language;
  /**
   * What stands between the number and its unit.
   * @default U+00A0, a no-break space, which keeps them on one line
   */
  space?: string;
}

/**
 * A value of a base unit written with the SI prefix that keeps it between 1
 * and 1000, to three figures: `4.7 kΩ`, `2.31 mA`, `−0.76 V`.
 * @param value - The value, in the base unit: volts, amperes, ohms.
 * @param unit - The base unit's symbol: `V`, `A`, `Ω`.
 * @param options - The page's language, and the space before the unit.
 * @returns The value written out, a minus sign for a negative one.
 */
export function formatSi(
  value: number,
  unit: string,
  options: FormatSiOptions = {},
): string {
  const { language = 'en', space = NO_BREAK_SPACE } = options;
  if (!Number.isFinite(value)) return `${MISSING_VALUE}${space}${unit}`;
  const size = Math.abs(value);
  if (size === 0) return `0${space}${unit}`;
  let chosen: (typeof PREFIXES)[number] = PREFIXES[6];
  for (const entry of PREFIXES) {
    if (size >= entry.factor * 0.9995) {
      chosen = entry;
      break;
    }
  }
  const scaled = Number.parseFloat((size / chosen.factor).toPrecision(3));
  const sign = value < 0 ? MINUS_SIGN : '';
  return `${sign}${formatTrimmed(scaled, 2, language)}${space}${chosen.prefix}${unit}`;
}
