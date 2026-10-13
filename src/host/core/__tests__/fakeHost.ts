/**
 * A host page for the tests: it records what the tool posts to it, and
 * connects through a real `MessageChannel`, so every request and answer is
 * structured-cloned as in a browser.
 */

import type { HostMessageEvent, LoadedInput } from '../connectHost.ts';
import { connectHost } from '../connectHost.ts';
import type { ToolInterface } from '../protocol.ts';

/** The site, as these tests know it. */
export const TOOL: ToolInterface = {
  name: '3d',
  inputs: [
    { key: 'structure', kinds: ['chem.molfile', 'chem.ocl.id', 'chem.smiles'] },
  ],
  outputs: [],
};

/** Ethylbenzene, as OpenChemLib writes it. */
export const ETHYLBENZENE = {
  idCode: 'daD@@DjUZxHH@@',
  coordinates: String.raw`!BbOs~_{\BbGvH_[]}?g|`,
};

/**
 * Start the site's side against a fake host page.
 * @param load - The site's load function; by default it records each call.
 * @returns The host, what was posted to it, and the means to connect and stop.
 */
export function startHost(load?: (inputs: readonly LoadedInput[]) => void) {
  const posted: Array<{ message: unknown; targetOrigin: string }> = [];
  const loads: LoadedInput[][] = [];
  const host = {
    postMessage(message: unknown, targetOrigin: string) {
      posted.push({ message, targetOrigin });
    },
  };
  let listener: ((event: HostMessageEvent) => void) | null = null;
  const stop = connectHost({
    host,
    listen(next) {
      listener = next;
      return () => {
        listener = null;
      };
    },
    tool: TOOL,
    origin: 'https://3d.cheminfo.org',
    build: { version: '1.2.1' },
    load:
      load ??
      ((inputs) => {
        loads.push([...inputs]);
      }),
  });
  const channels: MessageChannel[] = [];

  return {
    host,
    posted,
    loads,
    stop,
    isListening: () => listener !== null,
    /**
     * Answer `hello`.
     * @param source - The window the answer claims to come from.
     * @param version - The protocol version it names.
     * @param name - How the host introduces itself.
     * @returns This host's end of the port.
     */
    connect(source: unknown = host, version = 1, name = 'Test'): MessagePort {
      const channel = new MessageChannel();
      channels.push(channel);
      listener?.({
        data: { type: 'cheminfo:connect', version, host: { name } },
        source,
        ports: [channel.port2],
      });
      return channel.port1;
    },
    close() {
      stop();
      for (const channel of channels) channel.port1.close();
    },
  };
}

/**
 * Send one request through the host's end of the port, and wait for the answer.
 * @param port - The host's end, as `connect` returned it.
 * @param message - The request.
 * @returns The first message that comes back.
 */
export function request(port: MessagePort, message: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    port.addEventListener(
      'message',
      (event) => {
        resolve(event.data);
      },
      { once: true },
    );
    port.start();
    port.postMessage(message);
  });
}
