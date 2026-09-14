import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A value a parent may own or leave to the component: when `value` is given
 * it wins and changes are only reported; when it is not, the component keeps
 * its own copy, starting from `initial`.
 * @param value - The parent's value, or `undefined` to leave it uncontrolled.
 * @param initial - Starting value of the component's own copy.
 * @param onChange - Called with every change, controlled or not.
 * @returns The current value and a setter.
 */
export function useControlledState<T>(
  value: T | undefined,
  initial: T | (() => T),
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [own, setOwn] = useState(initial);
  const controlled = value !== undefined;
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const set = useCallback(
    (next: T) => {
      if (!controlled) setOwn(() => next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [controlled ? value : own, set];
}
