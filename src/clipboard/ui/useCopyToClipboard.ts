import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { pictureRefusal } from '../core/clipboardItem.ts';
import type { CopyOutcome } from '../core/copyOutcome.ts';
import { isCopied } from '../core/copyOutcome.ts';
import type { ClipboardContent } from '../core/writeToClipboard.ts';
import { writeToClipboard } from '../core/writeToClipboard.ts';

import {
  announceCopy,
  announceCopyFailure,
  copiedText,
} from './announceCopy.ts';
import type { CopyFeedback, CopyFeedbackState } from './copyFeedback.ts';
import { IDLE_COPY_FEEDBACK, createCopyFeedback } from './copyFeedback.ts';

/** How long a copy is confirmed for, in milliseconds, unless asked otherwise. */
export const DEFAULT_COPY_RESET_AFTER = 1500;

/**
 * What a copy puts on the clipboard: text, text with its HTML, or a write of
 * the caller's own — `() => writeBlobToClipboard(png)` for an image, or
 * `() => copySvg(markup)`. A write function is called at once, still inside the
 * click that started it, and says whether the clipboard took the content, or
 * how it went. A `false` from it is read as a picture the clipboard did not
 * take.
 */
export type CopyContent =
  ClipboardContent | (() => Promise<boolean | CopyOutcome>);

/** A clipboard write and the confirmation it leaves behind for a moment. */
export interface CopyToClipboard {
  /** Whether the last copy worked and is still being confirmed. */
  copied: boolean;
  /** Whether the last copy was refused and that is still being shown. */
  failed: boolean;
  /**
   * The key the last copy was made under while its outcome is shown, so a
   * menu of several copy actions confirms on the one that was used.
   */
  key: string | undefined;
  /**
   * Put content on the clipboard and confirm how it went.
   * @param content - What to copy.
   * @param key - Which of several copy actions this is.
   * @returns Whether the clipboard took it, at least in part.
   */
  copy: (content: CopyContent, key?: string) => Promise<boolean>;
}

/**
 * Copy, and say how it went: at the bottom of the window, as every copy of the
 * family does (see `announceCopy`), and for a moment on the control that was
 * used, through the flags this returns.
 *
 * The confirmation timer is cleared when the component goes away, and a copy
 * that lands after that confirms nothing on the control, so a button unmounted
 * mid-copy — a row leaving a list, a menu closing — leaves no timer behind; the
 * notice at the bottom of the window still says it. A refused copy is shown
 * too, so the reader is told the clipboard is empty.
 * @param resetAfter - How long the outcome is shown on the control, in milliseconds.
 * @returns The outcome flags, the key they belong to, and the copy action.
 */
export function useCopyToClipboard(
  resetAfter = DEFAULT_COPY_RESET_AFTER,
): CopyToClipboard {
  const t = useChromeT();
  const [state, setState] = useState<CopyFeedbackState>(IDLE_COPY_FEEDBACK);
  const feedback = useRef<CopyFeedback | null>(null);

  useEffect(() => {
    const controller = createCopyFeedback(resetAfter, setState);
    feedback.current = controller;
    return () => {
      controller.dispose();
      feedback.current = null;
    };
  }, [resetAfter]);

  const copy = useCallback(
    async (content: CopyContent, key?: string) => {
      const written = isCopied(await write(content, t));
      feedback.current?.announce(written, key);
      return written;
    },
    [t],
  );

  return {
    copied: state.outcome === 'copied',
    failed: state.outcome === 'failed',
    key: state.key,
    copy,
  };
}

async function write(
  content: CopyContent,
  t: Translate<ChromeKey>,
): Promise<CopyOutcome> {
  if (typeof content !== 'function') {
    const outcome = (await writeToClipboard(content)) ? 'copied' : 'refused';
    announceCopy(outcome, t, copiedText(content, t));
    return outcome;
  }
  let outcome: CopyOutcome;
  try {
    const written = await content();
    outcome =
      written === true
        ? 'copied'
        : written === false
          ? pictureRefusal()
          : written;
  } catch (error) {
    announceCopyFailure(error, t);
    return 'refused';
  }
  announceCopy(outcome, t);
  return outcome;
}
