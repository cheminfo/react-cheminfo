/**
 * A tool's side of the host protocol: introduce itself to the page that
 * frames it, take the private port that page answers with, serve what arrives
 * through it, and send back what the host takes back.
 *
 * Free of React and of the DOM — the window is handed in — so a test drives the
 * whole exchange with a fake host and a real `MessageChannel`.
 */

import type { HostOutputs } from './hostOutputs.ts';
import {
  OUTPUT_DELAY,
  answerGet,
  createOutputPublisher,
} from './hostOutputs.ts';
import type {
  HelloMessage,
  LoadRequest,
  ResultMessage,
  ToolInterface,
  UsedItem,
} from './protocol.ts';
import {
  HELLO_TYPE,
  PROTOCOL_VERSION,
  isConnect,
  parseRequest,
} from './protocol.ts';
import type { LoadedInput } from './selectInputs.ts';
import { selectInputs } from './selectInputs.ts';

export type { InputSelection, LoadedInput } from './selectInputs.ts';
export { selectInputs } from './selectInputs.ts';

/** What a window `message` event carries, as far as the protocol reads it. */
export interface HostMessageEvent {
  data: unknown;
  source: unknown;
  ports: readonly MessagePort[];
}

/** Where the connection runs, and what it serves. */
export interface HostConnectionOptions {
  /** The page to introduce the tool to: the parent frame, or the opener. */
  host: { postMessage: (message: unknown, targetOrigin: string) => void };
  /** Subscribe to this window's messages; the returned function unsubscribes. */
  listen: (listener: (event: HostMessageEvent) => void) => () => void;
  /** What the tool takes and gives, as `hello` announces it. */
  tool: ToolInterface;
  /** The tool's origin, as `hello` states it. */
  origin: string;
  /** The build that is running, as the About states it, or `null`. */
  build: unknown;
  /**
   * Show the inputs of a new document. Throwing, or rejecting, means they
   * could not be read: the error's message goes back to the host, and the
   * document is not marked as applied.
   */
  load: (inputs: readonly LoadedInput[]) => void | Promise<void>;
  /**
   * Where the values of the tool's outputs are read, for `get` and for the
   * `output` sent when one the host accepted changes.
   * @default undefined — nothing goes back
   */
  outputs?: HostOutputs;
  /**
   * How long the outputs must stay still before a change is sent, in
   * milliseconds.
   * @default OUTPUT_DELAY
   */
  outputDelay?: number;
}

/**
 * Say `hello` to the host, and serve its requests once it connects.
 *
 * A `connect` is accepted only from the window `hello` went to, and a second
 * one replaces the first — a host that reloads its own script connects again.
 * A document is applied once: the same one again is answered as before and
 * changes nothing, so a host re-sending it never overwrites the user's work.
 * Requests are served one at a time, in order, so a `get` sent after a `load`
 * reads what that load showed, however long it took.
 * @param options - The window, the tool, and its load function.
 * @returns The function that stops listening and closes the port.
 */
export function connectHost(options: HostConnectionOptions): () => void {
  const { host, listen, tool, origin, build, load, outputs } = options;
  const { outputDelay = OUTPUT_DELAY } = options;
  let port: MessagePort | null = null;
  let appliedDocument: string | null = null;
  let appliedUsed: UsedItem[] = [];
  let served: Promise<void> = Promise.resolve();

  const publisher =
    outputs === undefined
      ? null
      : createOutputPublisher(
          outputs,
          (message) => port?.postMessage(message),
          outputDelay,
        );
  const stopHearing = outputs?.subscribe(() => publisher?.changed());

  function serve(data: unknown): void {
    const request = parseRequest(data);
    if (request === null) return;
    served = served
      .then(async () => {
        const result =
          request.type === 'load'
            ? await applyLoad(request)
            : answerGet(request, tool, outputs);
        port?.postMessage(result);
      })
      // A request that failed must not stop the ones after it being served,
      // and must still be seen: it is thrown again, on its own.
      .catch((error: unknown) => {
        queueMicrotask(() => {
          throw error;
        });
      });
  }

  async function applyLoad(request: LoadRequest): Promise<ResultMessage> {
    const { id, document, items } = request;
    if (document === appliedDocument) {
      return { type: 'result', id, ok: true, used: appliedUsed };
    }
    const selection = selectInputs(tool, items);
    if (!selection.ok) {
      return { type: 'result', id, ok: false, error: selection.error };
    }
    // An edit still settling belongs to the document on screen, which the
    // outputs describe only until this one replaces it.
    publisher?.flush();
    try {
      await load(selection.inputs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        type: 'result',
        id,
        ok: false,
        error: { code: 'unreadable', message },
      };
    }
    return applied(request, selection.inputs);
  }

  // Nothing else runs between a load's check and this: requests are served
  // one at a time.
  function applied(
    request: LoadRequest,
    inputs: readonly LoadedInput[],
  ): ResultMessage {
    const { id, document, accept = [] } = request;
    appliedDocument = document;
    appliedUsed = inputs.map(({ key, item }) => ({ key, kind: item.kind }));
    publisher?.baseline(document, accept);
    return { type: 'result', id, ok: true, used: appliedUsed };
  }

  const stopListening = listen((event) => {
    if (event.source !== host || !isConnect(event.data)) return;
    const received = event.ports[0];
    if (received === undefined) return;
    port?.close();
    port = received;
    port.addEventListener('message', (message) => {
      serve(message.data);
    });
    port.start();
  });

  const hello: HelloMessage = {
    type: HELLO_TYPE,
    version: PROTOCOL_VERSION,
    tool: {
      name: tool.name,
      origin,
      build,
      inputs: tool.inputs,
      outputs: tool.outputs,
    },
  };
  // `hello` says nothing a stranger may not read, and the parent's origin is
  // not knowable until it answers.
  host.postMessage(hello, '*');

  return () => {
    stopListening();
    stopHearing?.();
    publisher?.stop();
    port?.close();
    port = null;
  };
}
