import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';

import type { HelpContent } from './HelpBody.tsx';

/**
 * The name a glyph or a button carries for a screen reader: the help's own
 * title, or a plain "Help" when the help has none.
 * @param content - The help being named.
 * @param t - The chrome's formatter, so the plain name is in the language of
 * the page.
 * @returns The accessible name.
 */
export function helpName(
  content: HelpContent,
  t: Translate<ChromeKey>,
): string {
  return content.title ?? t('help.label');
}
