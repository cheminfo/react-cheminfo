/**
 * The pieces of an image export that need neither React nor molstar: wrapping
 * a rendered picture in an SVG file, and reading a data URI back as bytes.
 */

/** The pixel size of a rendered image. */
export interface ImageSize {
  width: number;
  height: number;
}

/**
 * An SVG document holding one raster image at its own size.
 *
 * A molecule rendered by WebGL has no vector form, so its SVG is the picture
 * itself, embedded: it opens in every editor and can be placed beside vector
 * artwork, but it does not stay sharp past the resolution it was rendered at.
 * @param dataUri - The image, as a `data:` URI.
 * @param size - Its pixel size.
 * @returns The SVG markup.
 */
export function rasterSvgMarkup(dataUri: string, size: ImageSize): string {
  const { width, height } = size;
  const href = escapeAttribute(dataUri);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="${href}" xlink:href="${href}"/></svg>`;
}

/**
 * Decode a base64 `data:` URI into its bytes, without `fetch`, which a page's
 * content security policy may forbid for `data:` addresses.
 * @param dataUri - A base64 data URI, e.g. `data:image/png;base64,iVBOR…`.
 * @returns The decoded bytes.
 * @throws {Error} When the URI is not base64-encoded.
 */
export function dataUriBytes(dataUri: string): Uint8Array<ArrayBuffer> {
  const comma = dataUri.indexOf(',');
  if (comma === -1 || !dataUri.slice(0, comma).endsWith(';base64')) {
    throw new Error('Expected a base64 data URI.');
  }
  const binary = atob(dataUri.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }
  return bytes;
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}
