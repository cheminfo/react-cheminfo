/**
 * Put one item on the clipboard through the async Clipboard API, without ever
 * throwing.
 *
 * The item is built and the write started before anything is awaited: Safari
 * only accepts a clipboard write that the click itself started, so a value
 * still being produced — a figure being rasterized — has to go in as a promise
 * the clipboard awaits, never be awaited first. A representation that fails
 * makes the write `false`; it never also surfaces as an unhandled rejection.
 * @param items - The item's representations, keyed by MIME type.
 * @returns Whether the clipboard took the item; `false` where the API or `ClipboardItem` is missing, or the write was refused.
 */
export async function writeClipboardItem(
  items: Record<string, Blob | Promise<Blob>>,
): Promise<boolean> {
  for (const item of Object.values(items)) {
    if (item instanceof Promise) item.catch(() => undefined);
  }
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

/**
 * Whether the clipboard says it takes a type. Asked before writing: a write it
 * refuses would spend the click, and whatever is written after it would be
 * refused too in Safari.
 * @param type - A MIME type, e.g. `image/svg+xml`.
 * @returns Whether `ClipboardItem.supports` names it; `false` where the
 * browser cannot say.
 */
export function clipboardSupports(type: string): boolean {
  if (typeof ClipboardItem === 'undefined') return false;
  const item = ClipboardItem as { supports?: (type: string) => boolean };
  return typeof item.supports === 'function' && item.supports(type);
}
