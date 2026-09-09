/** How an axis title is written. */
export interface ChartAxisTitleOptions {
  /**
   * The share of the differences the axis accounts for, between 0 and 1 — a
   * fraction, never a percentage. Left out for a method that publishes no such
   * number, and then nothing is written after the name.
   * @default undefined
   */
  share?: number;
  /**
   * Decimals in the percentage.
   *
   * One, because the share is a reading aid rather than a measurement: it is
   * there so a reader can see that the seventh component carries 0.3 % and is
   * not worth plotting. A second decimal claims a precision the decomposition
   * does not have once the data has been resampled and scaled, and costs two
   * more characters in a picker whose lines are already long.
   * @default 1
   */
  digits?: number;
}

/**
 * An axis title: `PC1 — 74.2 %`, or a bare `UMAP1` when the method publishes
 * no share.
 *
 * The em dash is the package's own pattern for a name followed by a gloss —
 * `RGB — mix the channels`, `MAX — Largest value` — so a component reads the
 * same way here as everything else the reader has already met. Kept out of the
 * frame so the frame draws whatever string it is handed, and so every method
 * builds its titles the same way.
 * @param name - What the axis is called, e.g. `PC1`.
 * @param options - See {@link ChartAxisTitleOptions}.
 * @returns The title.
 */
export function chartAxisTitle(
  name: string,
  options: ChartAxisTitleOptions = {},
): string {
  const { share, digits = DEFAULT_DIGITS } = options;
  if (share === undefined || !Number.isFinite(share)) return name;
  return `${name} — ${chartShare(share, digits)} %`;
}

/**
 * A share written as a percentage, with no unit after it: `74.2`.
 *
 * Every figure that quotes a share goes through here, so an axis title and the
 * sentence under the same chart cannot disagree about how precise the number
 * is. A reader who meets `PC1 — 73.0 %` beside "accounts for 72.96%" has to
 * work out whether those are two quantities or one, and they are one.
 * @param share - The share, between 0 and 1 — a fraction, never a percentage.
 * @param digits - Decimals in the result, defaulting to the one decimal every
 * figure of the family writes.
 * @returns The percentage, written out.
 */
export function chartShare(share: number, digits = DEFAULT_DIGITS): string {
  if (!Number.isFinite(share)) return '';
  return (share * 100).toFixed(readableDigits(digits));
}

const DEFAULT_DIGITS = 1;
const MOST_DIGITS = 20;

function readableDigits(digits: number): number {
  if (!Number.isFinite(digits)) return DEFAULT_DIGITS;
  return Math.min(MOST_DIGITS, Math.max(0, Math.floor(digits)));
}
