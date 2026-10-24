/**
 * Where an answer of a site's tool server points: the static site people
 * share, which an answer's `link` names, and this server, whose copy of the
 * same pages a chat frames.
 *
 * The two are written however the deployment writes them — an origin, an
 * origin and a mount, with or without a trailing slash — and a page is named
 * from the site's own root, `/titration` and `titration` alike: every helper
 * joins the two with exactly one slash, so `https://www.cheminfo.org/isomers`
 * and `https://www.cheminfo.org/isomers/` both put `/generator` at
 * `https://www.cheminfo.org/isomers/generator`.
 */

import { trimTrailingSlash } from '../router/core/address.ts';
import { joinBasePath } from '../router/core/basePath.ts';

/** Where the pages of an answer are served, as a deployment writes them. */
export interface AnswerAddressesInput {
  /** The static site an answer links to, the address people share. */
  siteUrl: string | URL;
  /** This server, as a browser reaches it: the view frames its pages. */
  publicUrl: string | URL;
}

/** Where the pages of an answer are served, checked and written alike. */
export interface AnswerAddresses {
  /** The static site, ending in `/`: `https://equilibrium.cheminfo.org/`. */
  readonly siteUrl: string;
  /** This server, ending in `/`: `https://equilibrium.c6h6.org/`. */
  readonly publicUrl: string;
}

/**
 * Check the two addresses of a tool server's answers, and write them alike:
 * absolute, `http` or `https`, without a query or a fragment, ending in `/`.
 * @param input - The site and this server, as the deployment gives them.
 * @returns The two addresses.
 * @throws {Error} When either is not an http or https address.
 */
export function answerAddresses(input: AnswerAddressesInput): AnswerAddresses {
  return {
    siteUrl: baseAddress(input.siteUrl, 'siteUrl'),
    publicUrl: baseAddress(input.publicUrl, 'publicUrl'),
  };
}

/**
 * The origins a view may frame: this server's, which a chat frames, and the
 * shared site's, which a link opens. A server that is the site gives one.
 * @param addresses - The two addresses.
 * @returns Each origin once, this server's first.
 */
export function viewOrigins(addresses: AnswerAddressesInput): string[] {
  return [
    ...new Set([
      new URL(addresses.publicUrl).origin,
      new URL(addresses.siteUrl).origin,
    ]),
  ];
}

/**
 * A page under a base address, joined with exactly one slash.
 * @param base - An origin, or an origin and a mount, with or without its
 *   trailing slash.
 * @param page - A page from the site's own root, with or without its leading
 *   slash, and with its query: `/titration?ind=phenolphthalein`.
 * @returns The page's absolute address.
 */
export function joinAddress(base: string | URL, page: string): string {
  return `${trimTrailingSlash(String(base))}${joinBasePath('', page)}`;
}

/**
 * One address of a deployment, checked.
 * @param value - The address.
 * @param name - What it is, for the error.
 * @returns The address without its query or fragment, ending in `/`.
 */
function baseAddress(value: string | URL, name: string): string {
  const text = String(value).trim();
  if (!URL.canParse(text)) {
    throw new Error(`${name} is not an address: ${text}`);
  }
  const url = new URL(text);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} is not an http or https address: ${text}`);
  }
  url.search = '';
  url.hash = '';
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
}
