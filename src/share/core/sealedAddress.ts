import type { PageLocation } from '../../router/core/pageAddress.ts';
import { holdPageAddress } from '../../router/core/pageAddress.ts';

import type { SealProblem } from './seal.ts';
import { sealedToken, unsealQuery } from './seal.ts';

/** How the page was opened. */
export type SealedAddress =
  | { status: 'plain' }
  | { status: 'sealed' }
  | { status: 'refused'; problem: SealProblem };

let opensSealedAddresses = false;

/**
 * Open the page's address before anything reads it. A plain address is left
 * as it is. A sealed one is unsealed and held in memory, so the page reads
 * what the token carries through `pageLocation` while the address bar keeps
 * showing the link that was handed out, whatever the page does next.
 *
 * Call it once at startup, and import every module that reads the address
 * only once it has resolved. Calling it is also what lets the share dialog
 * offer to protect a link: a site that never opens a sealed address must not
 * hand one out.
 * @param location - The address the page was opened at.
 * @returns How the page was opened; on `refused` nothing is held.
 */
export async function openSealedAddress(
  location: PageLocation | undefined = globalThis.location,
): Promise<SealedAddress> {
  opensSealedAddresses = true;
  if (location === undefined) return { status: 'plain' };
  const token = sealedToken(location.search);
  if (token === null) return { status: 'plain' };
  const result = await unsealQuery(token);
  if (!result.ok) return { status: 'refused', problem: result.problem };
  const query = result.query === '' ? '' : `?${result.query}`;
  holdPageAddress(`${location.pathname}${query}${location.hash}`);
  return { status: 'sealed' };
}

/**
 * Whether this page opens sealed links, so may hand them out.
 * @returns True once {@link openSealedAddress} has been called.
 */
export function canOpenSealedAddresses(): boolean {
  return opensSealedAddresses;
}
