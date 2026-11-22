/**
 * The translucent molecular surface drawn over the model. A second
 * representation of the very structure the model is drawn from, with its own
 * state-tree ref so it can be added, restyled and removed on its own.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';

import type { SurfaceStyle } from '../../molstar/core/index.ts';
import { surfaceRepresentationParams } from '../../molstar/core/index.ts';

import { MOLECULE_STRUCTURE_REF, moleculeStructure } from './renderMolecule.ts';

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
  const structure = moleculeStructure(plugin);
  if (structure === undefined) {
    throw new Error('A molecular surface needs a molecule to wrap.');
  }
  const params = surfaceRepresentationParams(plugin, structure, style);
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
