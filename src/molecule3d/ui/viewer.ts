/**
 * Lifecycle of one molstar molecule viewer: `createMolecule3DViewer` builds
 * one, and every operation a component performs on it is a method here.
 *
 * The constructor returns before the canvas exists — see `createViewer.ts` —
 * so every method queues its work behind `ready` and resolves to nothing once
 * the viewer has been disposed. molstar's own UI is not mounted: every control
 * is the component's.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import {
  DEFAULT_CAMERA_DURATION,
  DEFAULT_SPIN_SPEED,
  MeasurementPicker,
  MolstarPlugin,
  captureScene,
  clearMeasurements,
  renderMeasurements,
  setSpin,
} from '../../molstar/core/index.ts';
import type { Molecule3DCamera } from '../core/camera.ts';
import type { ImageSize } from '../core/exportImage.ts';
import type { Measurement, MeasurementKind } from '../core/measurement.ts';
import type { Molecule3DFile } from '../core/settings.ts';

import { applyCamera, resetCamera, watchCamera } from './camera.ts';
import {
  clearMolecule,
  moleculeStructure,
  renderMolecule,
} from './renderMolecule.ts';
import { clearSurface, renderSurface } from './renderSurface.ts';
import type {
  Molecule3DViewerOptions,
  MoleculeStyle,
  SurfaceStyle,
} from './viewerTypes.ts';

/**
 * One molstar canvas, and every operation the component performs on it. Every
 * method resolves to nothing once `dispose` has been called.
 */
export class Molecule3DViewer {
  readonly #plugin: MolstarPlugin;
  #picker: MeasurementPicker | undefined;

  /** Resolves once the canvas exists; every method awaits it internally. */
  readonly ready: Promise<void>;

  /**
   * Mount the canvas and start initialising the plugin.
   * @param container - A positioned element.
   * @param options - See {@link Molecule3DViewerOptions}.
   */
  constructor(container: HTMLElement, options: Molecule3DViewerOptions = {}) {
    const { background, onMeasure = ignore } = options;
    this.#plugin = new MolstarPlugin(container, { background });
    this.ready = this.#plugin.ready;
    // Registered before any `#run`, so the picker exists by the time one runs.
    void this.#plugin
      .run((plugin) => {
        this.#picker = new MeasurementPicker(
          plugin,
          onMeasure,
          moleculeStructure,
        );
      })
      .catch(ignore);
  }

  /**
   * Replace the displayed molecule, clearing any surface and measurement.
   * @param molfile - Molfile text plus format id.
   * @param style - See {@link MoleculeStyle}.
   * @returns Nothing; resolves once the model is on screen.
   * @throws {Error} When the file parses to zero atoms.
   */
  showMolecule(molfile: Molecule3DFile, style?: MoleculeStyle): Promise<void> {
    return this.#run(async (plugin) => {
      await clearMeasurements(plugin);
      await renderMolecule(plugin, molfile, style);
    });
  }

  /**
   * Empty the scene: the model, its surface and its measurements all go.
   * @returns Nothing; resolves once the scene is empty.
   */
  hideMolecule(): Promise<void> {
    return this.#run(async (plugin) => {
      await clearMeasurements(plugin);
      await clearMolecule(plugin);
    });
  }

  /**
   * Add or restyle the molecular surface over the current molecule.
   * @param style - See {@link SurfaceStyle}.
   * @returns Nothing; resolves once the surface is on screen.
   */
  showSurface(style?: SurfaceStyle): Promise<void> {
    return this.#run((plugin) => renderSurface(plugin, style));
  }

  /**
   * Remove the molecular surface, leaving the model in place.
   * @returns Nothing; resolves once the surface is gone.
   */
  hideSurface(): Promise<void> {
    return this.#run((plugin) => clearSurface(plugin));
  }

  /**
   * Draw exactly these measurements over the current molecule.
   * @param measurements - Replaces whatever is drawn.
   * @returns Nothing; resolves once the labels are on screen.
   */
  showMeasurements(measurements: readonly Measurement[]): Promise<void> {
    return this.#run((plugin) =>
      renderMeasurements(plugin, measurements, moleculeStructure),
    );
  }

  /**
   * Make clicks on atoms build a measurement, or give them back to the camera.
   * @param kind - The measurement to build, or `null`.
   * @returns Nothing; resolves once the plugin has switched mode.
   */
  setMeasureKind(kind: MeasurementKind | null): Promise<void> {
    return this.#run(() => {
      this.#picker?.setKind(kind);
    });
  }

  /**
   * Render the scene off screen at a given size, without the selection
   * highlights or the axes.
   * @param size - Pixel size of the picture.
   * @returns The PNG as a data URI; `undefined` once the viewer is disposed.
   * @throws {Error} When the plugin has no screenshot helper.
   */
  captureImage(size: ImageSize): Promise<string | undefined> {
    return this.#run((plugin) => captureScene(plugin, size));
  }

  /**
   * Frame everything on screen.
   * @param durationMilliseconds - Transition length; 0 jumps.
   * @param fromFront - Look down -z with y up instead of keeping the direction.
   * @returns Nothing; resolves once the move has been ordered.
   */
  resetCamera(
    durationMilliseconds = DEFAULT_CAMERA_DURATION,
    fromFront = false,
  ): Promise<void> {
    return this.#run((plugin) => {
      resetCamera(plugin, durationMilliseconds, fromFront);
    });
  }

  /**
   * Put the camera where a link says it stood.
   * @param camera - Where to stand.
   * @param durationMilliseconds - Transition length; 0 jumps.
   * @returns Nothing; resolves once the move has been ordered.
   */
  setCamera(camera: Molecule3DCamera, durationMilliseconds = 0): Promise<void> {
    return this.#run((plugin) => {
      applyCamera(plugin, camera, durationMilliseconds);
    });
  }

  /**
   * Follow the camera, however it moves.
   * @param listener - Called after every move.
   * @returns A function that stops calling the listener; safe to call before
   * the canvas exists.
   */
  watchCamera(listener: (camera: Molecule3DCamera | null) => void): () => void {
    return this.#plugin.subscribe((plugin) => watchCamera(plugin, listener));
  }

  /**
   * Turn the automatic spin on or off.
   * @param spinning - Whether the scene should keep turning.
   * @param speed - Turn rate, in molstar's own spin unit.
   * @returns Nothing; resolves once the trackball has been reconfigured.
   */
  setSpin(spinning: boolean, speed = DEFAULT_SPIN_SPEED): Promise<void> {
    return this.#run((plugin) => {
      setSpin(plugin, spinning, speed);
    });
  }

  /** Re-read the container's size. Call from a `ResizeObserver`. */
  handleResize(): void {
    this.#plugin.handleResize();
  }

  /** Tear the viewer down and release its WebGL context. Idempotent. */
  dispose(): void {
    this.#picker?.dispose();
    this.#plugin.dispose();
  }

  #run<Result>(
    action: (plugin: PluginContext) => Result | Promise<Result>,
  ): Promise<Result | undefined> {
    return this.#plugin.run(action);
  }
}

function ignore(): void {
  // Nothing to do.
}
