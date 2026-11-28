import { useEffect, useState } from 'react';

/**
 * Count the times the window comes back into focus, so a list kept in the
 * browser is read again: another tab may have changed it meanwhile.
 * @returns How many times the window has been focused since the component
 * mounted.
 */
export function useFocusCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    function handleFocus(): void {
      setCount((previous) => previous + 1);
    }
    globalThis.addEventListener('focus', handleFocus);
    return () => {
      globalThis.removeEventListener('focus', handleFocus);
    };
  }, []);
  return count;
}
