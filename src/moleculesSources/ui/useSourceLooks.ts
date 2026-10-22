import { useSyncExternalStore } from 'react';

import type { SourceLooks } from '../core/moleculesSources.ts';
import { MOLECULES_URL, fetchSourceLooks } from '../core/moleculesSources.ts';

/**
 * Every source's look, read from molecules.cheminfo.org once per page however
 * many badges ask for it.
 * @param url - Where molecules answers.
 * @returns The looks by lower-case name, or null until molecules has answered;
 * an empty map when it could not be read, so the badges stop waiting and stay
 * neutral.
 */
export function useSourceLooks(
  url: string = MOLECULES_URL,
): SourceLooks | null {
  const store = sourceLooksStore(url);
  return useSyncExternalStore(store.subscribe, store.read, notYet);
}

/** The one read of a molecules address, shared by every badge on the page. */
export interface SourceLooksStore {
  /** Follow the read, starting it on the first call. */
  subscribe: (listener: () => void) => () => void;
  /** What has been read so far. */
  read: () => SourceLooks | null;
}

/**
 * The store behind {@link useSourceLooks}: one per address, read once.
 * @param url - Where molecules answers.
 * @returns The store.
 */
export function sourceLooksStore(url: string): SourceLooksStore {
  let store = STORES.get(url);
  if (store === undefined) {
    store = createStore(url);
    STORES.set(url, store);
  }
  return store;
}

const STORES = new Map<string, SourceLooksStore>();

function createStore(url: string): SourceLooksStore {
  let looks: SourceLooks | null = null;
  let started = false;
  const listeners = new Set<() => void>();

  function settle(value: SourceLooks): void {
    looks = value;
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (!started) {
        started = true;
        fetchSourceLooks({ url }).then(settle, () => settle(new Map()));
      }
      return () => listeners.delete(listener);
    },
    read: () => looks,
  };
}

function notYet(): null {
  return null;
}
