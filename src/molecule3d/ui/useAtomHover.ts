/**
 * The atom under the pointer of a viewer, reported to the page that asks for
 * it.
 */

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import type { AtomReference } from '../core/measurement.ts';

import type { Molecule3DViewer } from './viewer.ts';

/**
 * Call `onAtomHover` with the atom under the pointer for as long as the viewer
 * lives. A page that passes no callback costs the viewer no subscription.
 * @param container - The element the viewer draws in; a new one is a new viewer.
 * @param viewerRef - The viewer, `null` while there is none.
 * @param onAtomHover - Called with the atom, or `null` once the pointer leaves
 * the atoms.
 */
export function useAtomHover(
  container: HTMLElement | null,
  viewerRef: RefObject<Molecule3DViewer | null>,
  onAtomHover: ((atom: AtomReference | null) => void) | undefined,
): void {
  const latest = useRef(onAtomHover);
  useEffect(() => {
    latest.current = onAtomHover;
  });
  const listening = onAtomHover !== undefined;
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!listening || viewer === null) return;
    return viewer.watchHoverAtom((atom) => {
      latest.current?.(atom);
    });
  }, [container, viewerRef, listening]);
}
