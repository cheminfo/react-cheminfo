/**
 * What a host's side of the host protocol runs with, and what it gives back:
 * the frame and the window it talks through, the documents it hands over, and
 * the connection itself.
 */

import type {
  HostError,
  HostItem,
  OutputMessage,
  ToolSettingField,
  ToolSettings,
  UsedItem,
} from './protocol.ts';
import type { ToolHello } from './toolMessages.ts';

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
   * Told of the tool's settings when it connects, and whenever one changes,
   * with how a host draws a control for each — none when the tool describes
   * none. A tool that has no settings tells nothing.
   * @default undefined
   */
  onSettings?: (
    settings: ToolSettings,
    fields: readonly ToolSettingField[],
  ) => void;
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
  /**
   * Change some of the tool's settings; the frame and the document stay.
   * Ignored while the tool is not connected. The new values come back through
   * `onSettings`.
   */
  setSettings: (settings: ToolSettings) => void;
  /** Stop listening and close the port; what is pending is dropped. */
  close: () => void;
}
