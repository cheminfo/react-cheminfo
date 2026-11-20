/**
 * The partial bonds of the structure on screen, as molstar draws them: each
 * one a dashed cylinder, each half in the colour of the atom it starts from as
 * a bond of the model is, with its length written over its middle.
 *
 * The pairs are found by `findPartialBonds`, from the atoms and the bonds
 * molstar itself drew, so a partial bond is never a bond molstar already has.
 */

import { addFixedCountDashedCylinder } from 'molstar/lib/mol-geo/geometry/mesh/builder/cylinder.js';
import { MeshBuilder } from 'molstar/lib/mol-geo/geometry/mesh/mesh-builder.js';
import { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh.js';
import { TextBuilder } from 'molstar/lib/mol-geo/geometry/text/text-builder.js';
import { Text } from 'molstar/lib/mol-geo/geometry/text/text.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import { Shape } from 'molstar/lib/mol-model/shape.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import type { RepresentationContext } from 'molstar/lib/mol-repr/representation.js';
import { Representation } from 'molstar/lib/mol-repr/representation.js';
import type { ShapeGetter } from 'molstar/lib/mol-repr/shape/representation.js';
// Lowercased on import: it is a factory, not a constructor.
import { ShapeRepresentation as createShapeRepresentation } from 'molstar/lib/mol-repr/shape/representation.js';
import {
  ElementSymbolColors,
  elementSymbolColor,
} from 'molstar/lib/mol-theme/color/element-symbol.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { MarkerAction } from 'molstar/lib/mol-util/marker-action.js';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition.js';

import { bondLimit } from '../../molstar/bonds/bondRule.ts';
import type { PartialBond } from '../core/partialBonds.ts';
import { findPartialBonds } from '../core/partialBonds.ts';

import { structureGeometry } from './structureGeometry.ts';

/** The partial bonds of one structure, and the atoms they join. */
export interface PartialBondScene {
  /** The element of each atom, uppercase as molstar's colours name them. */
  readonly elements: readonly string[];
  /** x, y and z of each atom in turn, Å. */
  readonly coordinates: Float64Array;
  /** The partial bonds, by atom index. */
  readonly bonds: readonly PartialBond[];
}

/**
 * The partial bonds of a structure, between the atoms molstar draws in it.
 * @param structure - The structure on screen.
 * @returns The bonds, with the atoms they need to be drawn.
 */
export function partialBondScene(structure: Structure): PartialBondScene {
  const geometry = structureGeometry(structure);
  const elements: string[] = [];
  for (let atom = 0; atom < geometry.elements.length; atom++) {
    elements.push((geometry.elements[atom] ?? '').toUpperCase());
  }
  return {
    elements,
    coordinates: geometry.coordinates,
    bonds: findPartialBonds(geometry, { bondLimit }),
  };
}

// Lowercased: molstar's parameter definitions are factories, not constructors.
const {
  Boolean: booleanParam,
  Color: colorParam,
  MultiSelect: multiSelectParam,
  Numeric: numericParam,
} = PD;

/** How the partial bonds are drawn. */
export const PartialBondParams = {
  ...Mesh.Params,
  ...Text.Params,
  /** Radius of the dashes, Å. */
  radius: numericParam(0.14, { min: 0.01, max: 1, step: 0.01 }),
  textColor: colorParam(Color.fromHexStyle('#1f2937')), // tokens-ok: a scene colour
  textSize: numericParam(0.36, { min: 0.1, max: 10, step: 0.1 }),
  // On a pale card, as the crystal viewer writes its labels: written straight
  // over the dashes, the digits are read as part of them.
  background: booleanParam(true),
  backgroundMargin: numericParam(0.2, { min: 0, max: 1, step: 0.01 }),
  backgroundColor: colorParam(Color.fromHexStyle('#ffffff')), // tokens-ok: a scene colour
  backgroundOpacity: numericParam(0.85, { min: 0, max: 1, step: 0.01 }),
  // In front of the dashes, as the measurement labels are.
  offsetZ: numericParam(0.75, { min: 0, max: 10, step: 0.1 }),
  visuals: multiSelectParam(
    ['dashes', 'lengths'],
    [
      ['dashes', 'Dashes'],
      ['lengths', 'Lengths'],
    ],
  ),
};

/** Values of {@link PartialBondParams}. */
export type PartialBondProps = PD.Values<typeof PartialBondParams>;

/**
 * The representation drawing the dashes and, when asked, their lengths.
 * @param context - molstar's representation context.
 * @returns The representation; `createOrUpdate` it with a {@link PartialBondScene}.
 */
export function createPartialBondRepresentation(
  context: RepresentationContext,
): Representation<PartialBondScene, typeof PartialBondParams> {
  return Representation.createMulti(
    'Partial bonds',
    context,
    () => PartialBondParams,
    Representation.StateBuilder,
    {
      dashes: () => createShapeRepresentation(dashesShape, Mesh.Utils),
      lengths: () =>
        createShapeRepresentation(lengthsShape, Text.Utils, {
          modifyState: (state) => ({
            ...state,
            markerActions: MarkerAction.None,
          }),
        }),
    },
  );
}

const dashesShape: ShapeGetter<
  PartialBondScene,
  Mesh,
  typeof PartialBondParams
> = (_context, scene, props, shape) => {
  const state = MeshBuilder.createState(1024, 512, shape?.geometry);
  const start = Vec3.zero();
  const end = Vec3.zero();
  const cylinder = {
    radiusTop: props.radius,
    radiusBottom: props.radius,
    radialSegments: 16,
    topCap: true,
    bottomCap: true,
  };
  const { bonds, coordinates } = scene;
  for (let index = 0; index < bonds.length; index++) {
    const bond = bonds[index];
    if (bond === undefined) continue;
    position(start, coordinates, bond.first);
    position(end, coordinates, bond.second);
    const dashes = dashCount(bond.distance);
    // Each half from its own atom, as molstar draws the halves of a bond.
    state.currentGroup = index * 2;
    addFixedCountDashedCylinder(state, start, end, 0.5, dashes, true, cylinder);
    state.currentGroup = index * 2 + 1;
    addFixedCountDashedCylinder(state, end, start, 0.5, dashes, true, cylinder);
  }
  return Shape.create(
    'Partial bonds',
    scene,
    MeshBuilder.getMesh(state),
    (group) => halfColor(scene, group),
    () => 1,
    (group) => bondLabel(scene, Math.floor(group / 2)),
    undefined,
    bonds.length * 2,
  );
};

const lengthsShape: ShapeGetter<
  PartialBondScene,
  Text,
  typeof PartialBondParams
> = (_context, scene, props, shape) => {
  const builder = TextBuilder.create(props, 64, 32, shape?.geometry);
  const start = Vec3.zero();
  const end = Vec3.zero();
  const { bonds, coordinates } = scene;
  for (let index = 0; index < bonds.length; index++) {
    const bond = bonds[index];
    if (bond === undefined) continue;
    position(start, coordinates, bond.first);
    position(end, coordinates, bond.second);
    Vec3.add(start, start, end);
    Vec3.scale(start, start, 0.5);
    const x = start[0] ?? 0;
    const y = start[1] ?? 0;
    const z = start[2] ?? 0;
    builder.add(lengthText(bond.distance), x, y, z, 1, 1, index);
  }
  return Shape.create(
    'Partial bond lengths',
    scene,
    builder.getText(),
    () => props.textColor,
    () => props.textSize,
    (group) => bondLabel(scene, group),
    undefined,
    bonds.length,
  );
};

/**
 * What a length reads, as molstar writes the distances it measures.
 * @param distance - In ångström.
 * @returns E.g. `2.27 Å`.
 */
function lengthText(distance: number): string {
  return `${distance.toFixed(2)} Å`;
}

// Dashes along one half, under 0.2 Å each and never fewer than four: an even
// count, so every dash has its full length.
function dashCount(distance: number): number {
  return Math.max(4, 2 * Math.round(distance / 0.8));
}

function position(out: Vec3, coordinates: Float64Array, atom: number): void {
  Vec3.set(
    out,
    coordinates[atom * 3] ?? 0,
    coordinates[atom * 3 + 1] ?? 0,
    coordinates[atom * 3 + 2] ?? 0,
  );
}

function halfColor(scene: PartialBondScene, group: number): Color {
  const bond = scene.bonds[Math.floor(group / 2)];
  const atom = group % 2 === 0 ? bond?.first : bond?.second;
  const element = atom === undefined ? '' : (scene.elements[atom] ?? '');
  return elementSymbolColor(
    ElementSymbolColors,
    element as Parameters<typeof elementSymbolColor>[1],
  );
}

// `C1–C6 2.27 Å`: the atoms numbered as in the file.
function bondLabel(scene: PartialBondScene, index: number): string {
  const bond = scene.bonds[index];
  if (bond === undefined) return 'Partial bond';
  const { first, second, distance } = bond;
  const atom = (at: number) => `${symbolOf(scene.elements[at] ?? '')}${at + 1}`;
  return `${atom(first)}–${atom(second)} ${lengthText(distance)}`;
}

// `CL` as it is written, `Cl`.
function symbolOf(element: string): string {
  return element.charAt(0) + element.slice(1).toLowerCase();
}
