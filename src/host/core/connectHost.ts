/**
 * A tool's side of the host protocol: introduce itself to the page that
 * frames it, take the private port that page answers with, and serve what
 * arrives through it.
 *
 * Free of React and of the DOM — the window is handed in — so a test drives the
 * whole exchange with a fake host and a real `MessageChannel`.
 */

import type { CheckedValue, KnownKind } from './kinds.ts';
import { checkValue, isKnownKind, kindAccepts } from './kinds.ts';
import type {
  GetRequest,
  HelloMessage,
  HostError,
  HostItem,
  LoadRequest,
  ResultMessage,
  ToolInput,
  ToolInterface,
  UsedItem,
} from './protocol.ts';
import {
  HELLO_TYPE,
  PROTOCOL_VERSION,
  isConnect,
  parseRequest,
} from './protocol.ts';

/** The item an input took, and its value as the input's kind reads it. */
export interface LoadedInput {
  key: string;
  item: HostItem;
  checked: CheckedValue;
}

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
   * Show the inputs of a new document. Throwing means they could not be read:
   * the error's message goes back to the host, and the document is not marked
   * as applied.
   */
  load: (inputs: readonly LoadedInput[]) => void;
}

/** What choosing the items of a request gave. */
export type InputSelection =
  { ok: true; inputs: LoadedInput[] } | { ok: false; error: HostError };

/**
 * Say `hello` to the host, and serve its requests once it connects.
 *
 * A `connect` is accepted only from the window `hello` went to, and a second
 * one replaces the first — a host that reloads its own script connects again.
 * A document is applied once: the same one again is answered as before and
 * changes nothing, so a host re-sending it never overwrites the user's work.
 * @param options - The window, the tool, and its load function.
 * @returns The function that stops listening and closes the port.
 */
export function connectHost(options: HostConnectionOptions): () => void {
  const { host, listen, tool, origin, build, load } = options;
  let port: MessagePort | null = null;
  let appliedDocument: string | null = null;
  let appliedUsed: UsedItem[] = [];

  function serve(data: unknown): void {
    const request = parseRequest(data);
    if (request === null) return;
    const result =
      request.type === 'load' ? applyLoad(request) : answerGet(request, tool);
    port?.postMessage(result);
  }

  function applyLoad(request: LoadRequest): ResultMessage {
    const { id, document, items } = request;
    if (document === appliedDocument) {
      return { type: 'result', id, ok: true, used: appliedUsed };
    }
    const selection = selectInputs(tool, items);
    if (!selection.ok) {
      return { type: 'result', id, ok: false, error: selection.error };
    }
    try {
      load(selection.inputs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        type: 'result',
        id,
        ok: false,
        error: { code: 'unreadable', message },
      };
    }
    appliedDocument = document;
    appliedUsed = selection.inputs.map(({ key, item }) => ({
      key,
      kind: item.kind,
    }));
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
    port?.close();
    port = null;
  };
}

/**
 * Give each input of the tool one item of a request.
 *
 * Each input tries its kinds in its own order of preference, and takes the
 * first item that falls under one and passes that kind's schema: the tool
 * knows which notation serves it best, whatever order the host listed them in.
 * An item naming another input's `key` is left to that input.
 * @param tool - What the tool takes.
 * @param items - What the host sent.
 * @returns One item per input, or why an input got none.
 */
export function selectInputs(
  tool: ToolInterface,
  items: readonly HostItem[],
): InputSelection {
  const inputs: LoadedInput[] = [];
  for (const input of tool.inputs) {
    const errors: string[] = [];
    const loaded = selectInput(input, items, errors);
    if (loaded !== null) {
      inputs.push(loaded);
      continue;
    }
    if (errors.length > 0) {
      return {
        ok: false,
        error: {
          code: 'invalid',
          message: `No item for ${input.key} has the shape its kind requires, so ${tool.name} loaded nothing.`,
          errors,
        },
      };
    }
    return {
      ok: false,
      error: {
        code: 'no-input',
        message: `No item is a ${KIND_LIST.format(input.kinds)}, so ${tool.name} loaded nothing.`,
      },
    };
  }
  return { ok: true, inputs };
}

function selectInput(
  input: ToolInput,
  items: readonly HostItem[],
  errors: string[],
): LoadedInput | null {
  for (const accepted of input.kinds) {
    if (!isKnownKind(accepted)) continue;
    for (const item of items) {
      if (item.key !== undefined && item.key !== input.key) continue;
      if (!kindAccepts(accepted, item.kind)) continue;
      const loaded = checkItem(input.key, accepted, item, errors);
      if (loaded !== null) return loaded;
    }
  }
  return null;
}

function checkItem(
  key: string,
  accepted: KnownKind,
  item: HostItem,
  errors: string[],
): LoadedInput | null {
  const outcome = checkValue(accepted, item.value);
  if (outcome.valid) return { key, item, checked: outcome.checked };
  for (const error of outcome.errors) errors.push(`${item.kind} ${error}`);
  return null;
}

function answerGet(request: GetRequest, tool: ToolInterface): ResultMessage {
  // Nothing goes back yet: no tool declares an output.
  return {
    type: 'result',
    id: request.id,
    ok: false,
    error: {
      code: 'no-output',
      message: `${tool.name} has nothing to give back yet.`,
    },
  };
}

const KIND_LIST = new Intl.ListFormat('en', { type: 'disjunction' });
