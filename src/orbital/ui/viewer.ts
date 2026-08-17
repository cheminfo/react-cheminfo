/**
 * Lifecycle of one molstar canvas, and the only object the components hold on
 * to.
 *
 * `createOrbitalViewer` is **synchronous** on purpose. React 19 runs an effect,
 * its cleanup and the effect again on every mount in development, so an
 * `await`ed constructor hands the cleanup nothing to dispose and leaks a WebGL
 * context per mount — browsers drop the oldest one after about sixteen, and the
 * viewer silently goes blank. Returning the handle immediately means
 * `dispose()` can always be called, even before initialisation has finished;
 * the work is queued behind `ready`.
 *
 * molstar's own UI is not mounted: the surrounding site owns every control.
 */

import { PluginViewModel } from 'molstar/lib/extensions/plugin/view-model.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
// Lowercased on import: it is a factory, not a constructor.
import { DefaultPluginSpec as defaultPluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import type { OrbitalGrid } from '../core/grid.ts';
import type { OrbitalContour } from '../core/isovalue.ts';

import { DEFAULT_CAMERA_DURATION, frameOrbital, setSpin } from './camera.ts';
import type { VolumeStyle } from './renderVolume.ts';
import { clearSampledVolume, renderSampledVolume } from './renderVolume.ts';

/** Settings fixed for the life of a viewer. */
export interface OrbitalViewerOptions {
  /**
   * Scene background, as `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
}

/**
 * Create a viewer inside `container` and start initialising it.
 * @param container - An element with `position: relative`; molstar inserts its
 * own canvas into it.
 * @param options - See {@link OrbitalViewerOptions}.
 * @returns A handle that is safe to dispose immediately.
 */
export function createOrbitalViewer(
  container: HTMLElement,
  options: OrbitalViewerOptions = {},
): OrbitalViewer {
  return new OrbitalViewer(container, options);
}

/**
 * One molstar canvas showing one atomic orbital.
 *
 * Every method resolves to nothing once `dispose` has been called, so a
 * render started by an unmounting component cannot throw into React.
 */
export class OrbitalViewer {
  readonly #model: PluginViewModel;
  #disposed = false;

  /** Resolves once the canvas exists; every method awaits it internally. */
  readonly ready: Promise<void>;

  constructor(container: HTMLElement, options: OrbitalViewerOptions = {}) {
    const { background = '#ffffff' } = options;
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
  }

  /**
   * Whether `dispose` has been called.
   * @returns True once the viewer has been disposed.
   */
  get disposed(): boolean {
    return this.#disposed;
  }

  /**
   * Replace the isosurface pair with one drawn from a sampled field.
   * @param field - The sampled wavefunction, in ångström.
   * @param contour - The isovalue and reach measured on that field.
   * @param style - See {@link VolumeStyle}.
   * @returns How far the drawn surface reaches, in scene units, for the camera
   * to frame; `undefined` once the viewer has been disposed.
   */
  showOrbital(
    field: OrbitalGrid,
    contour: OrbitalContour,
    style?: VolumeStyle,
  ): Promise<number | undefined> {
    return this.#run((plugin) =>
      renderSampledVolume(plugin, field, contour, style),
    );
  }

  /**
   * Remove the isosurface pair.
   * @returns Nothing, once the surfaces are gone.
   */
  hideOrbital(): Promise<void> {
    return this.#run((plugin) => {
      clearSampledVolume(plugin);
    });
  }

  /**
   * Frame the scene from an oblique angle with z up — how a lone atom's
   * orbital has to be seen for its lobes to be told apart.
   * @param orbitalRadius - Extent of the drawn surface; the scene's own
   * bounding sphere is used when omitted.
   * @param durationMs - Transition length; 0 jumps.
   * @returns Nothing, once the camera has been set.
   */
  frame(
    orbitalRadius?: number,
    durationMs = DEFAULT_CAMERA_DURATION,
  ): Promise<void> {
    return this.#run((plugin) => {
      frameOrbital(plugin, orbitalRadius, durationMs);
    });
  }

  /**
   * Turn the automatic spin on or off.
   * @param spinning - Whether the scene should keep turning.
   * @param speed - molstar's own spin unit.
   * @returns Nothing, once the spin has been switched.
   */
  setSpin(spinning: boolean, speed = 1): Promise<void> {
    return this.#run((plugin) => {
      setSpin(plugin, spinning, speed);
    });
  }

  /** Re-read the container's size. Call from a `ResizeObserver`. */
  handleResize(): void {
    if (this.#disposed) return;
    this.#model.plugin.handleResize();
  }

  /**
   * Tear the viewer down and release its WebGL context. Idempotent, and safe to
   * call before initialisation has finished.
   */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    // `mount` creates the canvas synchronously, so the WebGL context exists
    // even when initialisation went on to fail; releasing it is what stops the
    // browser dropping an older viewer's context. A rejected `ready` must not
    // escape here either — nobody is left to handle it.
    void this.ready
      .catch(() => undefined)
      .then(() => {
        this.#model.plugin.dispose();
      });
  }

  /**
   * Wait for initialisation, then run `action` on the plugin. Resolves to
   * `undefined` when the viewer was disposed, before the call or while `action`
   * was still running; an initialisation failure still reaches the caller.
   * @param action - What to run once the canvas is ready.
   * @returns What `action` returned, or `undefined` when disposed.
   */
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
