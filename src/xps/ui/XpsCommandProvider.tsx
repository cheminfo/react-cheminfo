import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';

import { useXpsShortcuts } from './useXpsShortcuts.ts';
import type {
  RunXpsCommand,
  XpsCommandHandlers,
} from './xpsCommandContext.tsx';
import { xpsCommandContext } from './xpsCommandContext.tsx';

export interface XpsCommandProviderProps {
  /** What to run for each command. */
  handlers: XpsCommandHandlers;
  /**
   * The viewer's own root, which is what the keys are heard on. While it is
   * `null` the viewer answers no key — which is what a viewer rendered on a
   * server, or one whose root has yet to be mounted, should do.
   * @default null
   */
  root?: HTMLElement | null;
  /** The viewer the commands are offered in. */
  children: ReactNode;
}

/**
 * Hold the registry, and bind the keys that reach it.
 *
 * The handlers are held in a ref and reached through one callback that never
 * changes, so a viewer rebuilding its closures on every render — which every
 * viewer does, on every drag of the mouse — neither takes the key listener down
 * and puts it back up, nor re-renders the buttons that only fire a command.
 * @param props - Component props.
 * @returns The viewer, with every command reachable inside it.
 */
export function XpsCommandProvider(props: XpsCommandProviderProps) {
  const { handlers, root = null, children } = props;

  const current = useRef(handlers);
  useLayoutEffect(() => {
    current.current = handlers;
  });

  const run = useCallback<RunXpsCommand>((id) => {
    const handler = current.current[id];
    if (handler === undefined) return false;
    handler();
    return true;
  }, []);

  useXpsShortcuts(root, run);

  return (
    <xpsCommandContext.Provider value={run}>
      {children}
    </xpsCommandContext.Provider>
  );
}
