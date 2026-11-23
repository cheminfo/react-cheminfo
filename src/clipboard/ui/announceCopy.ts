import { errorMessage } from '../../error/core/toError.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { CopyOutcome } from '../core/copyOutcome.ts';
import { showClipboardNotice } from '../core/showClipboardNotice.ts';
import type { ClipboardContent } from '../core/writeToClipboard.ts';

/** Past this length, or over several lines, a value is not repeated in the notice. */
const PREVIEW_MAX = 60;

/**
 * Say at the bottom of the window how a copy went, as every copy of the family
 * does: green and gone in a moment when it worked, orange when it worked only
 * in part or this browser cannot make it — naming the browsers that can — and
 * red when nothing was copied. Orange and red stay until they are closed.
 * @param outcome - How the copy went.
 * @param t - The chrome's formatter.
 * @param copied - What a copy that worked says.
 * @default copied 'Copied to the clipboard.'
 */
export function announceCopy(
  outcome: CopyOutcome,
  t: Translate<ChromeKey>,
  copied?: string,
): void {
  const closeLabel = t('clipboard.notice.close');
  if (outcome === 'copied') {
    showClipboardNotice(copied ?? t('clipboard.notice.copied'));
  } else if (outcome === 'copiedAsText') {
    showClipboardNotice(t('clipboard.notice.svgAsText'), {
      tone: 'warning',
      closeLabel,
    });
  } else if (outcome === 'unsupported') {
    showClipboardNotice(t('download.copyUnsupported'), {
      tone: 'warning',
      closeLabel,
    });
  } else {
    showClipboardNotice(t('clipboard.notice.refused'), {
      tone: 'error',
      closeLabel,
    });
  }
}

/**
 * Say that a copy failed before it reached the clipboard — a figure that could
 * not be painted — in red, until it is closed.
 * @param error - What was thrown.
 * @param t - The chrome's formatter.
 */
export function announceCopyFailure(
  error: unknown,
  t: Translate<ChromeKey>,
): void {
  showClipboardNotice(errorMessage(error), {
    tone: 'error',
    closeLabel: t('clipboard.notice.close'),
  });
}

/**
 * What a copy of text says once it worked: the value itself when it is short
 * enough to read in one line, so the reader sees exactly what they will paste.
 * @param content - What was copied.
 * @param t - The chrome's formatter.
 * @returns The line.
 */
export function copiedText(
  content: ClipboardContent,
  t: Translate<ChromeKey>,
): string {
  const value = (typeof content === 'string' ? content : content.text).trim();
  if (value === '' || value.length > PREVIEW_MAX || value.includes('\n')) {
    return t('clipboard.notice.copied');
  }
  return t('clipboard.notice.copiedValue', { value });
}
