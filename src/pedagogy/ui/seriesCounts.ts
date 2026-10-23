import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/core/translate.ts';

/** The series lengths offered when a page names none. */
export const SERIES_COUNTS: readonly number[] = [5, 10, 15, 20];

/**
 * The series lengths a pool can fill, and the whole pool last, so a pool
 * smaller than the longest length is offered whole rather than overpromised.
 * @param poolSize - How many questions the pool holds.
 * @param counts - The lengths offered, or the family's when none.
 * @param t - The chrome's formatter.
 * @returns The options of the picker.
 */
export function seriesCountOptions(
  poolSize: number,
  counts: readonly number[] | undefined,
  t: Translate<ChromeKey>,
): Array<{ value: number; label: string }> {
  const options: Array<{ value: number; label: string }> = [];
  for (const count of counts ?? SERIES_COUNTS) {
    if (count < poolSize) {
      options.push({
        value: count,
        label: t('pedagogy.questionCount', { count }),
      });
    }
  }
  options.push({
    value: poolSize,
    label: t('pedagogy.allQuestions', { count: poolSize }),
  });
  return options;
}
