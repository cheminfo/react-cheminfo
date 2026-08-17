/**
 * Put a piece of text on the clipboard, without ever throwing at the caller.
 *
 * The async Clipboard API is tried first and a hidden textarea is the fallback,
 * which is what a page served over plain HTTP, an older Safari, or a browser
 * that refused the permission is left with. A refusal is an outcome the caller
 * shows rather than an error it has to catch, so both paths resolve.
 * @param text - What to put on the clipboard.
 * @returns Whether the clipboard now holds the text.
 */
export async function writeToClipboard(text: string): Promise<boolean> {
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
