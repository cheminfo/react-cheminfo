import type { ShareParamCodec } from './params.ts';
import type { UrlPreference } from './preferences.ts';

/**
 * A preference mirrored in the address, kept in one of the site's signals —
 * or anything with a writable `value`.
 * @param codec - How the value is read from a link and written back.
 * @param cell - Where the value is kept; read for `get`.
 * @param cell.value - The value in force.
 * @param set - How a value a link carries is stored, when it takes more than
 * writing the cell (clamping it, writing a neighbour).
 * @default set writes `cell.value`
 * @returns The preference, for the site's `UrlPreferences`.
 */
export function signalPreference<Value>(
  codec: ShareParamCodec<Value>,
  cell: { value: Value },
  set?: (value: Value) => void,
): UrlPreference<Value> {
  return {
    codec,
    get: () => cell.value,
    set:
      set ??
      ((value) => {
        cell.value = value;
      }),
  };
}
