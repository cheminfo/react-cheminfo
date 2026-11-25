import type { ListFormatters } from '../core/listFormatters.ts';
import { listFormatters } from '../core/listFormatters.ts';

import { useLanguage } from './useLanguage.ts';

/**
 * The list formatters of the page's language, redrawn when it changes.
 * @returns See {@link ListFormatters}.
 */
export function useLists(): ListFormatters {
  return listFormatters(useLanguage());
}
