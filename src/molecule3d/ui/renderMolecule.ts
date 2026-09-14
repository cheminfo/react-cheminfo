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
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { StructureFromModel } from 'molstar/lib/mol-plugin-state/transforms/model.js';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';
import type { StateTransformer } from 'molstar/lib/mol-state/index.js';

import type { Molecule3DFile, RepresentationId } from '../core/settings.ts';

import type { MoleculeStyle } from './viewerTypes.ts';

/** State-tree ref of the structure every representation hangs off. */
export const MOLECULE_STRUCTURE_REF = 'molecule3d-structure';

/** Root of the molecule subtree: deleting it removes model and surface. */
const MOLECULE_DATA_REF = 'molecule3d-data';

/** The drawn model, replaced in place whenever the style changes. */
const MODEL_REPRESENTATION_REF = 'molecule3d-model';

/**
 * molstar's ball-and-stick radius factor that a size factor of 1 stands for:
 * thin sticks and readable balls.
 */
const NATURAL_SIZE_FACTOR = 0.25;

/** Bond radius as a fraction of the atom radius; molstar's own default. */
const BALL_AND_STICK_ASPECT_RATIO = 2 / 3;

/** Spacefill multiplies the van der Waals radius, whose honest value is 1. */
const SPACEFILL_SCALE = 4;

/** Sticks take the factor as a radius in ångström; 0.3 Å is licorice. */
const STICK_SCALE = 1.2;

/**
 * Replace the displayed molecule. Everything already on screen goes first.
 * @param plugin - The molstar context.
 * @param molfile - Molfile text plus the format id.
 * @param style - See {@link MoleculeStyle}.
 * @returns Nothing; resolves once the model is on screen.
 * @throws {Error} When the file parses to zero atoms. molstar's `mol` parser returns
 * exactly that on a V3000 file, with no error, so without this check the viewer
 * would show an empty scene and report nothing.
 */
export async function renderMolecule(
  plugin: PluginContext,
  molfile: Molecule3DFile,
  style: MoleculeStyle = {},
): Promise<void> {
  const { representation = 'ball-and-stick', sizeFactor = 1 } = style;
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
      modelParams(
        plugin,
        structure,
        representation,
        sizeFactor * NATURAL_SIZE_FACTOR,
      ),
    )
    .commit();
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

/**
 * Translate one of the three representations into molstar's own. `stick` is a
 * genuine licorice model: a uniform size theme and an aspect ratio of 1 give
 * atoms and bonds one radius, so the joints are caps of the stick's thickness.
 * @param plugin - The molstar context.
 * @param structure - The atoms to draw.
 * @param representation - Which representation.
 * @param sizeFactor - molstar's own radius factor.
 * @returns The parameters of the representation node.
 */
function modelParams(
  plugin: PluginContext,
  structure: Structure,
  representation: RepresentationId,
  sizeFactor: number,
): StateTransformer.Params<StructureRepresentation3D> {
  const color = 'element-symbol' as const;
  const colorParams = {
    carbonColor: { name: 'element-symbol', params: {} },
  } as const;
  if (representation === 'spacefill') {
    return createStructureRepresentationParams(plugin, structure, {
      type: 'spacefill',
      typeParams: { sizeFactor: sizeFactor * SPACEFILL_SCALE },
      color,
      colorParams,
    });
  }
  if (representation === 'stick') {
    return createStructureRepresentationParams(plugin, structure, {
      type: 'ball-and-stick',
      typeParams: {
        sizeFactor: sizeFactor * STICK_SCALE,
        sizeAspectRatio: 1,
        aromaticBonds: false,
      },
      color,
      colorParams,
      size: 'uniform',
      sizeParams: { value: 1 },
    });
  }
  return createStructureRepresentationParams(plugin, structure, {
    type: 'ball-and-stick',
    typeParams: {
      sizeFactor,
      sizeAspectRatio: BALL_AND_STICK_ASPECT_RATIO,
      aromaticBonds: false,
    },
    color,
    colorParams,
  });
}
