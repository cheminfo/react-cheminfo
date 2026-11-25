/**
 * A file downloaded as text, its failures typed as {@link fetchBytes} types
 * them: a page reading a file a link names — a workflow, a recipe, a list —
 * words the server not reached or refusing, and the body breaking off, its own
 * way, and passes an abort on.
 */

import type { ApiError } from './apiError.ts';
import type { FetchBytesOptions, TransferError } from './fetchBytes.ts';
import { fetchBytes } from './fetchBytes.ts';

/**
 * Download a file as UTF-8 text.
 * @param url - The address, absolute or relative to the page.
 * @param options - See {@link FetchBytesOptions}.
 * @returns Its text; a byte that is no UTF-8 reads as U+FFFD.
 * @throws {ApiError} Status 0 when the server cannot be reached, its status
 *   when it refuses.
 * @throws {TransferError} When the body breaks off.
 */
export async function fetchText(
  url: string,
  options: FetchBytesOptions = {},
): Promise<string> {
  return new TextDecoder().decode(await fetchBytes(url, options));
}
