/**
 * Lifecycle of one headless molstar canvas: created now, disposed whenever,
 * every call queued behind initialisation.
 *
 * The constructor is **synchronous** on purpose. React 19 runs an effect, its
 * cleanup and the effect again on every mount in development, so an `await`ed
 * constructor hands the cleanup nothing to dispose and leaks a WebGL context
 * per mount — browsers drop the oldest after about sixteen, and the viewer
 * silently goes blank. Returning the handle immediately means `dispose()` can
 * always be called, even before initialisation has finished; the work is queued
 * behind `ready`.
 *
 * molstar's own UI is never mounted: every control on our sites is ours.
 */

import { PluginViewModel } from 'molstar/lib/extensions/plugin/view-model.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import type { PluginSpec } from 'molstar/lib/mol-plugin/spec.js';
// Lowercased on import: it is a factory, not a constructor.
import { DefaultPluginSpec as defaultPluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

/** Settings fixed for the life of a plugin. */
export interface MolstarPluginOptions {
  /**
   * Scene background, as `#rrggbb`. A WebGL clear colour, so it cannot be a CSS
   * custom property.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * How long molstar animates a reframe it decided on itself; 0 jumps.
   *
   * Replacing a scene commits several times — the old drawing is deleted, the
   * new one added — and molstar glides the camera on each, so the model appears
   * to drift into place. Reframing is right; animating it between two unrelated
   * scenes is not.
   * @default molstar's own 250 ms
   */
  cameraResetDurationMilliseconds?: number;
  /**
   * The last word on the spec, applied over everything above: a site that needs
   * a behaviour dropped, a marking colour or a renderer setting of its own
   * passes it here rather than mounting its own view model.
   */
  spec?: (spec: PluginSpec) => PluginSpec;
}

/** One molstar canvas, and the queue everything drawn on it goes through. */
export class MolstarPlugin {
  readonly #model: PluginViewModel;
  #disposed = false;

  /** Resolves once the canvas exists; every call awaits it internally. */
  readonly ready: Promise<void>;

  /**
   * Mount a canvas in `container` and start initialising it.
   * @param container - An element with `position: relative`; molstar inserts
   * its own canvas into it.
   * @param options - See {@link MolstarPluginOptions}.
   */
  constructor(container: HTMLElement, options: MolstarPluginOptions = {}) {
    const {
      background = '#ffffff', // tokens-ok: a WebGL clear colour
      cameraResetDurationMilliseconds,
      spec: refine,
    } = options;
    const base = defaultPluginSpec();
    const spec: PluginSpec = {
      ...base,
      canvas3d: {
        ...base.canvas3d,
        renderer: { backgroundColor: Color.fromHexStyle(background) },
        // A scene is read from its own shape, never from the world axes.
        camera: { helper: { axes: { name: 'off', params: {} } } },
        ...(cameraResetDurationMilliseconds === undefined
          ? {}
          : { cameraResetDurationMs: cameraResetDurationMilliseconds }),
      },
    };
    this.#model = new PluginViewModel({
      spec: refine === undefined ? spec : refine(spec),
    });
    this.#model.mount(container);
    this.ready = this.#model.initialized;
  }

  /**
   * Whether {@link dispose} has been called.
   * @returns True once the canvas has been torn down.
   */
  get disposed(): boolean {
    return this.#disposed;
  }

  /**
   * Wait for initialisation, then run `action` on the plugin.
   * @param action - What to do with the molstar context.
   * @returns What `action` returned, or `undefined` once the plugin has been
   * disposed — before the call or while `action` was still running. An
   * initialisation failure, and anything `action` throws while the plugin is
   * alive, still reach the caller.
   */
  async run<Result>(
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

  /**
   * Start a subscription once the plugin exists.
   * @param start - Subscribes, and returns its own unsubscribe function.
   * @returns A function that stops the subscription, or stops it from ever
   * starting; safe to call at any time.
   */
  subscribe(start: (plugin: PluginContext) => () => void): () => void {
    let stop: (() => void) | null = null;
    let cancelled = false;
    void this.run((plugin) => {
      if (cancelled) return;
      stop = start(plugin);
    });
    return () => {
      cancelled = true;
      stop?.();
      stop = null;
    };
  }

  /** Re-read the container's size. Call from a `ResizeObserver`. */
  handleResize(): void {
    if (this.#disposed) return;
    this.#model.plugin.handleResize();
  }

  /**
   * Tear the canvas down and release its WebGL context. Idempotent, and safe to
   * call before initialisation has finished.
   */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    // `mount` creates the canvas synchronously, so the context exists even when
    // initialisation went on to fail; releasing it is what stops the browser
    // dropping an older viewer's. A rejected `ready` must not escape here
    // either — nobody is left to handle it.
    void this.ready
      .catch(() => undefined)
      .then(() => {
        this.#model.plugin.dispose();
      });
  }
}
