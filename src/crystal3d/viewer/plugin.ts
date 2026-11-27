/**
 * Lifecycle of one molstar canvas: created now, disposed whenever, every call
 * queued behind initialisation.
 *
 * The constructor is **synchronous** on purpose. React 19 runs an effect, its
 * cleanup and the effect again on every mount in development, so an `await`ed
 * constructor hands the cleanup nothing to dispose and leaks a WebGL context per
 * mount — browsers drop the oldest after about sixteen, and the viewer silently
 * goes blank. Returning the handle immediately means `dispose()` can always be
 * called, even before initialisation has finished.
 *
 * molstar's own UI is never mounted: every control is the page's.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { Molecule3DCamera } from '../../molecule3d/core/camera.ts';
import type {
  Measurement,
  MeasurementKind,
} from '../../molecule3d/core/measurement.ts';
import type { SceneCapture } from '../../molecule3d/ui/exportMoleculeImage.ts';
import { ScenePictures } from '../../molecule3d/ui/scenePictures.ts';
import {
  MeasurementPicker,
  MolstarPlugin,
  clearMeasurements,
  focusPoint,
  renderMeasurements,
  setSpin,
  subscribeHoverLabel,
} from '../../molstar/core/index.ts';
import type { ViewOrientation } from '../core/orientation.ts';
import type { Point3 } from '../core/types.ts';

import {
  DEFAULT_CAMERA_DURATION,
  applyCamera,
  readCamera,
  resetCamera,
} from './camera.ts';
import { crystalStructure } from './renderStructure.ts';

/** Settings fixed for the life of a viewer. */
export interface CrystalViewerOptions {
  /**
   * Scene background, as `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * Called with each measurement once its atoms are picked; measuring is off
   * without it.
   * @default undefined
   */
  onMeasure?: (measurement: Measurement) => void;
}

/** One molstar canvas, and the queue everything drawn on it goes through. */
export class CrystalViewerPlugin extends ScenePictures implements SceneCapture {
  readonly #plugin: MolstarPlugin;
  #picker: MeasurementPicker | undefined;

  /** Resolves once the canvas exists; every call awaits it internally. */
  readonly ready: Promise<void>;

