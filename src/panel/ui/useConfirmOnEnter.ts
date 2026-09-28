/**
 * Enter as the answer to whatever a dialog is asking.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Run a dialog's primary action when Enter is pressed while it is open.
 *
 * On the document rather than on the dialog's own subtree, because an open
 * overlay holds the focus on a container above the content, so a press never
 * reaches a handler put on the body. Esc needs nothing of the sort: Blueprint
 * closes an overlay on it already.
 *
 * A press that something else has a use for is left alone — a button under the
 * focus is activated by Enter on its own, and a newline typed into a text area
 * is a newline — so the shortcut never fires twice or eats what was typed.
 * @param isOpen - Whether the dialog is showing.
 * @param onConfirm - Its primary action, the one the footer button runs.
 */
export function useConfirmOnEnter(
  isOpen: boolean,
  onConfirm: () => void,
): void {
  // Held in a ref so a caller passing a fresh closure on every render does not
  // have the listener taken down and put back up.
  const current = useRef(onConfirm);
  useLayoutEffect(() => {
    current.current = onConfirm;
  });

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.defaultPrevented) return;
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (activatesOnEnter(event.target) || takesNewlines(event.target)) return;
      event.preventDefault();
      current.current();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
}

/**
 * Whether Enter is already the way to work what the press was delivered to.
 * @param target - What the event was delivered to.
 * @returns Whether it runs itself on Enter.
 */
function activatesOnEnter(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest('a[href], button, summary, [role="button"]') !== null;
}

/**
 * Whether the press is a newline being typed rather than an answer.
 * @param target - What the event was delivered to.
 * @returns Whether it should be left alone.
 */
function takesNewlines(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'TEXTAREA';
}
