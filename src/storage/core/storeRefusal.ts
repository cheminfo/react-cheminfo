/**
 * What a browser store refuses is the browser's condition or the store's own
 * rule, never a defect of the page: a page tells the person about a refusal
 * and keeps working, and throws anything else on.
 *
 * - `unavailable`: the browser keeps nothing here — a private window, blocked
 *   storage, a sandboxed frame;
 * - `blocked`: another tab holds the database at an older version;
 * - `full`: the site's share of the disk is used up;
 * - `name`: a name a document cannot take, empty or too long;
 * - `taken`: another document goes by that name.
 */
export type StoreRefusalReason =
  'unavailable' | 'blocked' | 'full' | 'name' | 'taken';

/** A browser store's refusal, with why. */
export class StoreRefusal extends Error {
  /** Why the store refused. */
  readonly reason: StoreRefusalReason;

  /**
   * A refusal.
   * @param reason - Why.
   * @param message - What happened, in English.
   * @param options - The error the browser threw, as `cause`.
   */
  constructor(
    reason: StoreRefusalReason,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'StoreRefusal';
    this.reason = reason;
  }
}

/**
 * Whether an error a store threw is a refusal, not a defect.
 * @param error - What was thrown.
 * @returns `true` for a {@link StoreRefusal}.
 */
export function isStoreRefusal(error: unknown): error is StoreRefusal {
  return error instanceof StoreRefusal;
}

/**
 * A write to a store, the browser's refusal to make room for it named: a
 * quota used up rejects with a `full` refusal; anything else the write throws
 * is passed on as it is.
 * @param write - The write.
 * @returns What the write returns.
 */
export async function refusingWrite<TResult>(
  write: () => Promise<TResult>,
): Promise<TResult> {
  try {
    return await write();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StoreRefusal('full', error.message, { cause: error });
    }
    throw error;
  }
}
