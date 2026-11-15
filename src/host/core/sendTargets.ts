/**
 * Which sites of the family can take what a page could send them: matched on
 * the kinds alone, from what the registry says each site receives, before
 * anything is built or any site is opened.
 */

import { knownSites } from '../../ecosystem/core/lookup.ts';
import type {
  EcosystemSite,
  SiteReceiver,
} from '../../ecosystem/core/types.ts';

import { kindAccepts } from './kindAccepts.ts';

/** Something a page could send, named before it is built. */
export interface SendOffer {
  /** The kind it would be sent as, e.g. `'data.spectra'`. */
  kind: string;
  /** What it is, as the menu names it, e.g. `'3 IR spectra'`. */
  label: string;
}

/** A site that can take one of the offers, and how. */
export interface SendTarget<Offer extends SendOffer = SendOffer> {
  /** The site. */
  site: EcosystemSite;
  /** The way it takes data that matched. */
  receiver: SiteReceiver;
  /** The offer it takes: the first of its kinds that any offer carries. */
  offer: Offer;
}

/**
 * The sites that can take one of the offers, in the order the family declares
 * them. A site whose receiver accepts several offers takes the one its own
 * order of kinds prefers.
 * @param offers - What the page could send, in its own order of preference.
 * @param from - The site sending, which is never offered to itself.
 * @returns One target per site receiver that accepts an offer.
 */
export function sendTargets<Offer extends SendOffer>(
  offers: readonly Offer[],
  from?: string,
): Array<SendTarget<Offer>> {
  const targets: Array<SendTarget<Offer>> = [];
  if (offers.length === 0) return targets;
  for (const site of knownSites()) {
    if (site.id === from) continue;
    for (const receiver of site.receives ?? []) {
      const offer = preferredOffer(receiver, offers);
      if (offer !== undefined) targets.push({ site, receiver, offer });
    }
  }
  return targets;
}

function preferredOffer<Offer extends SendOffer>(
  receiver: SiteReceiver,
  offers: readonly Offer[],
): Offer | undefined {
  for (const accepted of receiver.kinds) {
    for (const offer of offers) {
      if (kindAccepts(accepted, offer.kind)) return offer;
    }
  }
  return undefined;
}
