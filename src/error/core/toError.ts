/**
 * Turn whatever was thrown into an `Error`.
 *
 * A `throw` is not required to carry an `Error` — a rejected fetch, a worker
 * message or a library can throw a string, an object or `undefined` — and the
 * page still has to name what happened. A thrown object reads as its JSON
 * rather than as `[object Object]`.
 * @param thrown - The value that was thrown or rejected with.
 * @returns The value itself when it is an error, otherwise one describing it.
 */
export function toError(thrown: unknown): Error {
  if (thrown instanceof Error) return thrown;
  if (typeof thrown === 'string' && thrown !== '') return new Error(thrown);
  return new Error(describe(thrown));
}

/**
 * The sentence to show for whatever was thrown.
 * @param thrown - The value that was thrown or rejected with.
 * @returns The message of {@link toError}'s error.
 */
export function errorMessage(thrown: unknown): string {
  return toError(thrown).message;
}

const UNPRINTABLE = 'an unprintable value was thrown';

function describe(thrown: unknown): string {
  if (thrown === null) return 'null was thrown';
  if (thrown === undefined) return 'undefined was thrown';
  if (
    typeof thrown === 'number' ||
    typeof thrown === 'boolean' ||
    typeof thrown === 'bigint'
  ) {
    return String(thrown);
  }
  try {
    return JSON.stringify(thrown) ?? UNPRINTABLE;
  } catch {
    return UNPRINTABLE;
  }
}
