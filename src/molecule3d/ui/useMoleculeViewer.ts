/**
 * The molstar viewer of one canvas: created once its element exists, kept to
 * the element's size, and disposed with it.
 */

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import { createMolecule3DViewer } from './createViewer.ts';
import type { Molecule3DViewer } from './viewer.ts';
import type { Molecule3DViewerOptions } from './viewerTypes.ts';

/**
 * Mount a viewer in `container` for as long as it exists.
 * @param container - The element molstar draws in, or `null` before it exists.
 * @param options - Read when the viewer is created; a later change is ignored,
 * so a callback reads what it needs from a ref of its own.
 * @returns The viewer, holding `null` while there is none.
 */
export function useMoleculeViewer(
  container: HTMLElement | null,
  options: Molecule3DViewerOptions,
): RefObject<Molecule3DViewer | null> {
  const viewerRef = useRef<Molecule3DViewer | null>(null);
  const latestOptions = useRef(options);
  useEffect(() => {
    latestOptions.current = options;
  });

  useEffect(() => {
    if (container === null) return;
    const viewer = createMolecule3DViewer(container, latestOptions.current);
    viewerRef.current = viewer;
    const observer = new ResizeObserver(() => {
      viewer.handleResize();
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      viewerRef.current = null;
      viewer.dispose();
    };
  }, [container]);

  return viewerRef;
}
