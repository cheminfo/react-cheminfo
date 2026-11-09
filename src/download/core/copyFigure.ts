import { writeClipboardItem } from '../../clipboard/core/clipboardItem.ts';

import { figureClipboardParts } from './figureClipboard.ts';

/**
 * What the last copy or send came to, when it is worth a line of its own:
 * `sendReady` is a file written too late for the press that asked for it,
 * which the next press hands to the share sheet at once.
 */
export type FigureNotice =
  'copied' | 'copyUnsupported' | 'sent' | 'sendReady' | 'sendUnsupported';

/**
 * Put a figure on the clipboard: the PNG for whatever takes a picture, and the
 * figure itself, saying where it came from, so draw and write paste it as one
 * that opens again on the site that drew it — see `figureClipboardParts`.
 *
 * Call it from the click itself, with both still being painted: Safari only
 * allows a clipboard write the click started.
 * @param png - The picture being painted.
 * @param figure - The figure as the site saves it, being written: the SVG
 * `withPageFigureSource` returns.
 * @returns `copied`, or `copyUnsupported` where the clipboard takes no picture.
 * @throws {Error} The painting's own error, when the picture or the figure
 *   could not be painted — a failure to report, not a browser that cannot copy.
 */
export async function copyFigure(
  png: Promise<Blob>,
  figure: Promise<string>,
): Promise<FigureNotice> {
  if (await writeClipboardItem(figureClipboardParts(png, figure))) {
    return 'copied';
  }
  await Promise.all([png, figure]);
  return 'copyUnsupported';
}
