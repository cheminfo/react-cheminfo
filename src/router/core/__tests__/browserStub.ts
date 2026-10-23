import { vi } from 'vitest';

interface Move {
  kind: 'push' | 'replace';
  address: string;
}

// The smallest browser the binding reads: this package has no DOM
// implementation and must not grow one.
/**
 * Stand a browser in for the router: its location, its history and its
 * events, recording every move written through the history.
 * @param address - The address the page opens on.
 * @returns The moves written so far.
 */
export function installBrowser(address: string) {
  const url = new URL(address, 'https://smiles.cheminfo.org');
  const events = new EventTarget();
  const moves: Move[] = [];

  function move(kind: Move['kind'], next: string): void {
    moves.push({ kind, address: next });
    url.href = new URL(next, url).href;
  }

  vi.stubGlobal('location', {
    get pathname() {
      return url.pathname;
    },
    get search() {
      return url.search;
    },
    get hash() {
      return url.hash;
    },
  });
  vi.stubGlobal('history', {
    state: null,
    pushState: (_state: unknown, _unused: string, next: string) => {
      move('push', next);
    },
    replaceState: (_state: unknown, _unused: string, next: string) => {
      move('replace', next);
    },
  });
  vi.stubGlobal('addEventListener', events.addEventListener.bind(events));
  vi.stubGlobal('removeEventListener', events.removeEventListener.bind(events));
  vi.stubGlobal('dispatchEvent', events.dispatchEvent.bind(events));

  return { moves };
}
