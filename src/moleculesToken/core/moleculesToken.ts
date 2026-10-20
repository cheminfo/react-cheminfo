import { trimTrailingSlash } from '../../router/core/address.ts';

/**
 * What molecules.cheminfo.org says of a token a site holds:
 *
 * - `ok`: issued for a source the site writes, and not revoked;
 * - `otherSource`: valid, but issued for another source, so what the site
 *   sends is credited to that one;
 * - `refused`: never issued, or revoked;
 * - `unset`: the site holds none;
 * - `uncheckable`: molecules.cheminfo.org answers, but cannot check a token
 *   yet;
 * - `unanswered`: it did not answer, or failed.
 */
export type MoleculesTokenVerdict =
  'ok' | 'otherSource' | 'refused' | 'unset' | 'uncheckable' | 'unanswered';

/** A token a site holds, to be checked. */
export interface MoleculesTokenToCheck {
  /** The environment variable it is read from, e.g. `MOLECULES_TOKEN_LOTUS`. */
  variable: string;
  /** The token, or undefined when the variable is unset or blank. */
  token: string | undefined;
  /**
   * The sources it may have been issued for, as molecules.cheminfo.org names
   * them: any one of them is right, whatever its case.
   * @default [] — any source
   */
  sources?: readonly string[];
}

/** A token, as molecules.cheminfo.org checked it. Never the token itself. */
export interface MoleculesTokenCheck {
  /** The environment variable it is read from. */
  variable: string;
  /** The sources it may have been issued for; empty for any source. */
  sources: string[];
  /** What molecules.cheminfo.org says of it. */
  verdict: MoleculesTokenVerdict;
  /**
   * What molecules.cheminfo.org said, or why it could not be asked; null when
   * the verdict says it all.
   */
  message: string | null;
  /** The source molecules.cheminfo.org knows it for, once it answered. */
  source: string | null;
  /**
   * Its first characters, as molecules.cheminfo.org shows them: what tells two
   * tokens apart without showing either.
   */
  hint: string | null;
  /** Who it was issued to. */
  email: string | null;
  /** When it was issued, in epoch milliseconds. */
  issuedAt: number | null;
  /** When it last read or wrote, in epoch milliseconds, to within a minute. */
  lastUsedAt: number | null;
  /** When it was checked, in epoch milliseconds. */
  checkedAt: number;
}

/** Where molecules.cheminfo.org answers, and how patiently it is asked. */
export interface CheckMoleculesTokenOptions {
  /** Where it answers, e.g. `https://molecules.cheminfo.org`. */
  baseUrl: string;
  /**
   * How long one check may take.
   * @default 5000
   */
  timeoutMs?: number;
  /**
   * The fetch to use, for tests.
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;
  /**
   * The clock the checks are stamped with, for tests.
   * @default Date.now
   */
  now?: () => number;
}

/**
 * Ask molecules.cheminfo.org about a token: `GET /v1/token`, which says which
 * source it was issued for and never counts as using it. A token pasted in
 * another source's place, revoked, or never issued shows here before an import
 * sends anything with it. Never throws: a molecules.cheminfo.org that does not
 * answer is a verdict too.
 * @param entry - The token, where it is read from, and the sources it may be for.
 * @param options - Where molecules.cheminfo.org answers, and how patiently.
 * @returns What it says of the token.
 */
export async function checkMoleculesToken(
  entry: MoleculesTokenToCheck,
  options: CheckMoleculesTokenOptions,
): Promise<MoleculesTokenCheck> {
  const {
    baseUrl,
    timeoutMs = 5000,
    fetch: fetchImplementation = globalThis.fetch,
    now = Date.now,
  } = options;
  const sources = entry.sources === undefined ? [] : [...entry.sources];
  const verdict = (
    value: MoleculesTokenVerdict,
    message: string | null = null,
  ): MoleculesTokenCheck => ({
    variable: entry.variable,
    sources,
    verdict: value,
    message,
    source: null,
    hint: null,
    email: null,
    issuedAt: null,
    lastUsedAt: null,
    checkedAt: now(),
  });

  const token = entry.token?.trim();
  if (!token) return verdict('unset');

  let response: Response;
  try {
    response = await fetchImplementation(
      `${trimTrailingSlash(baseUrl)}/v1/token`,
      {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
  } catch (error: unknown) {
    return verdict('unanswered', whyUnanswered(error, timeoutMs));
  }

  if (response.status === 401) {
    return verdict('refused', await messageOf(response));
  }
  if (response.status === 404) {
    await response.body?.cancel();
    return verdict('uncheckable', 'GET /v1/token answered 404');
  }
  if (!response.ok) {
    await response.body?.cancel();
    return verdict('unanswered', `GET /v1/token answered ${response.status}`);
  }

  const record = await recordOf(response);
  if (record === null) {
    return verdict('unanswered', 'GET /v1/token answered no token');
  }
  const known = {
    source: record.source,
    hint: record.hint,
    email: record.email,
    issuedAt: record.createdAt * 1000,
    lastUsedAt: record.lastUsedAt === null ? null : record.lastUsedAt * 1000,
  };
  if (record.revokedAt !== null) {
    return { ...verdict('refused', 'this token was revoked'), ...known };
  }
  const wanted = record.source.toLowerCase();
  const expected =
    sources.length === 0 ||
    sources.some((source) => source.toLowerCase() === wanted);
  return { ...verdict(expected ? 'ok' : 'otherSource'), ...known };
}

/**
 * Check every token a site holds, all at once.
 * @param entries - The tokens. See {@link checkMoleculesToken}.
 * @param options - See {@link CheckMoleculesTokenOptions}.
 * @returns What molecules.cheminfo.org says of each, in the order given.
 */
export async function checkMoleculesTokens(
  entries: readonly MoleculesTokenToCheck[],
  options: CheckMoleculesTokenOptions,
): Promise<MoleculesTokenCheck[]> {
  return Promise.all(
    entries.map((entry) => checkMoleculesToken(entry, options)),
  );
}

/**
 * What a page anyone can open may show of a check: the verdict and the source,
 * without who the token was issued to or its first characters.
 * @param check - The check.
 * @returns The check, without them.
 */
export function publicTokenCheck(
  check: MoleculesTokenCheck,
): MoleculesTokenCheck {
  return { ...check, email: null, hint: null };
}

/** What `GET /v1/token` answers, as far as a check reads it. */
interface TokenRecord {
  source: string;
  email: string;
  hint: string;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
}

async function recordOf(response: Response): Promise<TokenRecord | null> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null) return null;
  const record = body as Partial<Record<keyof TokenRecord, unknown>>;
  if (
    typeof record.source !== 'string' ||
    typeof record.email !== 'string' ||
    typeof record.hint !== 'string' ||
    typeof record.createdAt !== 'number' ||
    !isOptionalNumber(record.lastUsedAt) ||
    !isOptionalNumber(record.revokedAt)
  ) {
    return null;
  }
  return {
    source: record.source,
    email: record.email,
    hint: record.hint,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
    revokedAt: record.revokedAt,
  };
}

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

async function messageOf(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === 'string' ? body.message : null;
  } catch {
    return null;
  }
}

function whyUnanswered(error: unknown, timeoutMs: number): string {
  if ((error as { name?: unknown } | null)?.name === 'TimeoutError') {
    return `no answer within ${timeoutMs} ms`;
  }
  return error instanceof Error ? error.message : String(error);
}
