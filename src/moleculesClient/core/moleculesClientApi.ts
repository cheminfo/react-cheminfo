import type {
  ImportStarted,
  ImportState,
  LookupResponse,
  MoleculeInput,
  PurgeResponse,
  RetryDetails,
  SubmitResponse,
} from './moleculesTypes.ts';

/** How a client reaches molecules.cheminfo.org, and how hard it insists. */
export interface MoleculesClientOptions {
  /** Where molecules.cheminfo.org answers, e.g. `https://molecules.cheminfo.org`. */
  baseUrl: string;
  /** The token issued for the source the client writes for. */
  token: string;
  /**
   * How long one request may keep being retried while the server is busy or
   * unreachable, in milliseconds.
   * @default 1_800_000 - half an hour
   */
  maxRetryMs?: number;
  /**
   * The first pause before a retry; each next one doubles, up to `maxDelayMs`.
   * @default 1000
   */
  initialDelayMs?: number;
  /**
   * The longest pause between two attempts, a `Retry-After` included.
   * @default 60_000
   */
  maxDelayMs?: number;
  /**
   * How long one attempt may take before it is given up and retried.
   * @default 600_000
   */
  requestTimeoutMs?: number;
  /**
   * Stops every request, and every pause between two attempts.
   * @default undefined - nothing stops them
   */
  signal?: AbortSignal;
  /**
   * Told about every retry, e.g. to log it.
   * @default undefined - retries are silent
   */
  onRetry?: (details: RetryDetails) => void;
  /**
   * The fetch to use, for tests.
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;
  /**
   * A number from 0 to 1 that spreads the pauses, so clients that failed
   * together do not all come back at the same instant.
   * @default an unseeded `XSadd`
   */
  random?: () => number;
}

/** The routes a source writes through on molecules.cheminfo.org. */
export interface MoleculesClient {
  /** Take the source's next import key: the start of a full import. */
  startImport: () => Promise<ImportStarted>;
  /** Where the source's import stands. */
  importState: () => Promise<ImportState>;
  /**
   * Send up to 1000 molecules for the source, under its current import key.
   * @param molecules - Each with its identifier and exactly one notation.
   * @param options - Whether every answer carries the molecule's properties.
   * @param options.returnInfo - Ask for them; `false` by default.
   */
  submit: (
    molecules: MoleculeInput[],
    options?: { returnInfo?: boolean },
  ) => Promise<SubmitResponse>;
  /**
   * Compute up to 1000 molecules without storing anything, for a source
   * molecules.cheminfo.org imports itself.
   * @param queries - The structures, all in one notation.
   * @param kind - The notation.
   */
  lookup: (
    queries: string[],
    kind: 'smiles' | 'molfile' | 'idCode',
  ) => Promise<LookupResponse>;
  /**
   * Remove the entries an import did not send again.
   * @param importKey - The key the import took.
   * @param options - Only count, or remove even more than half.
   * @param options.dryRun - Only count; `false` by default.
   * @param options.force - Remove even when that is more than half; `false` by
   * default.
   */
  purge: (
    importKey: number,
    options?: { dryRun?: boolean; force?: boolean },
  ) => Promise<PurgeResponse>;
}

/** A request molecules.cheminfo.org refused, or that kept failing. */
export class MoleculesError extends Error {
  /** The status answered, or 0 when nothing was. */
  readonly status: number;
  /** What the server said, as text. */
  readonly body: string;

  /**
   * A failed request, with what the server answered.
   * @param message - What failed, and why.
   * @param status - The status answered, or 0 when nothing was.
   * @param body - What the server said.
   */
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'MoleculesError';
    this.status = status;
    this.body = body;
  }
}
