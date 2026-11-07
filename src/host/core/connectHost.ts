/**
 * A tool's side of the host protocol: introduce itself to the page that
 * frames it, take the private port that page answers with, serve what arrives
 * through it, and send back what the host takes back.
 *
 * Free of React and of the DOM — the window is handed in — so a test drives the
 * whole exchange with a fake host and a real `MessageChannel`.
 */

import { answerGet } from './answerGet.ts';
import type { HostConnectionOptions } from './hostConnectionOptions.ts';
import { OUTPUT_DELAY, createOutputPublisher } from './hostOutputs.ts';
import { applySettings, createSettingsPublisher } from './hostSettings.ts';
import type {
  HelloMessage,
  HostRequest,
  LoadRequest,
  ResultMessage,
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

export type {
  HostConnectionOptions,
  HostMessageEvent,
} from './hostConnectionOptions.ts';
export type { InputSelection, LoadedInput } from './selectInputs.ts';
export { selectInputs } from './selectInputs.ts';

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
  const { host, listen, tool, origin, build, cite, help, load, outputs } =
    options;
  const { inputs, state, settings } = options;
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
  const settingsPublisher =
    settings === undefined
      ? null
      : createSettingsPublisher(settings, (message) =>
          port?.postMessage(message),
        );
  const stopHearingSettings = settings?.subscribe(() =>
    settingsPublisher?.changed(),
  );

  function serve(data: unknown): void {
    const request = parseRequest(data);
    if (request === null) return;
    served = served
      .then(async () => {
        port?.postMessage(await answer(request));
      })
      // A request that failed must not stop the ones after it being served,
      // and must still be seen: it is thrown again, on its own.
      .catch((error: unknown) => {
        queueMicrotask(() => {
          throw error;
        });
      });
  }

  function answer(request: HostRequest): Promise<ResultMessage> {
    if (request.type === 'load') return applyLoad(request);
    if (request.type === 'settings') {
      return Promise.resolve(applySettings(request, settings));
    }
    return answerGet(request, tool, outputs, {
      ...(inputs === undefined ? {} : { inputs }),
      ...(state === undefined ? {} : { state }),
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
    settingsPublisher?.connected();
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
      ...(cite === undefined || cite.length === 0 ? {} : { cite: [...cite] }),
      ...(help === undefined ? {} : { help }),
    },
  };
  // `hello` says nothing a stranger may not read, and the parent's origin is
  // not knowable until it answers.
  host.postMessage(hello, '*');

  return () => {
    stopListening();
    stopHearing?.();
    stopHearingSettings?.();
    publisher?.stop();
    port?.close();
    port = null;
  };
}
