import type { ShareParamCodec } from './params.ts';

/** What {@link keySetParam} is configured with. */
export interface KeySetParamOptions<Key extends string> {
  /**
   * The word an empty set is written as. An empty value is dropped from the
   * address, so a link switching every key off has to say so in a word.
   * @default 'none'
   */
  none?: string;
  /**
   * The set a link carrying nothing stands for, and the one deleted rather
   * than written. `null` means the link then says nothing about the keys, so
   * whatever the visitor stored is left alone.
   * @default null
   */
  default?: readonly Key[] | null;
  /**
   * The set deleted from a link rather than written, when it is not the
   * default — a site whose absent parameter leaves the visitor's stored keys
   * alone, and whose own initial keys must not grow a plain visit a query
   * string.
   * @default the default set
   */
  omitted?: readonly Key[];
}

/**
 * A set of keys a link switches on — the layers a figure draws,
 * `?flags=breakdown,working` — written comma separated, in the order the keys
 * are listed, so one selection always produces one link.
 *
 * A key the tool does not list is dropped rather than refused, so a link
 * written before a key was renamed still opens; the word for nothing, `none`
 * by default, reads as the empty set, and an absent or empty parameter as the
 * default.
 * @param keys - Every key the tool understands, in the order links write them.
 * @param options - The word for nothing, and the default set.
 * @returns The codec.
 */
export function keySetParam<Key extends string>(
  keys: readonly Key[],
  options: KeySetParamOptions<Key> = {},
): ShareParamCodec<ReadonlySet<Key> | null> {
  const none = options.none ?? 'none';
  const fallback =
    options.default === undefined || options.default === null
      ? null
      : orderKeys(new Set<string>(options.default), keys);
  const omitted =
    options.omitted === undefined
      ? fallback
      : orderKeys(new Set<string>(options.omitted), keys);
  const omittedText = omitted === null ? null : writeKeys(omitted, keys);
  return {
    parse(raw) {
      if (raw === null || raw.trim() === '') return fallback;
      if (raw.trim() === none) return new Set<Key>();
      const asked = new Set<string>();
      for (const name of raw.split(',')) asked.add(name.trim());
      return orderKeys(asked, keys);
    },
    serialize(value) {
      if (value === null) return null;
      const text = writeKeys(value, keys);
      if (text === omittedText) return null;
      return text === '' ? none : text;
    },
  };
}

function orderKeys<Key extends string>(
  asked: ReadonlySet<string>,
  keys: readonly Key[],
): ReadonlySet<Key> {
  const ordered = new Set<Key>();
  for (const key of keys) {
    if (asked.has(key)) ordered.add(key);
  }
  return ordered;
}

function writeKeys<Key extends string>(
  value: ReadonlySet<Key>,
  keys: readonly Key[],
): string {
  const on: string[] = [];
  for (const key of keys) {
    if (value.has(key)) on.push(key);
  }
  return on.join(',');
}
