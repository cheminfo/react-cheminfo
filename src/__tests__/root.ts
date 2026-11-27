import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

/** The element a test renders into, attached to the document by `mountRoot`. */
export let host: HTMLDivElement;

/** The React root over `host`, made by `mountRoot`. */
export let root: Root;

/**
 * Attach a fresh element to the document and open a React root over it, with
 * React told it runs inside `act`. Called from a test file's `beforeEach`.
 */
export function mountRoot(): void {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
}

/**
 * Open a new root over the same element, for a test that unmounted the first
 * on purpose.
 */
export function freshRoot(): void {
  root = createRoot(host);
}

/** Unmount the root and take its element out of the document. */
export function unmountRoot(): void {
  act(() => {
    root.unmount();
  });
  host.remove();
}
