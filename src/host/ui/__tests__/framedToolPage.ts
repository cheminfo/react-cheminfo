import type {
  HostConnectionOptions,
  HostMessageEvent,
} from '../../core/connectHost.ts';
import { connectHost } from '../../core/connectHost.ts';
import type { ToolInterface } from '../../core/protocol.ts';

/** The origin the tool's page is served from in these tests. */
export const TOOL_ORIGIN = 'https://3d.cheminfo.org';

/** A site taking a structure, and handing back its picture and a conformer. */
export const TOOL: ToolInterface = {
  name: '3d',
  inputs: [{ key: 'structure', kinds: ['chem.smiles'] }],
  outputs: [
    { key: 'figure', kind: 'image.svg' },
    { key: 'conformer', kind: 'chem.molfile.3d' },
  ],
};

/** What the tool's site does with what it is handed. */
export type ToolSite = Pick<
  HostConnectionOptions,
  'load' | 'outputs' | 'settings' | 'outputDelay'
>;

/**
 * Start the tool's own side in a frame jsdom never loads: what the host posts
 * to the frame's window reaches the tool, and what the tool posts to its
 * parent arrives on the host's window from the frame, at the tool's origin.
 * The port between them is a real `MessageChannel`.
 * @param toolWindow - The window of the frame the host page rendered.
 * @param site - What the tool's site does with what it is handed.
 * @returns The function that stops the tool's side.
 */
export function startToolPage(toolWindow: Window, site: ToolSite): () => void {
  const listeners = new Set<(event: HostMessageEvent) => void>();
  const parentWindow = {
    postMessage(message: unknown) {
      globalThis.dispatchEvent(
        new MessageEvent('message', {
          data: message,
          source: toolWindow,
          origin: TOOL_ORIGIN,
        }),
      );
    },
  };
  // The host posts to the tool's origin alone, as connectTool always does.
  toolWindow.postMessage = (
    message: unknown,
    _targetOrigin?: unknown,
    transfer?: unknown,
  ) => {
    for (const listener of listeners) {
      listener({
        data: message,
        source: parentWindow,
        ports: (transfer ?? []) as MessagePort[],
      });
    }
  };
  return connectHost({
    host: parentWindow,
    listen(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    tool: TOOL,
    origin: TOOL_ORIGIN,
    build: { version: '1.2.1' },
    ...site,
  });
}
