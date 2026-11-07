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
  LoadOutcome,
  ToolConnection,
  ToolConnectionOptions,
  ToolDocument,
} from './connectToolTypes.ts';
import type { ResultMessage } from './protocol.ts';
import { CONNECT_TYPE, PROTOCOL_VERSION } from './protocol.ts';
import { readHello, readToolMessage } from './toolMessages.ts';

export type {
  LoadOutcome,
  ToolConnection,
  ToolConnectionOptions,
  ToolDocument,
  ToolFrameWindow,
  ToolWindowEvent,
} from './connectToolTypes.ts';

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
  const { frame, origin, host, listen, onHello, onOutput, onSettings } =
    options;
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
    if (message.type === 'settings') {
      onSettings?.(message.settings, message.fields ?? []);
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
    setSettings(settings) {
      post({ type: 'settings', settings }, { answer: ignore, abandon: ignore });
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

/** What a tool answers to `settings` is what it then says it holds. */
function ignore(): void {
  // Nothing to do.
}

function outcomeOf(message: ResultMessage): LoadOutcome {
  if (!message.ok) return { status: 'refused', error: message.error };
  return { status: 'loaded', used: 'used' in message ? message.used : [] };
}
