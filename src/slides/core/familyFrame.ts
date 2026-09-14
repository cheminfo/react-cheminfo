import { findSiteByHost } from '../../ecosystem/core/index.ts';

/**
 * Whether a deck may frame an address inside its prose.
 *
 * A deck is played on sites other than the one that wrote it, so a frame in
 * its HTML is kept only when it shows the family itself: a path of the site
 * playing the deck, or an https page of a cheminfo host.
 * @param src - The `src` the deck wrote on its `<iframe>`.
 * @returns True when the frame may be drawn.
 */
export function isFamilyFrameSource(src: string): boolean {
  if (src.startsWith('/')) {
    return !src.startsWith('//') && !src.startsWith('/\\');
  }
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  const { hostname } = url;
  return (
    hostname === 'cheminfo.org' ||
    hostname.endsWith('.cheminfo.org') ||
    findSiteByHost(hostname) !== undefined
  );
}

/**
 * What a framed tool is called, since a frame without a title is unreadable to
 * a screen reader.
 * @param src - The address being framed.
 * @returns The host followed by "embedded", or a generic name when the address
 *   is not absolute.
 */
export function frameTitle(src: string): string {
  try {
    return `${new URL(src).hostname}, embedded`;
  } catch {
    return 'Embedded tool';
  }
}
