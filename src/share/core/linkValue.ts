/**
 * A value written into a link: its JSON, deflated, in the URL-safe base64
 * alphabet, so the link opens what was on screen with no file beside it and
 * no server behind it. A circuit of twenty parts takes about a thousand
 * characters.
 */

import { fromBase64Url, pipeBytes, toBase64Url } from './linkBytes.ts';

/**
 * The longest token a link is given: with the rest of the address it stays
 * under the 8 KB request line nginx and Apache accept by default. A page of
 * text fits; a pasted picture rarely does.
 */
export const MAX_LINK_TOKEN = 7000;

// Bound what a link made by hand can make the page read and inflate.
const MAX_READ_TOKEN = 32 * 1024;
const MAX_UNPACKED_BYTES = 4 * 1024 * 1024;

/**
 * Write a value as the token a link carries.
 * @param value - The value, as JSON writes it.
 * @returns The token, in the URL-safe base64 alphabet without padding.
 */
export async function packLinkValue(value: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(value));
  const packed = await pipeBytes(json, new CompressionStream('deflate-raw'));
  return toBase64Url(packed);
}

/**
 * Read the value a link carries. The link may come from anywhere, so what it
 * holds is trusted for nothing: the caller checks it as it would a file.
 * @param token - The token, as {@link packLinkValue} writes it.
 * @returns The value, or `undefined` when the token holds none.
 */
export async function unpackLinkValue(token: string): Promise<unknown> {
  if (token.length > MAX_READ_TOKEN) return undefined;
  const bytes = fromBase64Url(token);
  if (!bytes) return undefined;
  try {
    const json = await pipeBytes(
      bytes,
      new DecompressionStream('deflate-raw'),
      MAX_UNPACKED_BYTES,
    );
    return JSON.parse(new TextDecoder().decode(json));
  } catch {
    return undefined;
  }
}

/**
 * Write a value as the token a link carries, unless the token would be too
 * long for one.
 * @param value - The value, as JSON writes it.
 * @returns The token, or `undefined` when it is longer than
 * {@link MAX_LINK_TOKEN}.
 */
export async function packLinkValueIfFits(
  value: unknown,
): Promise<string | undefined> {
  const token = await packLinkValue(value);
  return token.length > MAX_LINK_TOKEN ? undefined : token;
}
