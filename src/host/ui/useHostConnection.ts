/**
 * Connect a tool to the page that frames it, when there is one.
 *
 * The protocol and its schemas are fetched only then, so a visitor on the site
 * itself never downloads them.
 */

import { useEffect, useRef } from 'react';

import type { CitedWork } from '../../citation/core/works.ts';
import type { FigureSource } from '../../download/core/figureSource.ts';
import { figureAddress } from '../../download/core/figureSource.ts';
import type { FigureStates } from '../../download/core/figureState.ts';
import { setPageFigureSource } from '../../download/core/pageFigureSource.ts';
import type { HostOutputs } from '../core/hostOutputs.ts';
import type { HostSettings } from '../core/hostSettings.ts';
import type { ToolInterface } from '../core/protocol.ts';
import type { LoadedInput } from '../core/selectInputs.ts';
import type { ToolHelp } from '../core/toolCredits.ts';

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
   * What a host may set while the page is open, so its toolbar can drive a
   * tool that a new address would make compute everything again. Read once,
   * when the host connects, so it lives as long as the page.
   * @default undefined — the tool has no settings
   */
  settings?: HostSettings;
  /**
   * The build that is running — `BUILD_INFO` from `react-cheminfo/build-info`
   * — so a host can record which version produced what it stores.
   * @default null
   */
  build?: unknown;
  /**
   * The works the About asks to be cited for — `ABOUT.cite` — so a page that
   * frames the tool says how to cite it.
   * @default undefined — the host is told nothing
   */
  cite?: readonly CitedWork[];
  /**
   * Help on the page a host frames, for its toolbar: what the page is for and
   * how to use it, in at most three short paragraphs.
   * @default undefined — the page needs none
   */
  help?: ToolHelp;
  /**
   * What the page holds, in the site's own format: its `data` — the
   * conformers of 3d, the plate of tlc, the spectra of chemcalc — and, when
   * the site keeps them, its `view` and its `preferences`. Every figure the
   * page hands back or saves carries them, so the site opens the figure again
   * as it was, with nothing computed anew, from a file opened or dropped on the
   * page or from a host handing it over on `FIGURE_INPUT`.
   * @default undefined — the page's figures cannot be opened again
   */
  states?: () => FigureStates | undefined | Promise<FigureStates | undefined>;
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

  // Framed or not, every figure the page saves says where it came from.
  useEffect(
    () =>
      setPageFigureSource(async () => {
        const states = await latest.current.states?.();
        const source: FigureSource = {
          site: tool.name,
          href: figureAddress(globalThis.location.href),
          ...states,
        };
        return source;
      }),
    [tool],
  );

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
          ...(latest.current.cite === undefined
            ? {}
            : { cite: latest.current.cite }),
          ...(latest.current.help === undefined
            ? {}
            : { help: latest.current.help }),
          load: (inputs) => latest.current.load(inputs),
          ...(latest.current.outputs === undefined
            ? {}
            : { outputs: latest.current.outputs }),
          ...(latest.current.settings === undefined
            ? {}
            : { settings: latest.current.settings }),
          states: async () => latest.current.states?.(),
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
