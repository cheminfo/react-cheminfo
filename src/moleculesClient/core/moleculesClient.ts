import { XSadd } from 'ml-xsadd';

import { trimTrailingSlash } from '../../router/core/address.ts';

import type {
  MoleculesClient,
  MoleculesClientOptions,
} from './moleculesClientApi.ts';
import { MoleculesError } from './moleculesClientApi.ts';
import type {
  ImportStarted,
  ImportState,
  LookupResponse,
  PurgeResponse,
  SubmitResponse,
} from './moleculesTypes.ts';
import {
  causeOf,
  gzipBody,
  messageOf,
  pause,
  requestSignal,
  retryAfter,
} from './requestRetry.ts';

/** Statuses a request is tried again on: the server is busy or in between. */
const RETRIED_STATUSES = new Set([429, 502, 503, 504]);

/** The doublings of the pause, after which it stays where it is. */
const MAX_DOUBLINGS = 20;

/** One request, as it is tried again. */
interface Call {
  method: 'GET' | 'POST';
  path: string;
  payload: Uint8Array<ArrayBuffer> | undefined;
  started: number;
}

/** What one attempt came to: the answer, or why another is worth it. */
type Outcome<T> =
  | { answered: true; value: T }
  | {
      answered: false;
      status: number | undefined;
      reason: string;
      retryAfterMs: number | undefined;
    };

/**
 * A client of the routes a source writes through on molecules.cheminfo.org,
 * retrying while the server is busy (503), throttling (429), being restarted
 * (502, 504) or out of reach. Each attempt has its own deadline, the pauses
 * double with a spread and honour `Retry-After`, and bodies travel gzipped.
 * Browser-safe: it reads no Node module.
 * @param options - Where it answers, the token, and how hard to insist.
 * @returns The client.
 */
export function createMoleculesClient(
  options: MoleculesClientOptions,
): MoleculesClient {
  const {
    token,
    maxRetryMs = 1_800_000,
    initialDelayMs = 1000,
    maxDelayMs = 60_000,
    requestTimeoutMs = 600_000,
    signal,
    onRetry,
    fetch: fetchImplementation = globalThis.fetch,
    random = new XSadd().random,
  } = options;
  const baseUrl = trimTrailingSlash(options.baseUrl);

  async function attemptOnce<T>(call: Call): Promise<Outcome<T>> {
    let response: Response;
    try {
      response = await fetchImplementation(`${baseUrl}${call.path}`, {
        method: call.method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(call.payload === undefined
            ? {}
            : {
                'content-type': 'application/json',
                'content-encoding': 'gzip',
              }),
        },
        body: call.payload,
        signal: requestSignal(signal, requestTimeoutMs),
      });
      if (response.ok) {
        return { answered: true, value: (await response.json()) as T };
      }
    } catch (error: unknown) {
      if (signal?.aborted) throw signal.reason;
      return {
        answered: false,
        status: undefined,
        reason: causeOf(error),
        retryAfterMs: undefined,
      };
    }
    const text = await response.text();
    const reason = messageOf(text) ?? response.statusText;
    if (!RETRIED_STATUSES.has(response.status)) {
      throw new MoleculesError(
        `${call.method} ${call.path} answered ${response.status}: ${reason}`,
        response.status,
        text,
      );
    }
    const asked = retryAfter(response.headers.get('retry-after'), Date.now());
    return {
      answered: false,
      status: response.status,
      reason,
      retryAfterMs: asked,
    };
  }

  async function attempt<T>(call: Call, number: number): Promise<T> {
    signal?.throwIfAborted();
    const outcome = await attemptOnce<T>(call);
    if (outcome.answered) return outcome.value;
    const backoff =
      initialDelayMs *
      2 ** Math.min(number - 1, MAX_DOUBLINGS) *
      (0.5 + random() * 0.5);
    const delayMs = Math.min(maxDelayMs, outcome.retryAfterMs ?? backoff);
    const elapsed = Date.now() - call.started;
    if (elapsed + delayMs > maxRetryMs) {
      throw new MoleculesError(
        `${call.method} ${call.path} kept failing for ${Math.round(elapsed / 1000)} s: ${outcome.reason}`,
        outcome.status ?? 0,
        outcome.reason,
      );
    }
    onRetry?.({
      method: call.method,
      path: call.path,
      attempt: number,
      status: outcome.status,
      reason: outcome.reason,
      delayMs,
    });
    await pause(delayMs, signal);
    return attempt<T>(call, number + 1);
  }

  async function request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const started = Date.now();
    const payload =
      body === undefined ? undefined : await gzipBody(JSON.stringify(body));
    return attempt<T>({ method, path, payload, started }, 1);
  }

  return {
    startImport: () => request<ImportStarted>('POST', '/v1/imports'),
    importState: () => request<ImportState>('GET', '/v1/imports'),
    submit: (molecules, { returnInfo = false } = {}) =>
      request<SubmitResponse>('POST', '/v1/submit', { molecules, returnInfo }),
    lookup: (queries, kind) =>
      request<LookupResponse>('POST', '/v1/batch', { queries, kind }),
    purge: (importKey, { dryRun = false, force = false } = {}) =>
      request<PurgeResponse>('POST', `/v1/imports/${importKey}/purge`, {
        dryRun,
        force,
      }),
  };
}
