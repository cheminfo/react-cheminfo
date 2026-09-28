/**
 * Put a PNG on the clipboard.
 *
 * The image is handed over as a promise rather than as a blob on purpose:
 * Safari only allows a clipboard write that the click itself started, so the
 * item has to be built while the handler is still running and the
 * rasterization awaited by the clipboard rather than before it.
 * @param png - The image being rasterized.
 * @returns Whether it was copied. `false` outside a secure context, and in a
 *   browser whose clipboard takes text only.
 */
export async function writeImageToClipboard(
  png: Promise<Blob>,
): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  return true;
}
