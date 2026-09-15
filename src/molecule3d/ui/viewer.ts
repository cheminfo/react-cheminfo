/**
 * Lifecycle of one molstar molecule viewer.
 *
 * `createMolecule3DViewer` is **synchronous** on purpose. React 19 runs an
 * effect, its cleanup and the effect again on every mount in development, so an
 * awaited constructor hands the cleanup nothing to dispose and leaks a WebGL
 * context per mount. Returning the handle immediately means `dispose()` can
 * always be called; the work is queued behind `ready`.
 *
 * molstar's own UI is not mounted: every control is the component's.
 */

import { PluginViewModel } from 'molstar/lib/extensions/plugin/view-model.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
// Lowercased on import: it is a factory, not a constructor.
import { DefaultPluginSpec as defaultPluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import type { ImageSize } from '../core/exportImage.ts';
import type { Measurement, MeasurementKind } from '../core/measurement.ts';
import type { Molecule3DFile } from '../core/settings.ts';

import {
  DEFAULT_CAMERA_DURATION,
  DEFAULT_SPIN_SPEED,
  resetCamera,
  setSpin,
} from './camera.ts';
import {
  MeasurementPicker,
  clearMeasurements,
  renderMeasurements,
} from './measurements.ts';
import { clearMolecule, renderMolecule } from './renderMolecule.ts';
import { clearSurface, renderSurface } from './renderSurface.ts';
import type {
  Molecule3DViewerOptions,
  MoleculeStyle,
  SurfaceStyle,
} from './viewerTypes.ts';

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

/**
 * One molstar canvas, and every operation the component performs on it. Every
 * method resolves to nothing once `dispose` has been called.
 */
export class Molecule3DViewer {
  readonly #model: PluginViewModel;
  #picker: MeasurementPicker | undefined;
  #disposed = false;

  /** Resolves once the canvas exists; every method awaits it internally. */
  readonly ready: Promise<void>;

  /**
   * Mount the canvas and start initialising the plugin.
   * @param container - A positioned element.
   * @param options - See {@link Molecule3DViewerOptions}.
   */
  constructor(container: HTMLElement, options: Molecule3DViewerOptions = {}) {
    const {
      background = '#ffffff', // tokens-ok: a WebGL clear colour
      onMeasure = ignore,
    } = options;
    const spec = defaultPluginSpec();
    this.#model = new PluginViewModel({
      spec: {
        ...spec,
        canvas3d: {
          ...spec.canvas3d,
          renderer: { backgroundColor: Color.fromHexStyle(background) },
          camera: { helper: { axes: { name: 'off', params: {} } } },
        },
      },
    });
    this.#model.mount(container);
    this.ready = this.#model.initialized;
    // Registered before any `#run`, so the picker exists by the time one runs.
    this.ready.then(() => {
      if (this.#disposed) return;
      this.#picker = new MeasurementPicker(this.#model.plugin, onMeasure);
    }, ignore);
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
    return this.#run((plugin) => renderMeasurements(plugin, measurements));
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
    return this.#run(async (plugin) => {
      const helper = plugin.helpers.viewportScreenshot;
      if (helper === undefined) {
        throw new Error('This viewer cannot take a picture of its scene.');
      }
      helper.behaviors.values.next({
        ...helper.values,
        resolution: { name: 'custom', params: size },
        axes: { name: 'off', params: {} },
        transparent: false,
      });
      return helper.getImageDataUri();
    });
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
    if (this.#disposed) return;
    this.#model.plugin.handleResize();
  }

  /** Tear the viewer down and release its WebGL context. Idempotent. */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#picker?.dispose();
    void this.ready
      .catch(() => undefined)
      .then(() => {
        this.#model.plugin.dispose();
      });
  }

  async #run<Result>(
    action: (plugin: PluginContext) => Result | Promise<Result>,
  ): Promise<Result | undefined> {
    if (this.#disposed) return undefined;
    await this.ready;
    if (this.#disposed) return undefined;
    try {
      return await action(this.#model.plugin);
    } catch (error) {
      if (this.#disposed) return undefined;
      throw error;
    }
  }
}

function ignore(): void {
  // Nothing to do.
}
