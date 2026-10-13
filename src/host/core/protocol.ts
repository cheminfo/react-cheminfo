/**
 * The cheminfo host protocol, version 1: what a page that frames a tool — an
 * electronic lab notebook, a course — and the tool say to each other.
 *
 * Two messages travel between the windows — `hello`, from the tool, and
 * `connect`, the host's answer carrying a private `MessagePort` — and everything
 * else goes through that port: the host's requests (`load`, `get`) and the
 * tool's `result` for each. This module only spells the messages, and reads
 * what arrives as the untrusted input it is.
 */

/** The version a tool speaks; a `connect` naming another is ignored. */
export const PROTOCOL_VERSION = 1;

/** Posted to the parent frame or the opener at start-up: who the tool is. */
export const HELLO_TYPE = 'cheminfo:hello';

/** The host's answer to `hello`, carrying the port the rest goes through. */
export const CONNECT_TYPE = 'cheminfo:connect';

/** How many items one request may carry; the rest are dropped. */
export const MAX_ITEMS = 64;

/** How long a label may be, in characters; a longer one is cut. */
export const MAX_LABEL_LENGTH = 80;

/** One typed value crossing the frame boundary. */
export interface HostItem {
  /** A kind name, e.g. `'chem.molfile.2d'`. */
  kind: string;
  /** Checked against the kind before anything reads it. */
  value: unknown;
  /**
   * The host's name for it, opaque here, e.g. an attachment.
   * @default undefined
   */
  id?: string;
  /**
   * The tool input it is meant for.
   * @default undefined — any input that accepts its kind
   */
  key?: string;
  /**
   * What a notice calls it, e.g. `'Ethylbenzene'`.
   * @default undefined
   */
  label?: string;
}

/** One value the tool takes. */
export interface ToolInput {
  key: string;
  /** Kinds in order of preference; a category accepts every kind under it. */
  kinds: readonly string[];
}

/** One value the tool can hand back. */
export interface ToolOutput {
  key: string;
  kind: string;
}

/** What the tool is and takes, as `hello` announces it. */
export interface ToolInterface {
  name: string;
  inputs: readonly ToolInput[];
  outputs: readonly ToolOutput[];
}

/** What `hello` carries: public, readable by any origin. */
export interface HelloMessage {
  type: typeof HELLO_TYPE;
  version: typeof PROTOCOL_VERSION;
  tool: ToolInterface & {
    /** The tool's origin, e.g. `'https://3d.cheminfo.org'`. */
    origin: string;
    /** The build that is running, as the About states it, or `null`. */
    build: unknown;
  };
}

/** `load`: the host's data, for one document. */
export interface LoadRequest {
  type: 'load';
  id: string;
  /** What the data belongs to; the same document twice is applied once. */
  document: string;
  items: HostItem[];
}

/** `get`: the current value of some outputs. */
export interface GetRequest {
  type: 'get';
  id: string;
  keys: string[];
}

/** A request the host sends through the port. */
export type HostRequest = LoadRequest | GetRequest;

/** Why a request could not be served. */
export type HostErrorCode = 'invalid' | 'unreadable' | 'no-input' | 'no-output';

/** What a failed request is answered with. */
export interface HostError {
  code: HostErrorCode;
  /** One sentence, in English. */
  message: string;
  /**
   * What the schema found, as `'chem.ocl.id /idCode: must be string'`.
   * @default undefined
   */
  errors?: string[];
}

/** Which item an input took. */
export interface UsedItem {
  key: string;
  kind: string;
}

/** The answer to one request, carrying its `id`. */
export type ResultMessage =
  | { type: 'result'; id: string; ok: true; used: UsedItem[] }
  | { type: 'result'; id: string; ok: false; error: HostError };

/**
 * Read a message that arrived through the port.
 *
 * Anything that is not a well-formed `load` or `get` is `null`, and goes
 * unanswered: an unknown request is a newer host talking, not an error. An item
 * without a string `kind` is dropped, and a label is cut to
 * {@link MAX_LABEL_LENGTH}.
 * @param data - What the port delivered.
 * @returns The request, or `null`.
 */
export function parseRequest(data: unknown): HostRequest | null {
  if (!isRecord(data) || typeof data.id !== 'string') return null;
  if (data.type === 'load') {
    if (typeof data.document !== 'string' || !Array.isArray(data.items)) {
      return null;
    }
    return {
      type: 'load',
      id: data.id,
      document: data.document,
      items: readItems(data.items),
    };
  }
  if (data.type === 'get') {
    return { type: 'get', id: data.id, keys: readStrings(data.keys) };
  }
  return null;
}

/**
 * Whether a window message is the host's answer to `hello`, in this version.
 * @param data - What the window delivered.
 * @returns `true` for a `connect` of {@link PROTOCOL_VERSION}.
 */
export function isConnect(data: unknown): boolean {
  return (
    isRecord(data) &&
    data.type === CONNECT_TYPE &&
    data.version === PROTOCOL_VERSION
  );
}

function readItems(values: readonly unknown[]): HostItem[] {
  const items: HostItem[] = [];
  const count = Math.min(values.length, MAX_ITEMS);
  for (let index = 0; index < count; index++) {
    const value = values[index];
    if (!isRecord(value) || typeof value.kind !== 'string') continue;
    const item: HostItem = { kind: value.kind, value: value.value };
    if (typeof value.id === 'string') item.id = value.id;
    if (typeof value.key === 'string') item.key = value.key;
    if (typeof value.label === 'string') {
      item.label = value.label.slice(0, MAX_LABEL_LENGTH);
    }
    items.push(item);
  }
  return items;
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const strings: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') strings.push(entry);
  }
  return strings;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
