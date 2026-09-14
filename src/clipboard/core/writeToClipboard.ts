import { writeClipboardItem } from './clipboardItem.ts';

/** Text for the clipboard, with a rich rendering of it beside. */
export interface ClipboardText {
  /** The plain text, which every place it is pasted into can read. */
  text: string;
  /**
   * The same content as HTML, which a word processor pastes with its
   * emphasis and links; a plain text editor still receives `text`.
   * @default undefined — only the text is written
   */
  html?: string;
}

/** What {@link writeToClipboard} puts on the clipboard: text, or text with its HTML. */
export type ClipboardContent = string | ClipboardText;

/**
 * Put a piece of text on the clipboard, without ever throwing at the caller.
 *
 * With `html`, both renderings go on as one item, so a paste into Word or
 * Google Docs keeps the formatting. Where that is refused, or for plain text,
 * the async Clipboard API is tried and a hidden textarea is the fallback, which
 * is what a page served over plain HTTP, an older Safari, or a browser that
 * refused the permission is left with. A refusal is an outcome the caller
 * shows rather than an error it has to catch, so every path resolves.
 * @param content - The text, or the text and its HTML.
 * @returns Whether the clipboard now holds the content — at least as text.
 */
export async function writeToClipboard(
  content: ClipboardContent,
): Promise<boolean> {
  const text = typeof content === 'string' ? content : content.text;
  const html = typeof content === 'string' ? undefined : content.html;

  if (html !== undefined && typeof Blob !== 'undefined') {
    const written = await writeClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    });
    if (written) return true;
  }

  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // A denied permission, or a call the browser no longer considers to come
      // from a user gesture. The textarea below still works in both cases.
    }
  }
  return writeWithTextArea(text);
}

function writeWithTextArea(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  // Off the screen rather than hidden: a `display: none` element selects
  // nothing, and a visible one scrolls the page as it is focused.
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.opacity = '0';
  document.body.append(textArea);
  textArea.select();

  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated command is what the fallback is
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textArea.remove();
  }
}
