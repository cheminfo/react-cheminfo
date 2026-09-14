/**
 * Put one item on the clipboard through the async Clipboard API, without ever
 * throwing.
 *
 * The item is built and the write started before anything is awaited: Safari
 * only accepts a clipboard write that the click itself started, so a value
 * still being produced — a figure being rasterized — has to go in as a promise
 * the clipboard awaits, never be awaited first.
 * @param items - The item's representations, keyed by MIME type.
 * @returns Whether the clipboard took the item; `false` where the API or `ClipboardItem` is missing, or the write was refused.
 */
export async function writeClipboardItem(
  items: Record<string, Blob | Promise<Blob>>,
): Promise<boolean> {
  const clipboard = globalThis.navigator?.clipboard;
  if (
    typeof clipboard?.write !== 'function' ||
    typeof ClipboardItem === 'undefined'
  ) {
    return false;
  }
  try {
    await clipboard.write([new ClipboardItem(items)]);
    return true;
  } catch {
    return false;
  }
}
