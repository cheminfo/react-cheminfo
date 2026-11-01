/**
 * A host's side of the host protocol: answer the `hello` of the tool in a
 * frame with a private port, hand it documents, hear the values it sends back,
 * and ask it for others.
 *
 * Free of React and of the DOM — the frame and the window are handed in — so a
 * test drives the whole exchange against a real tool side and a real
 * `MessageChannel`.
 */

import type {
  HostError,
  HostItem,
  OutputMessage,
  ResultMessage,
  UsedItem,
} from './protocol.ts';
import { CONNECT_TYPE, PROTOCOL_VERSION } from './protocol.ts';
import type { ToolHello } from './toolMessages.ts';
import { readHello, readToolMessage } from './toolMessages.ts';

/** A message posted to this window, as far as a host reads it. */
export interface ToolWindowEvent {
  data: unknown;
  source: unknown;
  origin: string;
}

/** The window of the frame the tool runs in. */
export interface ToolFrameWindow {
  postMessage: (
    message: unknown,
    targetOrigin: string,
    transfer: Transferable[],
  ) => void;
}

/** A document handed to a tool: what it shows, and what it sends back unasked. */
export interface ToolDocument {
  /** What the data belongs to; the tool applies the same document once. */
  document: string;
  /** The values, each with its kind. */
  items: HostItem[];
  /**
   * The outputs the tool sends whenever they change, by key or by kind.
   * @default undefined — nothing is sent unasked
   */
  accept?: string[];
}

/**
 * What became of a document: shown, refused with the tool's reason, or never
 * answered — another document took its place, the connection was closed, or
 * the tool took too long.
 */
export type LoadOutcome =
  | { status: 'loaded'; used: UsedItem[] }
  | { status: 'refused'; error: HostError }
  | { status: 'dropped' };

/** Where the connection runs, and whom it talks to. */
export interface ToolConnectionOptions {
  /** The window of the frame, once there is one: `hello` is taken from it alone. */
  frame: () => ToolFrameWindow | null;
  /** Where the tool is served from: a message from any other origin is ignored. */
  origin: string;
  /** How the host introduces itself in `connect`. */
  host: { name: string };
  /** Subscribe to this window's messages; the returned function unsubscribes. */
  listen: (listener: (event: ToolWindowEvent) => void) => () => void;
  /**
   * Told each time the tool says `hello` — once per load of the frame — with
   * what it takes and gives.
   * @default undefined
   */
  onHello?: (tool: ToolHello) => void;
  /**
   * Told of every `output` the tool sends.
   * @default undefined
   */
  onOutput?: (message: OutputMessage) => void;
  /**
   * How long a request may go unanswered, in milliseconds.
   * @default REQUEST_TIMEOUT
   */
  timeout?: number;
}

/** A connection to a framed tool. */
export interface ToolConnection {
  /**
   * Show a document. One handed over before the tool has connected waits for
   * it, and the latest is handed over again whenever the tool connects anew —
   * after a reload of its frame.
   */
  load: (document: ToolDocument) => Promise<LoadOutcome>;
  /** The current values of some outputs; rejects with the tool's reason. */
  get: (keys: readonly string[]) => Promise<HostItem[]>;
  /** Stop listening and close the port; what is pending is dropped. */
  close: () => void;
}

/** How long a request may go unanswered, in milliseconds. */
export const REQUEST_TIMEOUT = 20_000;

type Abandon = 'timeout' | 'reconnected' | 'closed';

const ABANDONED: Record<Abandon, string> = {
  timeout: 'The tool did not answer in time.',
  reconnected: 'The tool was reloaded before it answered.',
  closed: 'The tool is no longer connected.',
};

