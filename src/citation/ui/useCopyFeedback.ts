import { useEffect, useRef, useState } from 'react';

import { copyCitations } from '../core/clipboard.ts';
import type { CitationFormatId } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import type { CitationStyleId } from '../core/segments.ts';

import type { CopyState } from './entries.tsx';

// How long the tick replaces the clipboard glyph of an entry after a copy.
const FEEDBACK_MS = 1500;

/** Copying, with the feedback the entry that was clicked then shows. */
export interface CopyFeedback {
  /** The feedback showing on the entry known as `key`, if any. */
  stateOf: (key: string) => CopyState | null;
  /**
   * Copy the references, and announce the outcome on the entry known as `key`.
   */
  copy: (
    key: string,
    references: readonly Reference[],
    format: CitationFormatId,
    style?: CitationStyleId,
  ) => void;
}

/**
 * Hold which entry of a citation menu was clicked last and how it went, so the
 * tick — or the cross a denied clipboard leaves — shows on that entry alone.
 * @returns The copy action, and the feedback of the entry that used it.
 */
export function useCopyFeedback(): CopyFeedback {
  const [copied, setCopied] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current !== null) window.clearTimeout(timeout.current);
    };
  }, []);

  function announce(key: string, failed: boolean): void {
    setCopied(key);
    setHasFailed(failed);
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      setCopied(null);
      setHasFailed(false);
    }, FEEDBACK_MS);
  }

  return {
    stateOf: (key) => (copied === key ? feedback(hasFailed) : null),
    copy: (key, references, format, style) => {
      copyCitations(references, format, style).then(
        () => {
          announce(key, false);
        },
        () => {
          // A denied clipboard permission is the usual cause, and the menu is
          // the only place the user can be told about it.
          announce(key, true);
        },
      );
    },
  };
}

function feedback(failed: boolean): CopyState {
  if (failed) {
    return { icon: 'cross', intent: 'danger', label: 'copy failed' };
  }
  return { icon: 'tick', intent: 'success', label: 'copied' };
}
