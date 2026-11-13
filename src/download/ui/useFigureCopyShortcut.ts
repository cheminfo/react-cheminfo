import { useEffect, useRef } from 'react';

import { showClipboardNotice } from '../../clipboard/core/showClipboardNotice.ts';
import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { PageFigureWriter } from '../core/copyPageFigure.ts';
import { copyPageFigure } from '../core/copyPageFigure.ts';

/**
 * Copy the page's figure with Ctrl+C, or ⌘C on a Mac, as on every site of the
 * family: the SVG saying where it came from and what it was drawn from, and a
 * PNG of it, so draw and write paste a figure a double click opens here
 * again. A notice at the bottom of the window says it was copied.
 *
 * Text selected anywhere — in the page, a field or an editor — is copied as
 * text, as on any page. Otherwise the copy is the figure's, even in an editor
 * that would copy its current line: the listener runs before the page's own.
 * A site with a clipboard of its own, copying what is selected on a canvas,
 * passes `null` and keeps it.
 * @param write - Draws the figure; nothing is copied while it is `null`, and
 * the browser keeps the key.
 */
export function useFigureCopyShortcut(write: PageFigureWriter | null): void {
  const t = useChromeT();
  const latest = useRef({ write, t });
  useEffect(() => {
    latest.current = { write, t };
  });
  useEffect(() => {
    function onCopy(event: ClipboardEvent): void {
      const { write: draw, t: translate } = latest.current;
      if (draw === null || event.defaultPrevented || hasTextSelection()) {
        return;
      }
      event.preventDefault();
      copyPageFigure(draw).then(
        (notice) => {
          if (notice === 'copied') {
            showClipboardNotice(translate('clipboard.figureCopied'));
          } else if (notice !== undefined) {
            showClipboardNotice(translate('download.copyUnsupported'), true);
          }
        },
        (error: unknown) => {
          showClipboardNotice(errorMessage(error), true);
        },
      );
    }
    document.addEventListener('copy', onCopy, true);
    return () => {
      document.removeEventListener('copy', onCopy, true);
    };
  }, []);
}

/**
 * Whether the reader selected text to copy. A field whose selection cannot be
 * read — a number box — is taken to hold one, so the browser copies it.
 * @returns Whether text is selected.
 */
function hasTextSelection(): boolean {
  const field = document.activeElement;
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
  ) {
    return field.selectionStart === null
      ? true
      : field.selectionStart !== field.selectionEnd;
  }
  const selection = document.getSelection();
  return selection !== null && !selection.isCollapsed;
}
