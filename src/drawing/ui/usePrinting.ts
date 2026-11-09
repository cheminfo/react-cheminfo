import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

/** Whether the browser announced a print it has not finished yet. */
let announced = false;

/**
 * Whether the page is being printed: from the browser's `beforeprint` to its
 * `afterprint`, or while the print media query holds, which is how a test
 * shows the page as it prints.
 *
 * The browser lays the page out for paper as soon as `beforeprint` returns, so
 * what printing mounts is committed inside that event, not on a later frame.
 * @returns True while the page is printed.
 */
export function usePrinting(): boolean {
  return useSyncExternalStore(subscribe, isPrinting, () => false);
}

function subscribe(onChange: () => void): () => void {
  const media = globalThis.matchMedia('print');
  function onBeforePrint(): void {
    announced = true;
    flushSync(onChange);
  }
  function onAfterPrint(): void {
    announced = false;
    onChange();
  }
  globalThis.addEventListener('beforeprint', onBeforePrint);
  globalThis.addEventListener('afterprint', onAfterPrint);
  media.addEventListener('change', onChange);
  return () => {
    globalThis.removeEventListener('beforeprint', onBeforePrint);
    globalThis.removeEventListener('afterprint', onAfterPrint);
    media.removeEventListener('change', onChange);
  };
}

function isPrinting(): boolean {
  return announced || globalThis.matchMedia('print').matches;
}
