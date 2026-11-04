/**
 * What a tool hands back: the values a `get` asks for, and the `output` it
 * sends when a value the host accepted changes.
 *
 * An `output` carries only what changed, item by item, against what the host
 * already has: the values as they stood once its document was applied, then
 * every value sent since. Opening a document therefore never writes it back,
 * and a band picked on one spectrum of a sample leaves the others alone.
 *
 * A value that costs something to make — a picture rendered from the scene on
 * screen — is not read with the others: it is rendered when a `get` names it,
 * and never sent unasked.
 */

import { kindAccepts } from './kinds.ts';
import type { HostItem, OutputMessage } from './protocol.ts';

/** Where a tool's outputs are read, and how their changes are heard. */
export interface HostOutputs {
  /**
   * The value of every output now, one item each, carrying its `key` and the
   * `id` of the item it was made from. It must already show a document once
   * `load` has returned, or the host is sent back what it just loaded.
   */
  read: () => readonly HostItem[];
  /** Be told whenever they may have changed; the returned function stops it. */
  subscribe: (listener: () => void) => () => void;
  /**
   * The outputs made only when a host asks for them, by key: a `get` naming one
   * waits for its value, which is never sent unasked. A function resolving to
   * `undefined` has nothing to give yet; one that rejects answers the `get`
   * with its error's message.
   * @default undefined — every output is read by `read`
   */
  render?: Readonly<Record<string, () => Promise<HostItem | undefined>>>;
}

/**
 * How long the outputs must stay still before a change is sent, in
 * milliseconds: a burst of edits is one message.
 */
export const OUTPUT_DELAY = 300;

/** What the connection tells the publisher, and the means to stop it. */
export interface OutputPublisher {
  /** A document was applied: what the host has is what the tool now shows. */
  baseline: (document: string, accept: readonly string[]) => void;
  /** The outputs may have changed. */
  changed: () => void;
  /**
   * Send what changed now rather than once it settles: another document is
   * about to replace what the outputs are read from.
   */
  flush: () => void;
  /** Send nothing more. */
  stop: () => void;
}

/**
 * Send the host what changed of the outputs it accepted, once they settle.
 * @param outputs - Where the values are read.
 * @param send - Posts a message to the host, when there is one.
 * @param delay - How long the values must stay still, in milliseconds.
 * @returns The publisher.
 */
export function createOutputPublisher(
  outputs: HostOutputs,
  send: (message: OutputMessage) => void,
  delay: number,
): OutputPublisher {
  let document: string | null = null;
  let accepted = new Set<string>();
  let known = new Map<string, string>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush(): void {
    timer = undefined;
    if (document === null) return;
    const current = readAccepted(outputs, accepted);
    // A value that went away is forgotten, so it goes back again if it
    // returns: the reader let go of a pick, then picked it once more.
    for (const identity of known.keys()) {
      if (!current.has(identity)) known.delete(identity);
    }
    const items: HostItem[] = [];
    for (const [identity, entry] of current) {
      if (known.get(identity) === entry.text) continue;
      known.set(identity, entry.text);
      items.push(entry.item);
    }
    if (items.length > 0) send({ type: 'output', document, items });
  }

  function stop(): void {
    clearTimeout(timer);
    timer = undefined;
  }

  return {
    baseline(next, accept) {
      stop();
      document = next;
      accepted = new Set(accept);
      known = new Map();
      for (const [identity, entry] of readAccepted(outputs, accepted)) {
        known.set(identity, entry.text);
      }
    },
    changed() {
      if (document === null || accepted.size === 0) return;
      stop();
      timer = setTimeout(flush, delay);
    },
    flush() {
      stop();
      flush();
    },
    stop,
  };
}

/**
 * The accepted items, each under an identity that survives a re-read: its
 * key, the id of the item it was made from, and its rank among items sharing
 * both.
 * @param outputs - Where the values are read.
 * @param accepted - The keys and kinds the host takes back.
 * @returns Each item with its value as text, by identity.
 */
function readAccepted(
  outputs: HostOutputs,
  accepted: ReadonlySet<string>,
): Map<string, { item: HostItem; text: string }> {
  const entries = new Map<string, { item: HostItem; text: string }>();
  if (accepted.size === 0) return entries;
  for (const item of outputs.read()) {
    if (!isAccepted(item, accepted)) continue;
    const base = `${item.key ?? item.kind}\n${item.id ?? ''}`;
    let rank = 0;
    while (entries.has(`${base}\n${rank}`)) rank++;
    entries.set(`${base}\n${rank}`, {
      item,
      text: JSON.stringify(item.value),
    });
  }
  return entries;
}

/**
 * Whether the host takes an item back: `accept` names its output's key, or
 * its kind — a kind taking every kind under it, as an input's does.
 * @param item - The item.
 * @param accepted - What the host takes back.
 * @returns Whether it goes back.
 */
function isAccepted(item: HostItem, accepted: ReadonlySet<string>): boolean {
  if (item.key !== undefined && accepted.has(item.key)) return true;
  for (const name of accepted) {
    if (kindAccepts(name, item.kind)) return true;
  }
  return false;
}
