/** The bounds a number read from the environment must keep. */
export interface ReadEnvNumberOptions {
  /**
   * The smallest value accepted.
   * @default undefined - no lower bound
   */
  min?: number;
  /**
   * The largest value accepted.
   * @default undefined - no upper bound
   */
  max?: number;
  /**
   * Whether the value must be a whole number.
   * @default false
   */
  integer?: boolean;
}

/**
 * Read a number from the environment.
 *
 * The compose files forward every variable as `${NAME:-}`, so a deployment that
 * sets nothing hands the process an empty string rather than no variable — and
 * `Number('')` is 0, which turned an indexer's interval into a busy loop. Unset,
 * empty and blank all mean the fallback here. A value that says something but is
 * not an accepted number refuses to start rather than running on a guess.
 * @param env - The environment, e.g. `process.env`.
 * @param name - The variable, e.g. `INDEX_INTERVAL`.
 * @param fallback - The value when the variable says nothing.
 * @param options - The bounds the value must keep.
 * @returns The number written, or the fallback.
 * @throws {Error} When the value is not a finite number, or breaks a bound.
 */
export function readEnvNumber(
  env: Readonly<Record<string, string | undefined>>,
  name: string,
  fallback: number,
  options: ReadEnvNumberOptions = {},
): number {
  const text = env[name]?.trim();
  if (!text) return fallback;
  const value = Number(text);
  const { min, max, integer = false } = options;
  if (
    !Number.isFinite(value) ||
    (integer && !Number.isInteger(value)) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  ) {
    throw new Error(`${name} must be ${expected(options)}, not "${text}".`);
  }
  return value;
}

function expected(options: ReadEnvNumberOptions): string {
  const { min, max, integer = false } = options;
  const kind = integer ? 'an integer' : 'a number';
  if (min !== undefined && max !== undefined) {
    return `${kind} from ${min} to ${max}`;
  }
  if (min !== undefined) return `${kind} of at least ${min}`;
  if (max !== undefined) return `${kind} of at most ${max}`;
  return kind;
}
