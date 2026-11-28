import type { IconName } from '@blueprintjs/core';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/core/translate.ts';

import type { CopyToClipboard } from './useCopyToClipboard.ts';

/** How a copy went, as a copy button shows it. */
export type CopyState = Pick<CopyToClipboard, 'copied' | 'failed'>;

/**
 * The glyph a copy button shows: a cross when the clipboard refused, a tick
 * once the copy went, its own glyph before.
 * @param copy - How the copy went.
 * @param idle - The glyph before any copy.
 * @default idle 'clipboard'
 * @returns The Blueprint icon name.
 */
export function copyStateIcon(
  copy: CopyState,
  idle: IconName = 'clipboard',
): IconName {
  if (copy.failed) return 'cross';
  if (copy.copied) return 'tick';
  return idle;
}

/**
 * What a copy button says on hover: the chrome's `Copied` and `Copy failed`
 * once used, its own words before.
 * @param copy - How the copy went.
 * @param t - The chrome's formatter, `useChromeT()`.
 * @param idle - What the button offers before it has been used.
 * @returns The text.
 */
export function copyStateLabel(
  copy: CopyState,
  t: Translate<ChromeKey>,
  idle: string,
): string {
  if (copy.failed) return t('clipboard.failed');
  if (copy.copied) return t('clipboard.copied');
  return idle;
}
