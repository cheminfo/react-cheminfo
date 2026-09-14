import { writeClipboardItem } from './clipboardItem.ts';

const DEFAULT_TYPE = 'image/png';

/** How {@link writeBlobToClipboard} labels what it writes. */
export interface WriteBlobToClipboardOptions {
  /**
   * The MIME type the clipboard is told the data has. Browsers accept
   * `image/png` everywhere; other image types only in some of them.
   * @default the blob's own type, or 'image/png' when it has none or is still a promise
   */
  type?: string;
}

/**
 * Put an image — a figure, a rendered formula — on the clipboard, without ever
 * throwing at the caller.
 *
 * Hand over the promise of the image rather than awaiting it first, e.g.
 * `writeBlobToClipboard(renderPng(figure))` straight from the click handler:
 * Safari only accepts a clipboard write the click itself started, and awaiting
 * a rasterization first is enough to lose that.
 * @param blob - The image, or the promise of it.
 * @param options - See {@link WriteBlobToClipboardOptions}.
 * @returns Whether the clipboard took it; `false` outside a secure context, in a browser whose clipboard takes text only, or when the image could not be produced.
 */
export function writeBlobToClipboard(
  blob: Blob | Promise<Blob>,
  options: WriteBlobToClipboardOptions = {},
): Promise<boolean> {
  if (blob instanceof Promise) {
    // The clipboard reports a failed image as `false`; the promise itself must
    // not also surface as an unhandled rejection.
    blob.catch(() => undefined);
  }
  const type = options.type ?? ownType(blob) ?? DEFAULT_TYPE;
  return writeClipboardItem({ [type]: blob });
}

function ownType(blob: Blob | Promise<Blob>): string | undefined {
  if (blob instanceof Promise || blob.type === '') return undefined;
  return blob.type;
}
