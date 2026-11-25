/**
 * Text carried in a link — a workflow, an apparatus, a query sealed in an
 * address: deflate-raw compressed, written in base64url without padding. A
 * link is untrusted input, so what it carries is unpacked under caps on the
 * token and on what it inflates to, refused before it grows past them.
 */

import { fromBase64Url, pipeBytes, toBase64Url } from './linkBytes.ts';

/** How much a link may carry, and unpack to. */
export interface LinkTextLimits {
  /** The longest token read, characters. */
  maxTokenLength: number;
  /** The most it may inflate to, bytes. */
  maxBytes: number;
}

/**
 * Text as a link carries it: UTF-8, deflate-raw, base64url without padding.
 * @param text - The text.
 * @returns The token.
 */
export async function packLinkText(text: string): Promise<string> {
  const utf8 = new TextEncoder().encode(text);
  return toBase64Url(
    await pipeBytes(utf8, new CompressionStream('deflate-raw')),
  );
}

/**
 * The text a link's token carries. Never throws for what a link holds: a
 * token too long, not base64url, not deflate-raw, inflating past the cap or
 * not UTF-8 is answered with `null`.
 * @param token - What the link carries.
 * @param limits - See {@link LinkTextLimits}.
 * @returns The text, or `null` when the token carries none.
 */
export async function unpackLinkText(
  token: string,
  limits: LinkTextLimits,
): Promise<string | null> {
  if (token.length > limits.maxTokenLength) return null;
  const bytes = fromBase64Url(token);
  if (bytes === null) return null;
  try {
    const inflated = await pipeBytes(
      bytes,
      new DecompressionStream('deflate-raw'),
      limits.maxBytes,
    );
    return new TextDecoder('utf-8', { fatal: true }).decode(inflated);
  } catch {
    // Only the stream and the decoder throw here, each on what the token
    // holds: a token that does not unpack carries no text.
    return null;
  }
}
