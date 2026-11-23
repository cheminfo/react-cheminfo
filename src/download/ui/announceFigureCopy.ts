import {
  announceCopy,
  announceCopyFailure,
} from '../../clipboard/ui/announceCopy.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { FigureNotice } from '../core/copyFigure.ts';

/**
 * Say at the bottom of the window how a figure copy went: that it pastes into
 * draw or write as a figure that opens here again, that this browser copies no
 * picture, or that it refused this one. Any other outcome — a send — says
 * nothing here.
 * @param notice - What the copy came to.
 * @param t - The chrome's formatter.
 */
export function announceFigureCopy(
  notice: FigureNotice | null | undefined,
  t: Translate<ChromeKey>,
): void {
  if (notice === 'copied') {
    announceCopy('copied', t, t('clipboard.figureCopied'));
  } else if (notice === 'copyUnsupported') {
    announceCopy('unsupported', t);
  } else if (notice === 'copyRefused') {
    announceCopy('refused', t);
  }
}

/**
 * A figure copy that says how it went, at the bottom of the window, and still
 * resolves — or rejects — as it did, so a panel can show it too.
 * @param task - The copy, started from the click: `copyFigure(png, figure)`.
 * @param t - The chrome's formatter.
 * @returns The same outcome.
 */
export function announcedFigureCopy(
  task: Promise<FigureNotice>,
  t: Translate<ChromeKey>,
): Promise<FigureNotice> {
  return task.then(
    (notice) => {
      announceFigureCopy(notice, t);
      return notice;
    },
    (error: unknown) => {
      announceCopyFailure(error, t);
      throw error;
    },
  );
}
