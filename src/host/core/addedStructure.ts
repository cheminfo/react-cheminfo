/**
 * The outputs of a search a host frames: the structure the reader hands over,
 * sent unasked each time they do.
 */

import type { HostOutputs } from './hostOutputs.ts';
import type { HostItem } from './protocol.ts';

/** The structure handed over last. */
export interface AddedStructure {
  /** How many were handed over so far: each hand-over is an item of its own. */
  count: number;
  /** The structure, as a molfile. */
  molfile: string;
}

/** Where the structure handed over last is read, as a signal holds it. */
export interface AddedStructureSource {
  /** The structure handed over last, or `null` before the first. */
  peek: () => AddedStructure | null;
  /** Be told when another is handed over; the returned function stops it. */
  subscribe: (listener: () => void) => () => void;
}

/**
 * The outputs of a page whose reader hands structures over to the host: the
 * last one, as `chem.molfile` under the `structure` key, with an `id` of its
 * own each time, so the same structure handed over twice reaches the host
 * twice. What a host asks for — the result picked, say — is the site's.
 * @param added - The structure handed over last, e.g. a signal of the view.
 * @param render - The outputs made only when a host asks for them.
 * @returns What the site hands back.
 */
export function addedStructureOutputs(
  added: AddedStructureSource,
  render?: HostOutputs['render'],
): HostOutputs {
  return {
    read: () => {
      const last = added.peek();
      if (last === null) return [];
      const item: HostItem = {
        key: 'structure',
        kind: 'chem.molfile',
        id: String(last.count),
        value: { molfile: last.molfile },
      };
      return [item];
    },
    subscribe: (listener) => added.subscribe(listener),
    ...(render === undefined ? {} : { render }),
  };
}
