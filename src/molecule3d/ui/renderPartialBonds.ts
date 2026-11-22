/**
 * The partial bonds drawn over the model: a node of the state tree hanging off
 * the structure, as the surface does.
 *
 * Hanging there, it is rebuilt from the structure each time the structure
 * changes — another frame of a trajectory included, so the bonds forming along
 * a reaction path are found again at every step — and it goes with the
 * molecule when that is replaced.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import { StateTransformer } from 'molstar/lib/mol-state/index.js';
import { Task } from 'molstar/lib/mol-task/index.js';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition.js';

import { bondRadius } from '../../molstar/core/index.ts';
import type { RepresentationId } from '../core/settings.ts';

import type { PartialBondProps } from './partialBondShapes.ts';
import {
  createPartialBondRepresentation,
  partialBondScene,
} from './partialBondShapes.ts';
import { MOLECULE_STRUCTURE_REF } from './renderMolecule.ts';
import type { PartialBondStyle } from './viewerTypes.ts';

/** The partial bond node, replaced in place whenever the style changes. */
const PARTIAL_BONDS_REF = 'molecule3d-partial-bonds';

/**
 * A dash is thinner than a bond, so a partial bond never reads as a full one
 * seen end on.
 */
const DASH_RADIUS_SCALE = 0.5;

/**
 * Draw the partial bonds of the molecule on screen, or restyle them.
 * @param plugin - The molstar context.
 * @param style - See {@link PartialBondStyle}.
 * @returns Nothing; resolves once they are on screen.
 */
export async function renderPartialBonds(
  plugin: PluginContext,
  style: PartialBondStyle = {},
): Promise<void> {
  const {
    representation = 'ball-and-stick',
    sizeFactor = 1,
    lengths = true,
  } = style;
  if (!plugin.state.data.cells.has(MOLECULE_STRUCTURE_REF)) return;
  await plugin
    .build()
    .to(MOLECULE_STRUCTURE_REF)
    .applyOrUpdate(PARTIAL_BONDS_REF, PartialBonds3D, {
      radius: dashRadius(representation, sizeFactor),
      lengths,
    })
    .commit();
}

function dashRadius(representation: RepresentationId, sizeFactor: number) {
  return Math.max(
    0.02,
    bondRadius(representation, sizeFactor) * DASH_RADIUS_SCALE,
  );
}

const createTransformer = StateTransformer.builderFactory('react-cheminfo');

// Lowercased: molstar's parameter definitions are factories, not constructors.
const { Boolean: booleanParam, Numeric: numericParam } = PD;

/** The structure's partial bonds, as a representation of their own. */
const PartialBonds3D = createTransformer({
  name: 'molecule3d-partial-bonds-3d',
  display: 'Partial bonds',
  from: PluginStateObject.Molecule.Structure,
  to: PluginStateObject.Shape.Representation3D,
  params: {
    radius: numericParam(0.14, { min: 0.01, max: 1, step: 0.01 }),
    lengths: booleanParam(true),
  },
})({
  canAutoUpdate() {
    return true;
  },
  apply({ a, params }, plugin: PluginContext) {
    return Task.create('Partial bonds', async (runtime) => {
      const scene = partialBondScene(a.data);
      const repr = createPartialBondRepresentation({
        webgl: plugin.canvas3d?.webgl,
        ...plugin.representation.structure.themes,
      });
      await repr.createOrUpdate(reprProps(params), scene).runInContext(runtime);
      return new PluginStateObject.Shape.Representation3D(
        { repr, sourceData: scene },
        { label: 'Partial bonds' },
      );
    });
  },
  update({ a, b, newParams }) {
    return Task.create('Partial bonds', async (runtime) => {
      const scene = partialBondScene(a.data);
      await b.data.repr
        .createOrUpdate(reprProps(newParams), scene)
        .runInContext(runtime);
      b.data.sourceData = scene;
      return StateTransformer.UpdateResult.Updated;
    });
  },
});

function reprProps(params: {
  radius: number;
  lengths: boolean;
}): Partial<PartialBondProps> {
  return {
    radius: params.radius,
    visuals: params.lengths ? ['dashes', 'lengths'] : ['dashes'],
  };
}
