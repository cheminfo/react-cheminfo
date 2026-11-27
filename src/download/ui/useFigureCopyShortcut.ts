import { useEffect, useRef } from 'react';

import { announceCopyFailure } from '../../clipboard/ui/announceCopy.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { PageFigureWriter } from '../core/copyPageFigure.ts';
import { copyPageFigure } from '../core/copyPageFigure.ts';

import { announceFigureCopy } from './announceFigureCopy.ts';

/**
 * Copy the page's figure with Ctrl+C, or ⌘C on a Mac, as on every site of the
 * family: the SVG saying where it came from and what it was drawn from, and a
 * PNG of it, so draw and write paste a figure a double click opens here
 * again. A notice at the bottom of the window says it was copied.
 *
 * Text selected anywhere — in the page or a field — is copied as text, as on
 * any page. A code or text editor holding the focus keeps the key whatever is
 * selected, so it copies its selection, or its current line. Otherwise the
 * copy is the figure's. A site with a clipboard of its own, copying what is
 * selected on a canvas, passes `null` and keeps it.
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
      if (draw === null || event.defaultPrevented || copiesText()) {
        return;
      }
      event.preventDefault();
      copyPageFigure(draw).then(
        (notice) => {
          announceFigureCopy(notice, translate);
        },
        (error: unknown) => {
          announceCopyFailure(error, translate);
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
 * Whether the copy belongs to the text the reader is working on: an editor
 * holding the focus, or text selected. A field whose selection cannot be read
 * — a number box — is taken to hold one, so the browser copies it.
 * @returns Whether the browser, or the editor, should copy.
 */
function copiesText(): boolean {
  const focused = focusedElement();
  if (focused !== null && isTextEditor(focused)) return true;
  if (
    focused instanceof HTMLInputElement ||
    focused instanceof HTMLTextAreaElement
  ) {
    return focused.selectionStart === null
      ? true
      : focused.selectionStart !== focused.selectionEnd;
  }
  const selection = document.getSelection();
  return selection !== null && !selection.isCollapsed;
}

/**
 * The element holding the focus, looked for inside shadow roots too.
 * @returns The focused element, or `null` when none is.
 */
function focusedElement(): Element | null {
  let focused = document.activeElement;
  while (focused?.shadowRoot?.activeElement) {
    focused = focused.shadowRoot.activeElement;
  }
  return focused;
}

/**
 * Whether the element is an editor that copies its own text: editable content,
 * an EditContext (Monaco in Chromium), or a multi-line text box, which is how
 * Monaco and CodeMirror announce the element they type into.
 * @param element - The focused element.
 * @returns Whether Ctrl+C is the editor's.
 */
function isTextEditor(element: Element): boolean {
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  if ('editContext' in element && element.editContext) return true;
  return (
    element.getAttribute('role') === 'textbox' &&
    element.getAttribute('aria-multiline') === 'true'
  );
}
