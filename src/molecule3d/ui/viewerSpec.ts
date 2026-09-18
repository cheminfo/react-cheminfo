/**
 * How the molecule viewer configures molstar: the plugin spec it mounts with.
 *
 * molstar's own UI is not mounted — every control is the component's — and the
 * axes helper is off, since a molecule is read from its own shape rather than
 * from the world axes.
 */

import { PluginViewModel } from 'molstar/lib/extensions/plugin/view-model.js';
// Lowercased on import: it is a factory, not a constructor.
import { DefaultPluginSpec as defaultPluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

/**
 * Build a view model for one canvas and mount it.
 * @param container - A positioned element; molstar inserts its canvas into it.
 * @param background - Scene background as `#rrggbb`; a WebGL clear colour, so
 * it cannot be a CSS custom property.
 * @returns The mounted view model, still initialising.
 */
export function mountMolecule3DPlugin(
  container: HTMLElement,
  background: string,
): PluginViewModel {
  const spec = defaultPluginSpec();
  const model = new PluginViewModel({
    spec: {
      ...spec,
      canvas3d: {
        ...spec.canvas3d,
        renderer: { backgroundColor: Color.fromHexStyle(background) },
        camera: { helper: { axes: { name: 'off', params: {} } } },
      },
    },
  });
  model.mount(container);
  return model;
}
