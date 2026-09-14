/**
 * The molstar plugin an orbital canvas is built on: molstar's defaults, with
 * the background set and the camera left entirely to `camera.ts`.
 */

import type { PluginSpec } from 'molstar/lib/mol-plugin/spec.js';
// Lowercased on import: it is a factory, not a constructor.
import { DefaultPluginSpec as defaultPluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

/** Settings fixed for the life of a viewer. */
export interface OrbitalViewerOptions {
  /**
   * Scene background, as `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
}

/**
 * Build the plugin spec of one orbital canvas.
 * @param options - See {@link OrbitalViewerOptions}.
 * @returns The spec `PluginViewModel` is created with.
 */
export function orbitalPluginSpec(
  options: OrbitalViewerOptions = {},
): PluginSpec {
  const { background = '#ffffff' } = options;
  const spec = defaultPluginSpec();
  return {
    ...spec,
    canvas3d: {
      ...spec.canvas3d,
      renderer: { backgroundColor: Color.fromHexStyle(background) },
      camera: {
        helper: { axes: { name: 'off', params: {} } },
        // The camera is ours alone. Molstar reframes itself whenever a scene
        // commit leaves the renderable count at zero, which is what replacing
        // one orbital by another does — the old surfaces are removed and
        // committed before the new ones exist — and it frames the whole
        // sampled box rather than the isosurface inside it, which leaves the
        // orbital a fifth of the frame wide.
        manualReset: true,
      },
    },
  };
}
