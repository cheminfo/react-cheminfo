import { useEffect, useState } from 'react';

/**
 * A debounced echo of a fast-changing value.
 *
 * The returned value only catches up once the source has been still for
 * `delayMs`, so a memo, a request or a canvas redraw downstream runs when the
 * user pauses instead of on every keystroke or slider step.
 * @param value - The live value to follow.
 * @param delayMs - Quiet period, in milliseconds, before the value settles. Defaults to `250`.
 * @returns The value as it stood `delayMs` after the last change.
 */
export function useDebouncedValue<TValue>(
  value: TValue,
  delayMs = 250,
): TValue {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(handle);
    };
  }, [value, delayMs]);

  return debounced;
}
