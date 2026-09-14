import type { Measurement } from '../core/measurement.ts';
import type { Molecule3DFile, Molecule3DSettings } from '../core/settings.ts';
import { normalizeMolecule3DSettings } from '../core/settings.ts';

import type { Molecule3DViewer } from './viewer.ts';

/**
 * Draw the scene. `showMolecule` empties it, so the surface and the
 * measurements are added after the model, and the camera is framed last.
 * @param viewer - The viewer holding the canvas.
 * @param molfile - What to draw, or `null` to empty the scene.
 * @param settings - How to draw it.
 * @param measurements - What to draw over it.
 * @param frameCamera - Whether to frame the camera once everything is there.
 * @returns Nothing; resolves once the scene is complete.
 */
export async function drawScene(
  viewer: Molecule3DViewer,
  molfile: Molecule3DFile | null,
  settings: Molecule3DSettings,
  measurements: readonly Measurement[],
  frameCamera: boolean,
): Promise<void> {
  if (molfile === null) {
    await viewer.hideMolecule();
    return;
  }
  const safe = normalizeMolecule3DSettings(settings);
  await viewer.showMolecule(molfile, {
    representation: safe.representation,
    sizeFactor: safe.sizeFactor,
  });
  if (safe.showSurface) {
    await viewer.showSurface({
      alpha: safe.surfaceAlpha,
      probeRadius: safe.probeRadius,
      coloring: safe.surfaceColoring,
      color: safe.surfaceColor,
    });
  }
  await viewer.showMeasurements(measurements);
  if (frameCamera) await viewer.resetCamera();
}
