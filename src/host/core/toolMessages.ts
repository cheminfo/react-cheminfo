/**
 * What a framed tool sends its host, read as the untrusted input it is: the
 * `hello` it posts to the window, and on the port the `result` of each request
 * and the `output` it sends when a value the host takes back changes.
 *
 * Anything that is not well formed is `null` and is ignored, as a tool ignores
 * a request it does not know: a newer tool talking, not an error.
 */

import {
  MAX_LABEL_LENGTH,
  isRecord,
  readItems,
  readStrings,
} from './messageValues.ts';
import type {
  HelloMessage,
  HostError,
  HostErrorCode,
  OutputMessage,
  ResultMessage,
  ToolInput,
  ToolOutput,
  UsedItem,
} from './protocol.ts';
import { HELLO_TYPE, PROTOCOL_VERSION } from './protocol.ts';

/** What a tool says of itself in `hello`. */
export type ToolHello = HelloMessage['tool'];

/** How long the sentence of an error may be, in characters; the rest is cut. */
const MAX_MESSAGE_LENGTH = 500;

const ERROR_CODES: readonly HostErrorCode[] = [
  'invalid',
  'unreadable',
  'no-input',
  'no-output',
];

/**
 * Read a tool's `hello`, in this version of the protocol.
 * @param data - What the window delivered.
 * @returns What the tool takes and gives, or `null` for anything else.
 */
export function readHello(data: unknown): ToolHello | null {
  if (
    !isRecord(data) ||
    data.type !== HELLO_TYPE ||
    data.version !== PROTOCOL_VERSION
  ) {
    return null;
  }
  const { tool } = data;
  if (
    !isRecord(tool) ||
    typeof tool.name !== 'string' ||
    typeof tool.origin !== 'string'
  ) {
    return null;
  }
  return {
    name: tool.name.slice(0, MAX_LABEL_LENGTH),
    origin: tool.origin,
    build: tool.build ?? null,
    inputs: readInputs(tool.inputs),
    outputs: readOutputs(tool.outputs),
  };
}

/**
 * Read a message a tool sent through the port.
 * @param data - What the port delivered.
 * @returns The `result` or the `output`, or `null` for anything else.
 */
export function readToolMessage(
  data: unknown,
): ResultMessage | OutputMessage | null {
  if (!isRecord(data)) return null;
  if (data.type === 'output') {
    if (typeof data.document !== 'string' || !Array.isArray(data.items)) {
      return null;
    }
    return {
      type: 'output',
      document: data.document,
      items: readItems(data.items),
    };
  }
  if (data.type !== 'result') return null;
  const { id, ok, items, used, error } = data;
  if (typeof id !== 'string') return null;
  if (ok === true) {
    return Array.isArray(items)
      ? { type: 'result', id, ok: true, items: readItems(items) }
      : { type: 'result', id, ok: true, used: readUsed(used) };
  }
  return { type: 'result', id, ok: false, error: readError(error) };
}

function readInputs(value: unknown): ToolInput[] {
  const inputs: ToolInput[] = [];
  if (!Array.isArray(value)) return inputs;
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.key !== 'string') continue;
    const input: ToolInput = {
      key: entry.key,
      kinds: readStrings(entry.kinds),
    };
    if (entry.many === true) input.many = true;
    if (entry.optional === true) input.optional = true;
    inputs.push(input);
  }
  return inputs;
}

function readOutputs(value: unknown): ToolOutput[] {
  const outputs: ToolOutput[] = [];
  if (!Array.isArray(value)) return outputs;
  for (const entry of value) {
    if (
      isRecord(entry) &&
      typeof entry.key === 'string' &&
      typeof entry.kind === 'string'
    ) {
      outputs.push({ key: entry.key, kind: entry.kind });
    }
  }
  return outputs;
}

function readUsed(value: unknown): UsedItem[] {
  const used: UsedItem[] = [];
  if (!Array.isArray(value)) return used;
  for (const entry of value) {
    if (
      isRecord(entry) &&
      typeof entry.key === 'string' &&
      typeof entry.kind === 'string'
    ) {
      used.push({ key: entry.key, kind: entry.kind });
    }
  }
  return used;
}

function readError(value: unknown): HostError {
  const error: HostError = {
    code: 'invalid',
    message: 'The tool refused the request and gave no reason.',
  };
  if (!isRecord(value)) return error;
  const code = ERROR_CODES.find((known) => known === value.code);
  if (code !== undefined) error.code = code;
  if (typeof value.message === 'string' && value.message.trim() !== '') {
    error.message = value.message.slice(0, MAX_MESSAGE_LENGTH);
  }
  if (Array.isArray(value.errors)) error.errors = readStrings(value.errors);
  return error;
}
