/**
 * Where the page formats its messages from, and who is told when that changes.
 *
 * Ordinarily a message is read straight out of a catalog. While a translator
 * has the page open, every message goes through their session instead — marked
 * invisibly so the overlay can find it in the DOM, and answered with whatever
 * they have typed rather than with what was published. Both the session and a
 * language arriving late are changes the page has to redraw for, so they share
 * one version counter and one set of listeners.
 */

import type { MessageValues } from './messageValues.ts';

/**
 * What a page in translate mode formats through — satisfied by
 * `TranslateSession` from `react-cheminfo/translate`, which is never imported
 * here: an ordinary visit must not load the ICU formatter behind it.
 */
export interface MessageSession {
  /** The message of a catalog, formatted and marked. */
  format: (catalogId: string, key: string, values?: MessageValues) => string;
  /** Be told whenever an edit is typed; returns the function that stops it. */
  subscribe?: (listener: () => void) => () => void;
}

let session: MessageSession | null = null;
let stopListening: (() => void) | null = null;
let version = 0;
const listeners = new Set<() => void>();

/**
 * Format every message through a translator's session from now on.
 *
 * While one is set it is the session's locale the page is written in, not the
 * visitor's preference, and every message carries the marker the overlay finds
 * it by.
 * @param active - The session, or `null` to go back to the catalogs.
 */
export function setMessageSession(active: MessageSession | null): void {
  stopListening?.();
  stopListening = null;
  session = active;
  if (active?.subscribe !== undefined) {
    stopListening = active.subscribe(notifyMessages);
  }
  notifyMessages();
}

/**
 * The session the page formats through, if a translator has it open.
 * @returns The session, or `null`.
 */
export function messageSession(): MessageSession | null {
  return session;
}

/**
 * How many times the text of the page has changed — a session set or dropped,
 * an edit typed, a language finished loading.
 * @returns The count, which only ever grows.
 */
export function messagesVersion(): number {
  return version;
}

/**
 * Be told whenever the text of the page changes.
 * @param listener - Called after each change.
 * @returns The function that stops it.
 */
export function subscribeToMessages(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Say that the text of the page has changed. Never part of the public API. */
export function notifyMessages(): void {
  version++;
  for (const listener of listeners) listener();
}