  /**
   * Mount a canvas in `container` and start initialising it.
   * @param container - A positioned element; molstar inserts its canvas into
   * it.
   * @param options - See {@link CrystalViewerOptions}.
   */
  constructor(container: HTMLElement, options: CrystalViewerOptions = {}) {
    const plugin = new MolstarPlugin(container, {
      background: options.background,
      // Replacing a scene commits several times, and molstar's own default
      // glides the camera on each, so the structure appears to drift into
      // place. Reframing is right; animating it between two unrelated
      // structures is not.
      cameraResetDurationMilliseconds: 0,
    });
    super(plugin);
    this.#plugin = plugin;
    this.ready = this.#plugin.ready;
    const { onMeasure } = options;
    if (onMeasure !== undefined) {
      // A failed initialisation is reported by the next call the page makes.
      void this.#plugin
        .run((plugin) => {
          this.#picker = new MeasurementPicker(
            plugin,
            onMeasure,
            crystalStructure,
          );
        })
        .catch(() => undefined);
    }
  }

  /**
   * Whether {@link dispose} has been called.
   * @returns True once the viewer is disposed.
   */
  get disposed(): boolean {
    return this.#plugin.disposed;
  }

  /**
   * Wait for initialisation, then run `action` on the plugin.
   * @param action - What to do with the molstar context.
   * @returns Nothing once the viewer has been disposed — before the call or
   *   while `action` was still running. An initialisation failure, and any
   *   error `action` throws while the viewer is alive, still reach the caller.
   */
  run(action: (plugin: PluginContext) => void | Promise<void>): Promise<void> {
    return this.#plugin.run(action).then(() => undefined);
  }

  /**
   * Frame everything on screen.
   * @param durationMs - Transition length; 0 jumps.
   * @param orientation - Where to look from, from `sceneOrientation`. Left out,
   *   the camera keeps the direction it is already pointing.
   * @returns Resolves once the camera has been told where to go.
   */
  resetCamera(
    durationMs = DEFAULT_CAMERA_DURATION,
    orientation?: ViewOrientation,
  ): Promise<void> {
    return this.run((plugin) => {
      resetCamera(plugin, durationMs, orientation);
    });
  }

  /**
   * Where the camera stands, against what is drawn.
   * @returns The camera, or `null` while nothing is drawn.
   */
  async readCamera(): Promise<Molecule3DCamera | null> {
    return (await this.#plugin.run(readCamera)) ?? null;
  }

  /**
   * Put the camera back where {@link readCamera} found it.
   * @param camera - Where to stand.
   * @returns Resolves once the camera stands there.
   */
  applyCamera(camera: Molecule3DCamera): Promise<void> {
    return this.run((plugin) => {
      applyCamera(plugin, camera);
    });
  }

  /**
   * Zoom onto one point of the scene.
   * @param centre - What to frame, Cartesian ångström.
   * @param radius - Radius of the ball to fit, ångström.
   * @param durationMs - Transition length; 0 jumps.
   * @param orientation - Where to look from; the current direction when absent.
   * @returns Resolves once the camera has been told where to go.
   */
  focus(
    centre: Point3,
    radius: number,
    durationMs = DEFAULT_CAMERA_DURATION,
    orientation?: ViewOrientation,
  ): Promise<void> {
    return this.run((plugin) => {
      focusPoint(plugin, centre, radius, { durationMs, orientation });
    });
  }

  /**
   * Turn the automatic spin on or off. It moves the camera, never the object:
   * showing that a molecule maps onto itself is a different button.
   * @param spinning - Whether the scene should keep turning.
   * @param speed - molstar's own spin unit.
   * @returns Resolves once the spin is set.
   */
  setSpin(spinning: boolean, speed = 1): Promise<void> {
    return this.run((plugin) => {
      setSpin(plugin, spinning, speed);
    });
  }

  /**
   * Report what the pointer rests on, by the label its drawing carries. Every
   * axis, plane and centre is drawn with a label already — `C3 along [111]`,
   * `n glide at x = ¼` — and an atom is named `O 1`, never by the row molstar
   * parsed it from.
   * @param listener - Called with the label, or `null` over nothing.
   * @returns A function that stops the reporting; safe to call at any time.
   */
  onHover(listener: (label: string | null) => void): () => void {
    return this.#plugin.subscribe((plugin) =>
      subscribeHoverLabel(plugin, (hover) => {
        listener(hover === null ? null : hover.label);
      }),
    );
  }

  /**
   * Make clicks on atoms build a measurement, or give them back to the camera.
   * @param kind - The measurement to build, or `null`.
   * @returns Resolves once clicks build that measurement.
   */
  setMeasureKind(kind: MeasurementKind | null): Promise<void> {
    return this.run(() => {
      this.#picker?.setKind(kind);
    });
  }

  /**
   * Draw exactly these measurements over the atoms on screen.
   * @param measurements - Replaces whatever is drawn; empty clears them.
   * @returns Resolves once they are drawn.
   */
  showMeasurements(measurements: readonly Measurement[]): Promise<void> {
    return this.run(async (plugin) => {
      if (measurements.length === 0) {
        await clearMeasurements(plugin);
        return;
      }
      await renderMeasurements(plugin, measurements, crystalStructure);
    });
  }

  /** Re-read the container's size. Call from a `ResizeObserver`. */
  handleResize(): void {
    this.#plugin.handleResize();
  }

  /**
   * Tear the canvas down and release its WebGL context. Idempotent, and safe to
   * call before initialisation has finished.
   */
  dispose(): void {
    this.#picker?.dispose();
    this.#plugin.dispose();
  }
}
