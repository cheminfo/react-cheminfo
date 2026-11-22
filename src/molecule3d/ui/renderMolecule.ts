/**
 * The 3D model of one molecule, built from an in-memory molfile.
 *
 * The whole molecule hangs off a single data node, and the drawn model hangs
 * off the structure under it with a fixed ref of its own, so a surface can
 * attach to the same atoms and loading another molecule deletes the subtree —
 * surface included.
 */

import type { Structure } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { StructureFromModel } from 'molstar/lib/mol-plugin-state/transforms/model.js';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';

import type { MoleculeStyle } from '../../molstar/core/index.ts';
import { modelRepresentationParams } from '../../molstar/core/index.ts';
import type { Molecule3DFile } from '../core/file.ts';

/** State-tree ref of the structure every representation hangs off. */
export const MOLECULE_STRUCTURE_REF = 'molecule3d-structure';

/** Root of the molecule subtree: deleting it removes model and surface. */
const MOLECULE_DATA_REF = 'molecule3d-data';

/** The drawn model, replaced in place whenever the style changes. */
export const MODEL_REPRESENTATION_REF = 'molecule3d-model';

/**
 * Replace the displayed molecule. Everything already on screen goes first.
 * @param plugin - The molstar context.
 * @param molfile - Molfile text plus the format id.
 * @param style - See {@link MoleculeStyle}.
 * @returns How many frames the file holds, the first of which is on screen.
 * @throws {Error} When the file parses to zero atoms. molstar's `mol` parser returns
 * exactly that on a V3000 file, with no error, so without this check the viewer
 * would show an empty scene and report nothing.
 */
export async function renderMolecule(
  plugin: PluginContext,
  molfile: Molecule3DFile,
  style: MoleculeStyle = {},
): Promise<number> {
  await clearMolecule(plugin);
  const data = await plugin.builders.data.rawData(
    { data: molfile.data },
    { ref: MOLECULE_DATA_REF, state: { isGhost: true } },
  );
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    molfile.format,
  );
  const model = await plugin.builders.structure.createModel(trajectory);
  const atomCount = model.data?.atomicHierarchy.atoms._rowCount ?? 0;
  if (atomCount === 0) {
    await clearMolecule(plugin);
    throw new Error(
      `molstar parsed 0 atoms from this ${molfile.format} file without reporting an error; a V3000 molfile must be parsed as "sdf".`,
    );
  }
  await plugin
    .build()
    .to(model)
    .apply(StructureFromModel, undefined, { ref: MOLECULE_STRUCTURE_REF })
    .commit();
  const structure = moleculeStructure(plugin);
  if (structure === undefined) {
    throw new Error('molstar built no structure from this molfile.');
  }
  await plugin
    .build()
    .to(MOLECULE_STRUCTURE_REF)
    .applyOrUpdate(
      MODEL_REPRESENTATION_REF,
      StructureRepresentation3D,
      modelRepresentationParams(plugin, structure, style),
    )
    .commit();
  return trajectory.data?.frameCount ?? 1;
}

/**
 * Remove the molecule, and with it any surface drawn on the same atoms.
 * @param plugin - The molstar context.
 * @returns Nothing; resolves once the scene is empty.
 */
export async function clearMolecule(plugin: PluginContext): Promise<void> {
  if (!plugin.state.data.cells.has(MOLECULE_DATA_REF)) return;
  await plugin.build().delete(MOLECULE_DATA_REF).commit();
}

/**
 * The atoms currently on screen, for anything that draws on top of them.
 * @param plugin - The molstar context.
 * @returns The loaded structure, or `undefined` when no molecule is displayed.
 */
export function moleculeStructure(
  plugin: PluginContext,
): Structure | undefined {
  const object = plugin.state.data.cells.get(MOLECULE_STRUCTURE_REF)?.obj;
  if (!PluginStateObject.Molecule.Structure.is(object)) return undefined;
  return object.data;
}
