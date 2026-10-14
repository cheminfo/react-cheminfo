/**
 * Where a page reads its own address and writes it back. Normally that is the
 * browser's `location` and `history`; a page opened from a sealed link holds
 * its address in memory instead, so the app navigates as usual while the
 * address bar keeps showing the link that was handed out.
 */

/** The part of `window.location` a page reads its address from. */
export interface PageLocation {
  /** The path of the address. */
  readonly pathname: string;
  /** The query string, with its leading `?` or empty. */
  readonly search: string;
  /** The fragment, with its leading `#` or empty. */
  readonly hash: string;
}

/** The part of `window.history` a page writes its address through. */
export interface PageHistory {
  /** The state of the current entry. */
  readonly state: unknown;
  /**
   * Add an entry.
   * @param data - The state of the new entry.
   * @param unused - Ignored by browsers.
   * @param url - The new address, absolute or relative to the current one.
   */
  pushState(data: unknown, unused: string, url: string): void;
  /**
   * Rewrite the current entry without adding one.
   * @param data - The state to keep.
   * @param unused - Ignored by browsers.
   * @param url - The new address, absolute or relative to the current one.
   */
  replaceState(data: unknown, unused: string, url: string): void;
}

// Only parses addresses relative to the held one; never fetched or shown.
const HELD_ORIGIN = 'https://held.invalid';

let held: HeldAddress | undefined;

/**
 * The address the page reads: the held one when there is one, else the
 * browser's.
 * @returns It, or `undefined` where there is no browser.
 */
export function pageLocation(): PageLocation | undefined {
  return held ?? globalThis.location;
}

/**
 * The history the page writes its address through: the held address when
 * there is one, else the browser's.
 * @returns It, or `undefined` where there is no browser.
 */
export function pageHistory(): PageHistory | undefined {
  return held ?? globalThis.history;
}

/**
 * Hold the page's address in memory from now on. Every read through
 * {@link pageLocation} and every write through {@link pageHistory} uses it, and
 * the browser's address bar is never written again.
 * @param address - The address the page opens on: path, query and fragment.
 */
export function holdPageAddress(address: string): void {
  held = new HeldAddress(address);
}

/**
 * Whether the page's address is held in memory.
 * @returns True after {@link holdPageAddress}.
 */
export function isPageAddressHeld(): boolean {
  return held !== undefined;
}

/** Go back to reading and writing the browser's own address. */
export function releasePageAddress(): void {
  held = undefined;
}

class HeldAddress implements PageLocation, PageHistory {
  pathname = '/';
  search = '';
  hash = '';
  state: unknown = null;

  constructor(address: string) {
    this.go(null, address);
  }

  pushState(data: unknown, unused: string, url: string): void {
    this.go(data, url);
  }

  replaceState(data: unknown, unused: string, url: string): void {
    this.go(data, url);
  }

  private go(data: unknown, url: string): void {
    const base = `${HELD_ORIGIN}${this.pathname}${this.search}${this.hash}`;
    const next = new URL(url, base);
    this.pathname = next.pathname;
    this.search = next.search;
    this.hash = next.hash;
    this.state = data;
  }
}
