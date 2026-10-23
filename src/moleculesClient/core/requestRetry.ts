import { toError } from '../../error/core/toError.ts';

/**
 * The pieces of a request that is tried again: its deadline, the pause the
 * server asks for, what an error answer says, and what a failed fetch says.
 * Browser-safe: no Node module is read.
 */

/**
 * The signal one attempt runs under: the caller's, and its own deadline.
 * @param signal - The caller's, if any.
 * @param timeoutMs - How long the attempt may take.
 * @returns The signal.
 */
export function requestSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
}

/**
 * How long a `Retry-After` header asks to wait.
 * @param header - Its value: seconds, or an HTTP date.
 * @param now - The current instant, in epoch milliseconds.
 * @returns The pause in milliseconds, or `undefined` when there is none to read.
 */
export function retryAfter(
  header: string | null,
  now: number,
): number | undefined {
  if (header === null || header.trim() === '') return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

/**
 * The message of an error body Fastify wrote, or the body itself.
 * @param text - The body.
 * @returns The message, or `undefined` when the body is empty.
 */
export function messageOf(text: string): string | undefined {
  if (text.trim() === '') return undefined;
  try {
    const body = JSON.parse(text) as { message?: unknown } | null;
    if (typeof body?.message === 'string') return body.message;
  } catch {
    return text.slice(0, 500);
  }
  return text.slice(0, 500);
}

/**
 * What a failed fetch says, its cause included: undici reports a refused
 * connection as `fetch failed` with the reason in `cause` — and when several
 * addresses were tried, in the first error of an AggregateError whose own
 * message is empty.
 * @param error - What was thrown.
 * @returns The message, e.g. `fetch failed: connect ECONNREFUSED 127.0.0.1:11980`.
 */
export function causeOf(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const { cause, message } = error;
  if (!(cause instanceof Error)) return message;
  const first: unknown =
    cause instanceof AggregateError ? cause.errors[0] : undefined;
  const code = (cause as { code?: unknown }).code;
  const detail =
    cause.message ||
    (first instanceof Error ? first.message : '') ||
    (typeof code === 'string' ? code : '') ||
    cause.name;
  return `${message}: ${detail}`;
}

/**
 * A request body gzipped, as HTTP's `Content-Encoding: gzip` carries it: a
 * batch of molfiles shrinks several times over.
 * @param text - The body, written out.
 * @returns The gzipped bytes.
 */
export async function gzipBody(text: string): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Wait, unless the signal stops the wait first.
 * @param milliseconds - How long.
 * @param signal - What stops it, if anything.
 * @returns When the time has passed.
 * @throws {unknown} The signal's reason, when it aborts first.
 */
export function pause(
  milliseconds: number,
  signal: AbortSignal | undefined,
): Promise<void> {
  return new Promise((done, fail) => {
    if (signal?.aborted) {
      fail(toError(signal.reason));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      fail(toError(signal?.reason));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      done();
    }, milliseconds);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
