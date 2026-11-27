/**
 * The atoms on screen.
 *
 * They arrive already expanded and already repeated over the lattice, as
 * Cartesian ångström, and go in as XYZ — the one format that carries elements
 * and coordinates and invites molstar to apply nothing of its own. They are
 * drawn as every 3D view of the family draws a molecule: the representation
 * and the sizes of the display options, and their molecular surface when it is
 * asked for.
 */

import type { Structure } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';
import type { Representation } from 'molstar/lib/mol-repr/representation.js';
import type { BallAndStickParams } from 'molstar/lib/mol-repr/structure/representation/ball-and-stick.js';
import type { ParamDefinition } from 'molstar/lib/mol-util/param-definition.js';

import type {
  MoleculeStyle,
  RepresentationParams,
  SurfaceStyle,
} from '../../molstar/core/index.ts';
import {
  modelRepresentationParams,
  surfaceRepresentationParams,
} from '../../molstar/core/index.ts';
import type { CrystalBonds } from '../core/crystalView.ts';
import { toXyzText } from '../core/structureText.ts';
import type { ViewerAtom } from '../core/types.ts';

/** How the atoms are drawn. */
export interface StructureStyle extends MoleculeStyle {
  /**
   * Which bonds the balls and sticks draw.
   * @default 'all'
   */
  bonds?: CrystalBonds;
  /**
   * The molecular surface wrapped round the atoms, or `null` for none.
   * @default null
   */
  surface?: SurfaceStyle | null;
}

/**
 * Replace the atoms on screen.
 * @param plugin - The molstar context.
 * @param atoms - The whole scene, Cartesian ångström; an empty list clears it.
 * @param style - See {@link StructureStyle}.
 * @throws {Error} When molstar parses the file to no atoms at all.
 */
export async function renderStructure(
  plugin: PluginContext,
  atoms: readonly ViewerAtom[],
  style: StructureStyle = {},
): Promise<void> {
  await clearStructure(plugin);
  if (atoms.length === 0) return;

  const data = await plugin.builders.data.rawData(
    { data: toXyzText(atoms) },
    { ref: STRUCTURE_DATA_REF, state: { isGhost: true } },
  );
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    'xyz',
  );
  const model = await plugin.builders.structure.createModel(trajectory);
  if ((model.data?.atomicHierarchy.atoms._rowCount ?? 0) !== atoms.length) {
    await clearStructure(plugin);
    throw new Error(
      `molstar read ${model.data?.atomicHierarchy.atoms._rowCount ?? 0} of the ${atoms.length} atoms it was given.`,
    );
  }
  const structure = await plugin.builders.structure.createStructure(model);
  structureRefs.set(plugin, structure.ref);
  await setStructureStyle(plugin, style);
}

/**
 * Draw the atoms on screen another way, in place: the camera, the measurements
 * and an operation half applied all stay where they are.
 * @param plugin - The molstar context.
 * @param style - See {@link StructureStyle}.
 */
export async function setStructureStyle(
  plugin: PluginContext,
  style: StructureStyle,
): Promise<void> {
  const ref = structureRefs.get(plugin);
  const structure = crystalStructure(plugin);
  if (ref === undefined || structure === undefined) return;
  const { bonds = 'all', surface = null, ...model } = style;
  const builder = plugin
    .build()
    .to(ref)
    .applyOrUpdate(
      MODEL_REF,
      StructureRepresentation3D,
      withBonds(modelRepresentationParams(plugin, structure, model), bonds),
    );
  if (surface === null) {
    if (plugin.state.data.cells.has(SURFACE_REF)) builder.delete(SURFACE_REF);
  } else {
    builder
      .to(ref)
      .applyOrUpdate(
        SURFACE_REF,
        StructureRepresentation3D,
        surfaceRepresentationParams(plugin, structure, surface),
      );
  }
  await builder.commit();
}

/**
 * The representations the atoms are drawn by — the model and its surface —
 * which is what an operation moves.
 *
 * They are resolved from the state tree rather than kept, because a rebuild
 * replaces the object behind the same address.
 * @param plugin - The molstar context.
 * @returns The representations on screen; none when nothing is drawn.
 */
export function structureRepresentations(
  plugin: PluginContext,
): Representation.Any[] {
  const representations: Representation.Any[] = [];
  for (const ref of [MODEL_REF, SURFACE_REF]) {
    const object = plugin.state.data.cells.get(ref)?.obj;
    if (PluginStateObject.Molecule.Structure.Representation3D.is(object)) {
      representations.push(object.data.repr);
    }
  }
  return representations;
}

/**
 * The structure the atoms on screen were built into, which is what a
 * measurement names its atoms in.
 * @param plugin - The molstar context.
 * @returns The structure, or `undefined` when nothing is drawn.
 */
export function crystalStructure(plugin: PluginContext): Structure | undefined {
  const ref = structureRefs.get(plugin);
  if (ref === undefined) return undefined;
  const object = plugin.state.data.cells.get(ref)?.obj;
  if (!PluginStateObject.Molecule.Structure.is(object)) return undefined;
  return object.data;
}

/**
 * The ball-and-stick parameters that draw these bonds. A metal's bonds are
 * molstar's metal coordination, which it draws dashed.
 * @param bonds - Which bonds are drawn.
 * @returns The parameters to merge into the representation's own.
 */
function bondParams(bonds: CrystalBonds): BondParams {
  return {
    visuals:
      bonds === 'none'
        ? ['element-sphere']
        : ['element-sphere', 'intra-bond', 'inter-bond'],
    excludeTypes: bonds === 'noMetal' ? ['metal-coordination'] : [],
  };
}

/**
 * Remove the atoms, leaving every drawn layer in place.
 * @param plugin - The molstar context.
 */
async function clearStructure(plugin: PluginContext): Promise<void> {
  structureRefs.delete(plugin);
  if (!plugin.state.data.cells.has(STRUCTURE_DATA_REF)) return;
  await plugin.build().delete(STRUCTURE_DATA_REF).commit();
}

/**
 * The model's parameters with these bonds; spacefill draws none to choose.
 * @param params - The family's parameters for the representation.
 * @param bonds - Which bonds are drawn.
 * @returns The parameters of the model node.
 */
function withBonds(
  params: RepresentationParams,
  bonds: CrystalBonds,
): RepresentationParams {
  if (params.type.name !== 'ball-and-stick') return params;
  return {
    ...params,
    type: {
      ...params.type,
      params: { ...params.type.params, ...bondParams(bonds) },
    },
  };
}

/** The ball-and-stick parameters that say which bonds are drawn. */
type BondParams = Pick<
  ParamDefinition.Values<BallAndStickParams>,
  'visuals' | 'excludeTypes'
>;

/** Deleting this ref deletes the model and the representations under it. */
const STRUCTURE_DATA_REF = 'crystal3d-structure-data';

/** The drawn model, replaced in place whenever the style changes. */
const MODEL_REF = 'crystal3d-model';

/** The molecular surface, added, restyled and removed on its own. */
const SURFACE_REF = 'crystal3d-surface';

/** Where the structure the atoms were built into sits, per plugin. */
const structureRefs = new WeakMap<PluginContext, string>();
