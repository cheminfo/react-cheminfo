/**
 * The translucent molecular surface drawn over the model. A second
 * representation of the very structure the model is drawn from, with its own
 * state-tree ref so it can be added, restyled and removed on its own.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params.js';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';
import type { StateTransformer } from 'molstar/lib/mol-state/index.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import { DEFAULT_MOLECULE_3D_SETTINGS } from '../core/settings.ts';

import {
  POLARITY_COLOR_THEME,
  registerPolarityTheme,
} from './polarityColorTheme.ts';
import { MOLECULE_STRUCTURE_REF, moleculeStructure } from './renderMolecule.ts';
import type { SurfaceStyle } from './viewerTypes.ts';

/** The surface node, replaced in place whenever the style changes. */
const SURFACE_REF = 'molecule3d-surface';

/**
 * Add or restyle the molecular surface.
 * @param plugin - The molstar context.
 * @param style - See {@link SurfaceStyle}.
 * @returns Nothing; resolves once the surface is on screen.
 * @throws {Error} When no molecule is loaded — a surface needs atoms to wrap.
 */
export async function renderSurface(
  plugin: PluginContext,
  style: SurfaceStyle = {},
): Promise<void> {
  const defaults = DEFAULT_MOLECULE_3D_SETTINGS;
  const {
    probeRadius = defaults.probeRadius,
    alpha = defaults.surfaceAlpha,
    coloring = defaults.surfaceColoring,
    color = defaults.surfaceColor,
  } = style;
  const structure = moleculeStructure(plugin);
  if (structure === undefined) {
    throw new Error('A molecular surface needs a molecule to wrap.');
  }
  const typeParams = { probeRadius, alpha };
  let params: StateTransformer.Params<StructureRepresentation3D>;
  if (coloring === 'element') {
    params = createStructureRepresentationParams(plugin, structure, {
      type: 'molecular-surface',
      typeParams,
      color: 'element-symbol',
      colorParams: { carbonColor: { name: 'element-symbol', params: {} } },
    });
  } else {
    params = createStructureRepresentationParams(plugin, structure, {
      type: 'molecular-surface',
      typeParams,
      color: 'uniform',
      colorParams: { value: Color.fromHexStyle(color) },
    });
    if (coloring === 'polarity') {
      registerPolarityTheme(
        plugin.representation.structure.themes.colorThemeRegistry,
      );
      params = {
        ...params,
        colorTheme: { name: POLARITY_COLOR_THEME, params: {} },
      };
    }
  }
  await plugin
    .build()
    .to(MOLECULE_STRUCTURE_REF)
    .applyOrUpdate(SURFACE_REF, StructureRepresentation3D, params)
    .commit();
}

/**
 * Remove the molecular surface, leaving the model in place.
 * @param plugin - The molstar context.
 * @returns Nothing; resolves once the surface is gone.
 */
export async function clearSurface(plugin: PluginContext): Promise<void> {
  if (!plugin.state.data.cells.has(SURFACE_REF)) return;
  await plugin.build().delete(SURFACE_REF).commit();
}
