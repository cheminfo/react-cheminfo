/**
 * The line that says a copy made from the keyboard happened. A key lights no
 * button, so the page says it once, at the bottom of the window, and lets it
 * go — one notice at a time, the last replacing the one before. It slides in,
 * and slides out before it is taken away.
 */

/** How long a notice stays, in milliseconds, before it slides out. */
export const CLIPBOARD_NOTICE_TIME = 2500;

/** How long a notice saying a copy failed stays, in milliseconds. */
export const CLIPBOARD_FAILURE_TIME = 5000;

/** How long a notice takes to slide out, in milliseconds, as `chrome.css` does. */
export const CLIPBOARD_NOTICE_LEAVE = 200;

/** The class the notice carries, styled by `chrome.css`. */
export const CLIPBOARD_NOTICE_CLASS = 'clipboard-notice';

interface Notice {
  element: HTMLElement;
  timer: ReturnType<typeof setTimeout>;
}

let shown: Notice | undefined;
let leaving: Notice | undefined;

/**
 * Say what a copy did, at the bottom of the window.
 * @param text - What was copied, or why nothing was.
 * @param failed - Whether the copy failed.
 * @default false
 */
export function showClipboardNotice(text: string, failed = false): void {
  if (typeof document === 'undefined') return;
  hideClipboardNotice();
  const element = document.createElement('div');
  element.className = failed
    ? `${CLIPBOARD_NOTICE_CLASS} ${CLIPBOARD_NOTICE_CLASS}--failed no-print`
    : `${CLIPBOARD_NOTICE_CLASS} no-print`;
  element.setAttribute('role', failed ? 'alert' : 'status');
  element.textContent = text;
  document.body.append(element);
  const timer = setTimeout(
    leave,
    failed ? CLIPBOARD_FAILURE_TIME : CLIPBOARD_NOTICE_TIME,
  );
  shown = { element, timer };
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
}

function leave(): void {
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
