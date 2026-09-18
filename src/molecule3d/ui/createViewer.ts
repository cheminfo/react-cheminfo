/**
 * How a molecule viewer comes into being, and why it does so synchronously.
 *
 * React 19 runs an effect, its cleanup and the effect again on every mount in
 * development, so an awaited constructor hands the cleanup nothing to dispose
 * and leaks a WebGL context per mount. Returning the handle immediately means
 * `dispose()` can always be called; the work is queued behind `ready`.
 */

import { Molecule3DViewer } from './viewer.ts';
import type { Molecule3DViewerOptions } from './viewerTypes.ts';

/**
 * Create a viewer inside `container` and start initialising it.
 * @param container - A positioned element; molstar inserts its canvas into it.
 * @param options - See {@link Molecule3DViewerOptions}.
 * @returns A handle that is safe to dispose immediately.
 */
export function createMolecule3DViewer(
  container: HTMLElement,
  options: Molecule3DViewerOptions = {},
): Molecule3DViewer {
  return new Molecule3DViewer(container, options);
}
