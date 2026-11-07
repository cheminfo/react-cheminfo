import { writeBlobToClipboard } from '../../clipboard/core/writeBlobToClipboard.ts';

/**
 * What the last copy or send came to, when it is worth a line of its own:
 * `sendReady` is a file written too late for the press that asked for it,
 * which the next press hands to the share sheet at once.
 */
export type FigureNotice =
  'copied' | 'copyUnsupported' | 'sent' | 'sendReady' | 'sendUnsupported';

/**
 * Put a figure on the clipboard as a PNG.
 *
 * Call it from the click itself, with the picture still being painted: Safari
 * only allows a clipboard write the click started.
 * @param png - The picture being painted.
 * @returns `copied`, or `copyUnsupported` where the clipboard takes no picture.
 * @throws {Error} The painting's own error, when the picture could not be
 *   painted — a failure to report, not a browser that cannot copy.
 */
export async function copyFigure(png: Promise<Blob>): Promise<FigureNotice> {
  if (await writeBlobToClipboard(png)) return 'copied';
  await png;
  return 'copyUnsupported';
}
