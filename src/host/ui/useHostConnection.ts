/**
 * Connect a tool to the page that frames it, when there is one.
 *
 * The protocol and its schemas are fetched only then, so a visitor on the site
 * itself never downloads them.
 */

import { useEffect, useRef } from 'react';

import type { HostOutputs } from '../core/hostOutputs.ts';
import type { ToolInterface } from '../core/protocol.ts';
import type { LoadedInput } from '../core/selectInputs.ts';

/** What a tool does with what its host sends, and what it says about itself. */
export interface HostHandlers {
  /**
   * Show the inputs of a new document. Throwing, or rejecting, means they
   * could not be read: the error's message goes back to the host, and nothing
   * should have changed on screen.
   */
  load: (inputs: readonly LoadedInput[]) => void | Promise<void>;
  /**
   * Where the values of the tool's outputs are read, and their changes heard.
   * Read once, when the host connects, so it lives as long as the page — a
   * store of signals rather than a value of one render.
   * @default undefined — nothing goes back
   */
  outputs?: HostOutputs;
  /**
   * The build that is running — `BUILD_INFO` from `react-cheminfo/build-info`
   * — so a host can record which version produced what it stores.
   * @default null
   */
  build?: unknown;
}

/** Once per page: React may mount the caller twice, the host is greeted once. */
let started = false;

/**
 * Introduce the tool to its parent frame, or to the window that opened it, and
 * serve that host for the life of the page.
 *
 * Call it after the hook that applies the address: effects run in order, so
 * the address has been applied by the time the host is greeted, and a host's
 * structure replaces the one the frame's link named rather than the reverse.
 * The latest `load` is always the one called, so it may close over state.
 * @param tool - What the tool takes and gives.
 * @param handlers - See {@link HostHandlers}.
 */
export function useHostConnection(
  tool: ToolInterface,
  handlers: HostHandlers,
): void {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    if (started) return;
    const host = hostWindow();
    if (host === null) return;
    started = true;
    import('../core/connectHost.ts')
      .then(({ connectHost }) => {
        connectHost({
          host,
          listen: (listener) => {
            globalThis.addEventListener('message', listener);
            return () => {
              globalThis.removeEventListener('message', listener);
            };
          },
          tool,
          origin: globalThis.location.origin,
          build: latest.current.build ?? null,
          load: (inputs) => latest.current.load(inputs),
          ...(latest.current.outputs === undefined
            ? {}
            : { outputs: latest.current.outputs }),
        });
      })
      .catch(() => {
        started = false;
      });
  }, [tool]);
}

function hostWindow(): Window | null {
  const { parent, opener } = globalThis.window;
  if (parent !== globalThis.window) return parent;
  return (opener as Window | null) ?? null;
}
