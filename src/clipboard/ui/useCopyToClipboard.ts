import { useCallback, useEffect, useRef, useState } from 'react';

import type { ClipboardContent } from '../core/writeToClipboard.ts';
import { writeToClipboard } from '../core/writeToClipboard.ts';

import type { CopyFeedback, CopyFeedbackState } from './copyFeedback.ts';
import { IDLE_COPY_FEEDBACK, createCopyFeedback } from './copyFeedback.ts';

/** How long a copy is confirmed for, in milliseconds, unless asked otherwise. */
export const DEFAULT_COPY_RESET_AFTER = 1500;

/**
 * What a copy puts on the clipboard: text, text with its HTML, or a write of
 * the caller's own — `() => writeBlobToClipboard(png)` for an image. A write
 * function is called at once, still inside the click that started it.
 */
export type CopyContent = ClipboardContent | (() => Promise<boolean>);

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
   * @returns Whether the clipboard took it.
   */
  copy: (content: CopyContent, key?: string) => Promise<boolean>;
}

/**
 * Copy, and say how it went for a moment afterwards.
 *
 * The confirmation timer is cleared when the component goes away, and a copy
 * that lands after that confirms nothing, so a button unmounted mid-copy — a
 * row leaving a list, a menu closing — leaves no timer behind. A refused copy
 * is shown too, for as long, so the reader is told the clipboard is empty.
 * @param resetAfter - How long the outcome is shown, in milliseconds.
 * @returns The outcome flags, the key they belong to, and the copy action.
 */
export function useCopyToClipboard(
  resetAfter = DEFAULT_COPY_RESET_AFTER,
): CopyToClipboard {
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

  const copy = useCallback(async (content: CopyContent, key?: string) => {
    const written = await write(content);
    feedback.current?.announce(written, key);
    return written;
  }, []);

  return {
    copied: state.outcome === 'copied',
    failed: state.outcome === 'failed',
    key: state.key,
    copy,
  };
}

async function write(content: CopyContent): Promise<boolean> {
  if (typeof content !== 'function') return writeToClipboard(content);
  try {
    return await content();
  } catch {
    return false;
  }
}
