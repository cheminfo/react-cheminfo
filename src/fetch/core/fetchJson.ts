/**
 * One JSON request to one of our backends, and its refusal as an error a page
 * can show.
 *
 * Our backends are Fastify, and a refusal comes back as `{ statusCode, error,
 * message }`: the message is written for the reader, so it is what the error
 * says. Nothing here needs more than `fetch`, so it runs in a page, a worker
 * and Node alike.
 */

import { ApiError } from './apiError.ts';

/**
 * Ask a backend one question and read its JSON answer.
 *
 * A refusal rejects with an {@link ApiError} carrying the server's own words
 * and its status; a server that cannot be reached rejects with one of status
 * 0. An abort is passed on untouched, so a caller tells "nobody asked any
 * more" from a failure by the signal it aborted. A `204`, or an empty body,
 * answers `undefined`.
 * @param url - The address, absolute or relative to the page.
 * @param options - The request, plus a `json` body and the `fetch` to use.
 * @returns The parsed answer.
 * @throws {ApiError} When the server refuses, cannot be reached, or answers
 * something that is not JSON.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { json, fetch: send = globalThis.fetch, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (json !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const body = json === undefined ? init.body : JSON.stringify(json);

  let response: Response;
  try {
    response = await send(url, { ...init, headers, body });
  } catch (error) {
    if (init.signal?.aborted === true) throw error;
    throw new ApiError('the server could not be reached', {
      status: 0,
      error: 'Network Error',
      cause: error,
    });
  }
  if (!response.ok) throw await readApiError(response);

  const text = await response.text();
  if (response.status === 204 || text === '') return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new ApiError('the server answered with something that is not JSON', {
      status: response.status,
      body: text,
      cause: error,
    });
  }
}

/**
 * The error a refusal stands for, in the server's words when it gave any: the
 * `message` of a Fastify envelope, else a FastAPI `detail`, else the status.
 * @param response - The response that was not ok.
 * @returns The error, its body read.
 */
export async function readApiError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    const text = await response.text();
    body = text === '' ? undefined : parseOrKeep(text);
  } catch {
    body = undefined;
  }
  const envelope = isRecord(body) ? body : {};
  const status =
    typeof envelope.statusCode === 'number'
      ? envelope.statusCode
      : response.status;
  const error =
    typeof envelope.error === 'string' ? envelope.error : response.statusText;
  return new ApiError(refusalMessage(envelope, response), {
    status,
    error,
    body,
  });
}

/** What {@link fetchJson} is handed: a `fetch` request, and two additions. */
export interface FetchJsonOptions extends RequestInit {
  /**
   * A value sent as the JSON body, with its content type; it replaces `body`.
   * @default undefined — the request carries `body`, if any
   */
  json?: unknown;
  /**
   * The `fetch` to call: a session's own, which signs the request, or a
   * stand-in in a test.
   * @default globalThis.fetch
   */
  fetch?: typeof globalThis.fetch;
}

function refusalMessage(
  envelope: Record<string, unknown>,
  response: Response,
): string {
  const { message, detail } = envelope;
  if (typeof message === 'string' && message !== '') return message;
  if (typeof detail === 'string' && detail !== '') return detail;
  const text = response.statusText === '' ? '' : ` ${response.statusText}`;
  return `the server answered ${response.status}${text}`;
}

function parseOrKeep(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
