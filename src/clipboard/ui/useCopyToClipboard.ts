import { useCallback, useEffect, useRef, useState } from 'react';

import { writeToClipboard } from '../core/writeToClipboard.ts';

/** How long a copy is confirmed for, in milliseconds, unless asked otherwise. */
export const DEFAULT_COPY_RESET_AFTER = 1500;

/** A clipboard write and the confirmation it leaves behind for a moment. */
export interface CopyToClipboard {
  /** Whether the last copy worked and is still being confirmed. */
  copied: boolean;
  /**
   * Put text on the clipboard and confirm it.
   * @param text - What to copy.
   * @returns Whether the clipboard took it.
   */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy text and say so for a moment afterwards.
 *
 * The confirmation timer is cleared when the component goes away, and a copy
 * that lands after that confirms nothing, so a button unmounted mid-copy — a
 * row leaving a list, a menu closing — leaves no timer behind.
 * @param resetAfter - How long the confirmation lasts, in milliseconds.
 * @returns The confirmation flag and the copy action.
 */
export function useCopyToClipboard(
  resetAfter = DEFAULT_COPY_RESET_AFTER,
): CopyToClipboard {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      const written = await writeToClipboard(text);
      if (!written || !isMounted.current) return written;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
      return true;
    },
    [resetAfter],
  );

  return { copied, copy };
}
