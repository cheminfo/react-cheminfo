/**
 * The camera of the canvas as something a site can keep: the one a link
 * carried, applied to the first molecule framed, and every move the reader
 * makes afterwards, reported once it has come to rest.
 *
 * The camera is never controlled. It belongs to whoever is dragging it, so the
 * site is told where it went rather than asked where it should be — anything
 * else fights the trackball.
 */

import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { Molecule3DCamera } from '../core/camera.ts';
import { formatMolecule3DCamera } from '../core/camera.ts';

import type { Molecule3DViewer } from './viewer.ts';

/** How long the camera must be still before a move is reported, milliseconds. */
export const DEFAULT_CAMERA_SETTLE_DELAY = 400;

/** What {@link useSharedCamera} is given. */
export interface SharedCameraOptions {
  /** The element molstar draws in, or `null` before it exists. */
  container: HTMLElement | null;
  /** The viewer mounted in it. */
  viewerRef: RefObject<Molecule3DViewer | null>;
  /** Where the camera stands when the first molecule is framed. */
  initialCamera: Molecule3DCamera | null;
  /** Called once a move of the reader's has come to rest. */
  onCameraChange?: (camera: Molecule3DCamera) => void;
  /** Whether the model is turning, which suspends reporting. */
  spinning: boolean;
  /** How long the camera must be still before a move is reported. */
  settleDelay: number;
}

/**
 * What {@link useSharedCamera} answers. The same object on every render: the
 * draw effect keys on it, and a fresh one would tear the scene down and build
 * it again — which makes molstar frame the model afresh and loses the camera a
 * link had just restored.
 */
export interface SharedCamera {
  /**
   * The camera a link carried, answered once and then never again — the next
   * molecule is framed the way the viewer frames any other.
   * @returns The camera to stand at, or `null` to frame the molecule.
   */
  takeLinkedCamera: () => Molecule3DCamera | null;
  /** Note a move of the reader's, which is what starts reporting. */
  noteMove: () => void;
}

/**
 * Keep the camera of one canvas in step with the site that shows it.
 * @param options - See {@link SharedCameraOptions}.
 * @returns See {@link SharedCamera}.
 */
export function useSharedCamera(options: SharedCameraOptions): SharedCamera {
  const { container, viewerRef, settleDelay } = options;
  // Spent on the first molecule framed.
  const linkedRef = useRef(false);
  // What the last report said, so the settling of a move we ordered ourselves
  // is not handed back to the site as a move the reader made.
  const reportedRef = useRef<string | null>(null);
  // Whether the reader has touched the canvas, which is what starts reporting.
  const movedRef = useRef(false);
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  const noteMove = useCallback(() => {
    movedRef.current = true;
  }, []);

  const takeLinkedCamera = useCallback(() => {
    if (linkedRef.current) return null;
    linkedRef.current = true;
    const camera = latest.current.initialCamera;
    if (camera !== null) reportedRef.current = formatMolecule3DCamera(camera);
    return camera;
  }, []);

  // Reporting waits for a first gesture. The camera also drifts on its own — a
  // surface added after the model was framed grows the scene, and the same
  // camera then reads as slightly closer — and a view nobody chose is not one
  // to hand back to the site, let alone to put in a link.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (container === null || viewer === null) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    container.addEventListener('pointerdown', noteMove);
    container.addEventListener('wheel', noteMove, { passive: true });
    const stopWatching = viewer.watchCamera((camera) => {
      if (camera === null) return;
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const current = latest.current;
        if (current.spinning || !movedRef.current) return;
        const text = formatMolecule3DCamera(camera);
        if (text === reportedRef.current) return;
        reportedRef.current = text;
        current.onCameraChange?.(camera);
      }, settleDelay);
    });
    return () => {
      if (timer !== null) clearTimeout(timer);
      container.removeEventListener('pointerdown', noteMove);
      container.removeEventListener('wheel', noteMove);
      stopWatching();
    };
  }, [container, viewerRef, settleDelay, noteMove]);

  return useMemo(
    () => ({ takeLinkedCamera, noteMove }),
    [takeLinkedCamera, noteMove],
  );
}
