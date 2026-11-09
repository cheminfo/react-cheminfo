import {
  clipboardSupports,
  writeClipboardItem,
} from '../../clipboard/core/clipboardItem.ts';
import { writeToClipboard } from '../../clipboard/core/writeToClipboard.ts';

/** The type a picture is put on the clipboard as: no `charset`, which it refuses. */
export const SVG_CLIPBOARD_TYPE = 'image/svg+xml';

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
  if (clipboardSupports(SVG_CLIPBOARD_TYPE)) {
    const written = await writeClipboardItem({
      [SVG_CLIPBOARD_TYPE]: new Blob([markup], { type: SVG_CLIPBOARD_TYPE }),
      'text/plain': new Blob([markup], { type: 'text/plain' }),
    });
    if (written) return true;
  }
  return writeToClipboard(markup);
}
