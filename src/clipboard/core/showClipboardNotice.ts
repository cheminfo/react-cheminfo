/**
 * The line that says what a copy did, the same on every site of the family. A
 * copy lights at most a button, often nothing at all, so the page says it
 * once, at the bottom of the window — one notice at a time, the last replacing
 * the one before. A copy that worked slides out by itself; one that only half
 * worked, or did not work, stays until it is clicked, closed or dismissed with
 * Escape, because it asks the reader to do something.
 */

/**
 * What a notice reports: a copy that worked, one that worked only in part or
 * that this browser cannot make, and one that failed.
 */
export type ClipboardNoticeTone = 'success' | 'warning' | 'error';

/** How {@link showClipboardNotice} says it. */
export interface ClipboardNoticeOptions {
  /**
   * Whether the copy worked. A warning or an error stays until it is closed.
   * @default 'success'
   */
  tone?: ClipboardNoticeTone;
  /**
   * What the close button of a notice that stays is called, for a screen
   * reader and the pointer.
   * @default 'Close'
   */
  closeLabel?: string;
}

/** How long a notice that worked stays, in milliseconds, before it slides out. */
export const CLIPBOARD_NOTICE_TIME = 2500;

/** How long a notice takes to slide out, in milliseconds, as `chrome.css` does. */
export const CLIPBOARD_NOTICE_LEAVE = 200;

/** The class the notice carries, styled by `chrome.css`. */
const CLIPBOARD_NOTICE_CLASS = 'clipboard-notice';

interface Notice {
  element: HTMLElement;
  timer: ReturnType<typeof setTimeout> | undefined;
}

let shown: Notice | undefined;
let leaving: Notice | undefined;

/**
 * Say what a copy did, at the bottom of the window.
 * @param text - What was copied, or why nothing was.
 * @param options - See {@link ClipboardNoticeOptions}.
 */
export function showClipboardNotice(
  text: string,
  options: ClipboardNoticeOptions = {},
): void {
  if (typeof document === 'undefined') return;
  const { tone = 'success', closeLabel = 'Close' } = options;
  hideClipboardNotice();
  const element = document.createElement('div');
  element.className =
    tone === 'success'
      ? `${CLIPBOARD_NOTICE_CLASS} no-print`
      : `${CLIPBOARD_NOTICE_CLASS} ${CLIPBOARD_NOTICE_CLASS}--${tone} no-print`;
  element.setAttribute('role', tone === 'success' ? 'status' : 'alert');
  element.textContent = text;
  document.body.append(element);
  if (tone === 'success') {
    shown = { element, timer: setTimeout(leave, CLIPBOARD_NOTICE_TIME) };
    return;
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.className = `${CLIPBOARD_NOTICE_CLASS}__close`;
  close.setAttribute('aria-label', closeLabel);
  close.title = closeLabel;
  element.append(close);
  element.addEventListener('click', leave);
  document.addEventListener('keydown', onKeyDown);
  shown = { element, timer: undefined };
}

/** Take the notice away now, without sliding it out, if one is showing. */
export function hideClipboardNotice(): void {
  for (const notice of [shown, leaving]) {
    if (notice === undefined) continue;
    clearTimeout(notice.timer);
    notice.element.remove();
  }
  shown = undefined;
  leaving = undefined;
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onKeyDown);
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') leave();
}

function leave(): void {
  document.removeEventListener('keydown', onKeyDown);
  if (shown === undefined) return;
  const { element } = shown;
  shown = undefined;
  element.classList.add(`${CLIPBOARD_NOTICE_CLASS}--leaving`);
  const timer = setTimeout(() => {
    element.remove();
    leaving = undefined;
  }, CLIPBOARD_NOTICE_LEAVE);
  leaving = { element, timer };
}