interface Waiting {
  answer: (message: ResultMessage) => void;
  abandon: (reason: Abandon) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface Shown {
  document: ToolDocument;
  /** Who waits for its first answer; `null` once told. */
  settle: ((outcome: LoadOutcome) => void) | null;
}

/**
 * Listen for the framed tool's `hello`, and talk to it once it has said it.
 *
 * A `hello` counts only from the frame's window and from the tool's origin —
 * a frame that navigated elsewhere keeps its window — and `connect` is posted
 * to that origin alone, so a page the frame later shows never receives the
 * port, nor anything sent through it.
 * @param options - The frame, the tool's origin, and what to tell.
 * @returns The connection.
 */
export function connectTool(options: ToolConnectionOptions): ToolConnection {
  const { frame, origin, host, listen, onHello, onOutput } = options;
  const { timeout = REQUEST_TIMEOUT } = options;
  const waiting = new Map<string, Waiting>();
  let port: MessagePort | null = null;
  let shown: Shown | null = null;
  let count = 0;
  let closed = false;

  function post(
    body: Record<string, unknown>,
    handlers: Omit<Waiting, 'timer'>,
  ): void {
    if (port === null) return;
    count += 1;
    const id = `h${count}`;
    const timer = setTimeout(() => {
      waiting.delete(id);
      handlers.abandon('timeout');
    }, timeout);
    waiting.set(id, { ...handlers, timer });
    port.postMessage({ ...body, id });
  }

  function abandonAll(reason: Abandon): void {
    for (const entry of waiting.values()) {
      clearTimeout(entry.timer);
      entry.abandon(reason);
    }
    waiting.clear();
  }

  function settle(entry: Shown, outcome: LoadOutcome): void {
    entry.settle?.(outcome);
    entry.settle = null;
  }

  function send(entry: Shown): void {
    const { document, items, accept } = entry.document;
    post(
      {
        type: 'load',
        document,
        items,
        ...(accept === undefined ? {} : { accept }),
      },
      {
        answer: (message) => {
          settle(entry, outcomeOf(message));
        },
        // Sent again to the reloaded tool, which answers then.
        abandon: (reason) => {
          if (reason !== 'reconnected') settle(entry, { status: 'dropped' });
        },
      },
    );
  }

  function receive(data: unknown): void {
    const message = readToolMessage(data);
    if (message === null) return;
    if (message.type === 'output') {
      onOutput?.(message);
      return;
    }
    const entry = waiting.get(message.id);
    if (entry === undefined) return;
    waiting.delete(message.id);
    clearTimeout(entry.timer);
    entry.answer(message);
  }

  const stopListening = listen((event) => {
    if (closed || event.origin !== origin) return;
    const target = frame();
    if (target === null || event.source !== target) return;
    const tool = readHello(event.data);
    if (tool === null) return;
    abandonAll('reconnected');
    port?.close();
    const channel = new MessageChannel();
    port = channel.port1;
    port.addEventListener('message', (message) => {
      receive(message.data);
    });
    port.start();
    target.postMessage(
      { type: CONNECT_TYPE, version: PROTOCOL_VERSION, host },
      origin,
      [channel.port2],
    );
    onHello?.(tool);
    if (shown !== null) send(shown);
  });

  return {
    load(document) {
      return new Promise((resolve) => {
        if (shown !== null) settle(shown, { status: 'dropped' });
        const entry: Shown = { document, settle: resolve };
        shown = entry;
        if (closed) settle(entry, { status: 'dropped' });
        else send(entry);
      });
    },
    get(keys) {
      return new Promise((resolve, reject) => {
        if (port === null) {
          reject(
            new Error(
              closed
                ? ABANDONED.closed
                : 'The tool has not connected yet, so it has nothing to give.',
            ),
          );
          return;
        }
        post(
          { type: 'get', keys: [...keys] },
          {
            answer: (message) => {
              if (!message.ok) {
                reject(new Error(message.error.message, { cause: message }));
              } else {
                resolve('items' in message ? message.items : []);
              }
            },
            abandon: (reason) => {
              reject(new Error(ABANDONED[reason]));
            },
          },
        );
      });
    },
    close() {
      if (closed) return;
      closed = true;
      stopListening();
      abandonAll('closed');
      if (shown !== null) settle(shown, { status: 'dropped' });
      port?.close();
      port = null;
    },
  };
}

function outcomeOf(message: ResultMessage): LoadOutcome {
  if (!message.ok) return { status: 'refused', error: message.error };
  return { status: 'loaded', used: 'used' in message ? message.used : [] };
}
