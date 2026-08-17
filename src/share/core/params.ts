/**
 * Reads one of a tool's own parameters out of a link and writes it back.
 *
 * `parse` is handed the raw value, or `null` when the link does not carry the
 * key at all, and always answers: anything absent or malformed falls back to
 * the default. `serialize` answers `null` for a value that is already the
 * default, which deletes the key rather than writing it, so an unconfigured
 * link stays a plain link.
 */
export interface ShareParamCodec<Value> {
  /**
   * Read the value a link carries.
   * @param raw - The raw parameter, `null` when the link omits it.
   * @returns The value, or the default when it is absent or malformed.
   */
  parse(raw: string | null): Value;
  /**
   * Write the value into a link.
   * @param value - The value to write.
   * @returns The raw parameter, or `null` to delete the key.
   */
  serialize(value: Value): string | null;
}

/** What {@link booleanParam} is configured with. */
export interface BooleanParamOptions {
  /**
   * The value an absent parameter reads as, and the one deleted rather than
   * written.
   * @default false
   */
  default?: boolean;
}

/**
 * A flag a link switches on by naming it. `?flag`, `?flag=` and `?flag=1` all
 * read as on, because these addresses are retyped by hand out of a course
 * page; only `0` and `false` read as off.
 * @param options - The value the flag takes when the link says nothing.
 * @returns The codec.
 */
export function booleanParam(
  options: BooleanParamOptions = {},
): ShareParamCodec<boolean> {
  const { default: fallback = false } = options;
  return {
    parse(raw) {
      if (raw === null) return fallback;
      const text = raw.trim().toLowerCase();
      return text !== '0' && text !== 'false';
    },
    serialize(value) {
      if (value === fallback) return null;
      return value ? '1' : '0';
    },
  };
}

/** What {@link integerParam} is configured with. */
export interface IntegerParamOptions<Fallback extends number | null> {
  /** The smallest value a link may ask for. */
  min: number;
  /** The largest value a link may ask for, so a link cannot hang the page. */
  max: number;
  /**
   * The value an absent or malformed parameter falls back to, and the one
   * deleted rather than written. `null` means the tool has no value of its own
   * until a link names one.
   */
  default: Fallback;
}

/**
 * A whole number a link carries, rounded and clamped to the range the tool can
 * actually serve. A value outside the range is brought back inside it rather
 * than rejected: a link written when the maximum was higher must still open.
 * @param options - The range and the default.
 * @returns The codec.
 */
export function integerParam<Fallback extends number | null>(
  options: IntegerParamOptions<Fallback>,
): ShareParamCodec<number | Fallback> {
  const { min, max, default: fallback } = options;
  return {
    parse(raw) {
      if (raw === null) return fallback;
      const text = raw.trim();
      if (text === '') return fallback;
      const parsed = Number(text);
      if (Number.isNaN(parsed)) return fallback;
      return clamp(parsed, min, max);
    },
    serialize(value) {
      if (typeof value !== 'number' || value === fallback) return null;
      return String(clamp(value, min, max));
    },
  };
}

/** What {@link stringParam} is configured with. */
export interface StringParamOptions {
  /**
   * The value an absent parameter reads as, and the one deleted rather than
   * written.
   * @default ''
   */
  default?: string;
  /**
   * The longest value accepted; anything beyond it is cut, so a link cannot
   * hand the tool a megabyte of text.
   * @default undefined
   */
  maxLength?: number;
}

/**
 * A free-text parameter, taken as written. The value is not trimmed: a
 * leading space can be part of what the tool is showing.
 * @param options - The default and the length limit.
 * @returns The codec.
 */
export function stringParam(
  options: StringParamOptions = {},
): ShareParamCodec<string> {
  const { default: fallback = '', maxLength } = options;
  return {
    parse(raw) {
      if (raw === null) return fallback;
      return cut(raw, maxLength);
    },
    serialize(value) {
      const text = cut(value, maxLength);
      return text === fallback ? null : text;
    },
  };
}

/**
 * One of a fixed set of names — a difficulty, a display mode, a format.
 * A name the tool does not know falls back rather than throwing, so a link
 * written before the set changed still opens.
 * @param values - Every name the tool understands.
 * @param fallback - The name an absent or unknown parameter reads as.
 * @returns The codec.
 */
export function enumParam<Value extends string>(
  values: readonly Value[],
  fallback: Value,
): ShareParamCodec<Value> {
  return {
    parse(raw) {
      if (raw === null) return fallback;
      const text = raw.trim();
      for (const value of values) {
        if (value === text) return value;
      }
      return fallback;
    },
    serialize(value) {
      if (value === fallback) return null;
      for (const candidate of values) {
        if (candidate === value) return value;
      }
      return null;
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function cut(value: string, maxLength: number | undefined): string {
  if (maxLength === undefined || value.length <= maxLength) return value;
  return value.slice(0, maxLength);
}
