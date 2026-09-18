/**
 * Keeping one molstar canvas showing what the props describe: the model, its
 * surface, its measurements, and where the camera stands over them.
 *
 * The draw is coalesced into one animation frame, so dragging a slider costs
 * one rebuild rather than one per pixel, and the camera is framed only when the
 * molecule is new — a restyle that snapped the view back would undo the
 * reader's orientation.
 */

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import type { Molecule3DCamera } from '../core/camera.ts';
import type { Measurement } from '../core/measurement.ts';
import type { Molecule3DFile, Molecule3DSettings } from '../core/settings.ts';

import { drawScene } from './drawScene.ts';
import type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';
import {
  DEFAULT_CAMERA_SETTLE_DELAY,
  useSharedCamera,
} from './useSharedCamera.ts';
import type { Molecule3DViewer } from './viewer.ts';

/** What {@link useMoleculeScene} is given. */
export interface MoleculeSceneOptions {
  /** The element molstar draws in, or `null` before it exists. */
  container: HTMLElement | null;
  /** The viewer mounted in it. */
  viewerRef: RefObject<Molecule3DViewer | null>;
  /** What to draw, or `null` to empty the scene. */
  molfile: Molecule3DFile | null;
  /** How the camera meets a molecule it has not seen before. */
  frameNewMolecule: 'front' | 'keep';
  /** How the model is drawn. */
  settings: Molecule3DSettings;
  /** What is drawn over it. */
  measurements: readonly Measurement[];
  /** Whether the model is turning on its own. */
  spinning: boolean;
  /** Called with a drawing failure, and with `null` once a draw succeeds. */
  onFailureChange: (message: string | null) => void;
  /** Where the camera stands when the first molecule is framed, and who to tell. */
  camera: Pick<
    MoleculeViewer3DProps,
    'cameraSettleDelay' | 'initialCamera' | 'onCameraChange'
  >;
}

/** What {@link useMoleculeScene} answers. */
export interface MoleculeScene {
  /** Frame everything on screen again, as the toolbar's reset button does. */
  resetView: () => void;
}

/**
 * Draw the scene the options describe, and keep it drawn.
 * @param options - See {@link MoleculeSceneOptions}.
 * @returns See {@link MoleculeScene}.
 */
export function useMoleculeScene(options: MoleculeSceneOptions): MoleculeScene {
  const {
    container,
    viewerRef,
    molfile,
    frameNewMolecule,
    settings,
    measurements,
    spinning,
    onFailureChange,
    camera: cameraProps,
  } = options;
  const framedRef = useRef<{
    molfile: Molecule3DFile;
    viewer: Molecule3DViewer;
  } | null>(null);
  const reportFailure = useRef(onFailureChange);
  useEffect(() => {
    reportFailure.current = onFailureChange;
  });

  const camera = useSharedCamera({
    container,
    viewerRef,
    spinning,
    initialCamera: cameraProps.initialCamera ?? null,
    onCameraChange: cameraProps.onCameraChange,
    settleDelay: cameraProps.cameraSettleDelay ?? DEFAULT_CAMERA_SETTLE_DELAY,
  });

  useEffect(() => {
    const viewer = viewerRef.current;
    if (container === null || viewer === null) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      const framed = framedRef.current;
      const isNew =
        molfile !== null &&
        (framed?.molfile !== molfile || framed.viewer !== viewer);
      framedRef.current = molfile === null ? null : { molfile, viewer };
      // The link's camera is spent on the first molecule framed; afterwards the
      // camera is the reader's and a new molecule is framed as usual.
      const linked: Molecule3DCamera | null = isNew
        ? camera.takeLinkedCamera()
        : null;
      const frameCamera = isNew && linked === null ? frameNewMolecule : 'none';
      void drawScene(viewer, molfile, settings, measurements, frameCamera)
        .then(() => {
          if (cancelled) return;
          if (linked !== null) void viewer.setCamera(linked);
          reportFailure.current(null);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          reportFailure.current(
            error instanceof Error ? error.message : String(error),
          );
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [
    container,
    viewerRef,
    molfile,
    frameNewMolecule,
    settings,
    measurements,
    camera,
  ]);

  const resetView = useCallback(() => {
    camera.noteMove();
    void viewerRef.current?.resetCamera();
  }, [camera, viewerRef]);

  return { resetView };
}
