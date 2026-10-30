import { writeClipboardItem } from '../../clipboard/core/clipboardItem.ts';
import { writeToClipboard } from '../../clipboard/core/writeToClipboard.ts';

/** The type a picture is put on the clipboard as: no `charset`, which it refuses. */
const SVG_CLIPBOARD_TYPE = 'image/svg+xml';

/**
 * Put an SVG document on the clipboard, without ever throwing at the caller.
 *
 * Where the browser takes an SVG picture, the document goes on as one and as
 * its text, in one item: a slide or a vector editor pastes the drawing, a text
 * editor the markup. Elsewhere — Firefox and Safari take no SVG picture — the
 * text alone, which a vector editor still pastes as a drawing.
 * @param markup - The SVG document.
 * @returns Whether the clipboard now holds it, at least as text.
 */
export async function copySvg(markup: string): Promise<boolean> {
  if (takesSvgPicture()) {
    const written = await writeClipboardItem({
      [SVG_CLIPBOARD_TYPE]: new Blob([markup], { type: SVG_CLIPBOARD_TYPE }),
      'text/plain': new Blob([markup], { type: 'text/plain' }),
    });
    if (written) return true;
  }
  return writeToClipboard(markup);
}

/**
 * Whether the clipboard says it takes an SVG picture. Asked before writing:
 * a write it refuses would spend the click, and the text after it would be
 * refused too in Safari.
 * @returns Whether `ClipboardItem.supports` names the SVG type.
 */
function takesSvgPicture(): boolean {
  if (typeof ClipboardItem === 'undefined') return false;
  const item = ClipboardItem as { supports?: (type: string) => boolean };
  return (
    typeof item.supports === 'function' && item.supports(SVG_CLIPBOARD_TYPE)
  );
}
