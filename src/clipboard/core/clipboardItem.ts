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
 * The types every browser with a `ClipboardItem` writes — Chrome, Edge,
 * Firefox from 127 and Safari from 13.1 alike — so a browser too old to answer
 * `ClipboardItem.supports` still takes them.
 */
const BASELINE_TYPES = new Set(['text/plain', 'text/html', 'image/png']);

/**
 * Whether the clipboard takes a type. Asked before writing: a write it refuses
 * would spend the click, and whatever is written after it would be refused too
 * in Safari.
 * @param type - A MIME type, e.g. `image/svg+xml`.
 * @returns Whether `ClipboardItem.supports` names it, or, where the browser
 * cannot say, whether every browser with a `ClipboardItem` takes it; `false`
 * where there is no `ClipboardItem`.
 */
export function clipboardSupports(type: string): boolean {
  if (typeof ClipboardItem === 'undefined') return false;
  const item = ClipboardItem as { supports?: (type: string) => boolean };
  return typeof item.supports === 'function'
    ? item.supports(type)
    : BASELINE_TYPES.has(type);
}

/**
 * Why a picture did not reach the clipboard: this browser takes none, or it
 * takes them and refused this one — a denied permission, a frame not allowed
 * to write, or a click that no longer counts as one.
 * @returns `unsupported` or `refused`.
 */
export function pictureRefusal(): 'unsupported' | 'refused' {
  return typeof globalThis.navigator?.clipboard?.write === 'function' &&
    clipboardSupports('image/png')
    ? 'refused'
    : 'unsupported';
}
