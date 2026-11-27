/**
 * Pictures as `data:` URLs, the way a document holds them: a file read into
 * one, an SVG written into one, an SVG or the bytes read back out of one — without a
 * `FileReader` or a `fetch`, so it runs in a worker, under a content security
 * policy forbidding `data:` fetches, and in Node.
 */

import { decode, encode } from 'uint8-base64';

/** The type of an SVG picture. */
const SVG_TYPE = 'image/svg+xml';

/**
 * A blob as a base64 `data:` URL, as a `FileReader` writes it.
 * @param blob - The blob, its `type` naming what it holds.
 * @returns The URL.
 */
export async function blobDataUrl(blob: Blob): Promise<string> {
  const type = blob.type || 'application/octet-stream';
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return `data:${type};base64,${base64(bytes)}`;
}

/**
 * An SVG as a base64 `data:` URL: what a document stores for a picture.
 * @param svg - The SVG document.
 * @returns The URL.
 */
export function svgDataUrl(svg: string): string {
  return `data:${SVG_TYPE};base64,${base64(new TextEncoder().encode(svg))}`;
}

/**
 * The SVG document a `data:` URL holds, whether written in base64 or
 * percent-encoded.
 * @param src - The URL.
 * @returns The SVG's text, or `undefined` for any other picture, or for a URL
 *   that cannot be decoded.
 */
export function svgOfDataUrl(src: string): string | undefined {
  const match = /^data:image\/svg\+xml(?<parameters>[^,]*),(?<data>.*)$/is.exec(
    src,
  );
  if (!match?.groups) return undefined;
  const { parameters = '', data = '' } = match.groups;
  try {
    if (!parameters.toLowerCase().endsWith(';base64')) {
      return decodeURIComponent(data);
    }
    const text = new TextEncoder().encode(data.replaceAll(/\s/g, ''));
    return new TextDecoder().decode(decode(text));
  } catch {
    return undefined;
  }
}

/**
 * The bytes a base64 `data:` URL holds, decoded without `fetch`, which a
 * page's content security policy may forbid for `data:` addresses.
 * @param src - A base64 data URL, e.g. `data:image/png;base64,iVBOR…`.
 * @returns The decoded bytes.
 * @throws {Error} When the URL is not base64-encoded.
 */
export function dataUrlBytes(src: string): Uint8Array {
  const comma = src.indexOf(',');
  if (comma === -1 || !src.slice(0, comma).endsWith(';base64')) {
    throw new Error('Expected a base64 data URI.');
  }
  return decode(new TextEncoder().encode(src.slice(comma + 1)));
}

function base64(bytes: Uint8Array): string {
  return new TextDecoder().decode(encode(bytes));
}
