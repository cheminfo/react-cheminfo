/**
 * A file downloaded as bytes, with its progress, an abort and a size check:
 * model weights, a database, a stack too large to read in one go. The failures
 * are typed, so a page words each its own way: the server not reached or
 * refusing (an {@link ApiError}, as `fetchJson` raises it), and the body
 * breaking off or not having the size it must have (a {@link TransferError}).
 * An abort is passed on untouched. Nothing here needs more than `fetch`, so
 * it runs in a page, a worker and Node alike.
 */

import { concatUint8Arrays } from 'uint8array-extras';

import { ApiError } from './apiError.ts';
import { readApiError } from './fetchJson.ts';

/** How far a download is. */
export interface BytesProgress {
  /** Bytes received so far. */
  received: number;
  /** Bytes to receive: the size expected, else the declared length, else `null`. */
  total: number | null;
}

/** What {@link fetchBytes} is handed: a `fetch` request, and its additions. */
export interface FetchBytesOptions extends RequestInit {
  /**
   * The exact size the body must have: it is written into one buffer of that
   * size as it arrives, and a body longer or shorter than it is refused.
   * @default undefined — any size, the chunks joined once the body has ended
   */
  expectedBytes?: number;
  /**
   * Told after every chunk.
   * @default undefined
   */
  onProgress?: (progress: BytesProgress) => void;
  /**
   * The `fetch` to call, with the address as given: a stand-in in a test.
   * @default globalThis.fetch
   */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

/** Why a body that started arriving was not taken. */
export type TransferProblem = 'interrupted' | 'size';

/** A body that broke off, or that did not have the size it had to have. */
export class TransferError extends Error {
  override name = 'TransferError';
  /** `interrupted` when the body broke off, `size` when it was longer or shorter than expected. */
  readonly problem: TransferProblem;
  /** Bytes received when it stopped. */
  readonly received: number;
  /** The size expected, or `null` when none was. */
  readonly expected: number | null;

  /**
   * Name a failed transfer.
   * @param message - What happened, written for the reader.
   * @param options - The problem, the counts and what caused it.
   */
  constructor(message: string, options: TransferErrorOptions) {
    super(message, { cause: options.cause });
    this.problem = options.problem;
    this.received = options.received;
    this.expected = options.expected ?? null;
  }
}

/** What a {@link TransferError} is built from. */
export interface TransferErrorOptions {
  /** Why the body was not taken. */
  problem: TransferProblem;
  /** Bytes received when it stopped. */
  received: number;
  /**
   * The size expected.
   * @default null
   */
  expected?: number | null;
  /**
   * What the error was raised from.
   * @default undefined
   */
  cause?: unknown;
}

/**
 * Download a file as bytes.
 * @param url - The address, absolute or relative to the page.
 * @param options - See {@link FetchBytesOptions}.
 * @returns Its bytes.
 * @throws {ApiError} Status 0 when the server cannot be reached, its status
 *   when it refuses.
 * @throws {TransferError} When the body breaks off, or has another size than
 *   `expectedBytes`.
 */
export async function fetchBytes(
  url: string,
  options: FetchBytesOptions = {},
): Promise<Uint8Array<ArrayBuffer>> {
  const { bytes } = await fetchFile(url, options);
  return bytes;
}

/** A file downloaded: its bytes, and what its server says they are. */
export interface FetchedFile {
  /** Its bytes. */
  bytes: Uint8Array<ArrayBuffer>;
  /** Its `Content-Type`, as the server wrote it; `''` when it wrote none. */
  type: string;
}

/**
 * Download a file as bytes, with the type its server gives it: a file a link
 * names, opened as if it had been dropped on the page.
 * @param url - The address, absolute or relative to the page.
 * @param options - See {@link FetchBytesOptions}.
 * @returns Its bytes and its type.
 * @throws {ApiError} Status 0 when the server cannot be reached, its status
 *   when it refuses.
 * @throws {TransferError} When the body breaks off, or has another size than
 *   `expectedBytes`.
 */
export async function fetchFile(
  url: string,
  options: FetchBytesOptions = {},
): Promise<FetchedFile> {
  const { expectedBytes, onProgress, fetch: send, ...init } = options;
  const response = await reach(url, init, send ?? globalThis.fetch);
  const type = response.headers.get('content-type') ?? '';
  const declared = Number(response.headers.get('content-length') ?? Number.NaN);
  const total = expectedBytes ?? (Number.isFinite(declared) ? declared : null);
  const body = new BodyReader(expectedBytes);
  const reader = (response.body ?? new Blob().stream()).getReader();
  try {
    for (;;) {
      // eslint-disable-next-line no-await-in-loop -- a stream is read one chunk after the other
      const { done, value } = await reader.read();
      if (done) break;
      body.take(value);
      onProgress?.({ received: body.received, total });
    }
  } catch (error) {
    if (error instanceof TransferError) {
      await reader.cancel(error);
      throw error;
    }
    if (init.signal?.aborted === true) throw error;
    throw new TransferError('the file stopped arriving before its end', {
      problem: 'interrupted',
      received: body.received,
      expected: expectedBytes ?? null,
      cause: error,
    });
  }
  return { bytes: body.end(), type };
}

async function reach(
  url: string,
  init: RequestInit,
  send: NonNullable<FetchBytesOptions['fetch']>,
): Promise<Response> {
  let response: Response;
  try {
    response = await send(url, init);
  } catch (error) {
    // fetch reports a network failure with a TypeError; an abort, or
    // anything else, is thrown on as it is.
    if (!(error instanceof TypeError) || init.signal?.aborted === true) {
      throw error;
    }
    throw new ApiError('the server could not be reached', {
      status: 0,
      error: 'Network Error',
      cause: error,
    });
  }
  if (!response.ok) throw await readApiError(response);
  return response;
}

/** The bytes of a body as they arrive, in one buffer of the expected size or in chunks. */
class BodyReader {
  readonly #expected: number | undefined;
  readonly #whole: Uint8Array<ArrayBuffer> | undefined;
  readonly #chunks: Array<Uint8Array<ArrayBuffer>> = [];
  received = 0;

  constructor(expected: number | undefined) {
    this.#expected = expected;
    this.#whole = expected === undefined ? undefined : new Uint8Array(expected);
  }

  take(chunk: Uint8Array<ArrayBuffer>): void {
    const at = this.received;
    if (this.#whole === undefined) {
      this.#chunks.push(chunk);
    } else {
      if (at + chunk.length > this.#whole.length) {
        throw this.#wrongSize(at + chunk.length);
      }
      this.#whole.set(chunk, at);
    }
    this.received = at + chunk.length;
  }

  end(): Uint8Array<ArrayBuffer> {
    if (this.#whole === undefined) return concatUint8Arrays(this.#chunks);
    if (this.received !== this.#whole.length) {
      throw this.#wrongSize(this.received);
    }
    return this.#whole;
  }

  #wrongSize(received: number): TransferError {
    return new TransferError(
      `the file has ${received < (this.#expected ?? 0) ? 'fewer' : 'more'} bytes than the ${this.#expected} expected`,
      { problem: 'size', received, expected: this.#expected ?? null },
    );
  }
}
